import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { verifyToken } from '../middleware/verifyToken.js';
import prisma from '../lib/prisma.js';
import PDFDocument from 'pdfkit'; 

const router = express.Router();

// --- 1. INITIALIZE RAZORPAY INSTANCE ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// --- 2. CREATE ORDER ROUTE ---
// This route now accepts 'amountInRupees' and 'portfolioProjectId'
router.post('/create-order', verifyToken, async (req, res) => {
  // --- MODIFIED: We now accept a direct amount in Rupees ---
  const { amountInRupees, projectId, portfolioProjectId, paymentType } = req.body; 

  try {
    const receiptId = `proj_${paymentType}_${new Date().getTime()}`; 
    const amountInPaise = Math.round(amountInRupees * 100); // Convert Rupees to Paise

    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount.' });
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId, 
      notes: {
        // Store whichever ID is relevant
        projectId: projectId || null, 
        portfolioProjectId: portfolioProjectId || null,
        userId: req.userId,
        paymentType: paymentType,
      }
    };
    
    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).json({ message: 'Error creating Razorpay order.' });
    }
    res.status(200).json(order);

  } catch (error) {
    console.error('Create Order Error:', error);
    if (error.error) {
      console.error(error.error);
      return res.status(500).json({ message: `Razorpay error: ${error.error.description}` });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// --- 3. VERIFY PAYMENT ROUTE (MODIFIED) ---
router.post('/verify-payment', verifyToken, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    notes, // We get our notes back from the order
  } = req.body;

  const { projectId, portfolioProjectId, paymentType, userId } = notes;

  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // --- PAYMENT IS VERIFIED ---
      
      let amountInPaise = 0;
      let portfolioProjectName = null;

      // --- Handle Custom Project Payment ---
      if (paymentType === 'Initial_50' || paymentType === 'Final_100') {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new Error('Associated project not found.');
        
        let newStatus = {};
        if (paymentType === 'Initial_50') {
          newStatus = { paymentStatus: '50% Paid', status: 'In Progress' };
          amountInPaise = (project.finalQuote / 2) * 100;
        } else {
          newStatus = { paymentStatus: '100% Paid', status: 'Delivered' };
          amountInPaise = (project.finalQuote / 2) * 100;
        }
        await prisma.project.update({ where: { id: projectId }, data: newStatus });
      
      // --- Handle Prebuilt Project Payment (NEW) ---
      } else if (paymentType === 'Prebuilt_100') {
        const portfolioProject = await prisma.portfolioProject.findUnique({ where: { id: portfolioProjectId } });
        if (!portfolioProject) throw new Error('Associated portfolio project not found.');
        
        // Price is stored as "INR 50,000" or "50000". We need to parse it.
        const priceString = portfolioProject.price.replace(/[^0-9]/g, '');
        amountInPaise = parseInt(priceString, 10) * 100;
        portfolioProjectName = portfolioProject.name;
        
        // No status update needed for the portfolio project itself, just log the payment.
      } else {
        throw new Error('Invalid payment type during verification.');
      }

      // Create a Payment Log Entry
      const newPayment = await prisma.payment.create({
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          amount: amountInPaise,
          paymentType: paymentType,
          status: 'Success',
          userId: userId,
          projectId: projectId || null, // Link to custom project if it exists
          portfolioProjectId: portfolioProjectId || null, // Link to prebuilt ID
          portfolioProjectName: portfolioProjectName || null, // Store name
        }
      });

      res.status(200).json({
        message: 'Payment verified successfully. Project status updated.',
        paymentId: razorpay_payment_id,
      });

    } else {
      res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
});


// --- 4. GENERATE PDF RECEIPT ROUTE (MODIFIED) ---
router.get('/receipt/:paymentId', verifyToken, async (req, res) => {
  const { paymentId } = req.params;
  const userIdFromToken = req.userId;

  try {
    const payment = await prisma.payment.findUnique({
      where: { razorpayPaymentId: paymentId },
      include: {
        user: { select: { email: true } },
        project: { select: { projectName: true } } // For custom projects
      }
    });

    // Security Check
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }
    // Admin check (allow admin to view any receipt)
    const adminUser = await prisma.user.findUnique({ where: { id: userIdFromToken } });
    const isAdmin = adminUser && adminUser.email === 'admin@projecthub.com';
    
    if (payment.userId !== userIdFromToken && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You do not have access to this receipt.' });
    }

    // --- PDF Generation ---
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `receipt-${payment.razorpayPaymentId}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // ... (Your existing PDF styling code) ...
    // ... (Your existing PDF styling code) ...
    const pageTop = 50;
    const leftX = 50;
    const rightMarginX = 550;
    const primaryColor = '#06b6d4';
    const headerColor = '#111827';
    const textColor = '#374151';
    const lightBgColor = '#f0f9ff';
    const lightBorderColor = '#e0e0e0';

    function drawLine(y, color = lightBorderColor) {
      doc.moveTo(leftX, y).lineTo(rightMarginX, y).lineWidth(0.5).strokeColor(color).stroke();
    }

    doc.fontSize(24).fillColor(primaryColor).font('Helvetica-Bold').text('ProjectHub', leftX, pageTop);
    doc.fontSize(10).fillColor(textColor).font('Helvetica').text('admin@projecthub.com', leftX, pageTop + 30);
    doc.fontSize(24).fillColor(headerColor).font('Helvetica-Bold').text('INVOICE', leftX, pageTop, { align: 'right' });
    doc.fontSize(10).fillColor(textColor).font('Helvetica').text(`Payment ID: ${payment.razorpayPaymentId}`, leftX, pageTop + 30, { align: 'right' });
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`, leftX, pageTop + 45, { align: 'right' });

    const infoBoxY = 150;
    doc.rect(leftX, infoBoxY, 500, 50).fill(lightBgColor);
    doc.fontSize(11).fillColor(headerColor).font('Helvetica-Bold').text("CUSTOMER'S INFORMATION", leftX + 15, infoBoxY + 10);
    doc.fontSize(10).fillColor(textColor).font('Helvetica').text(payment.user.email, leftX + 15, infoBoxY + 28);
    
    const tableTop = 240;
    doc.font('Helvetica-Bold').fillColor(headerColor).fontSize(12);
    doc.text('DESCRIPTION', leftX + 10, tableTop);
    doc.text('TYPE', 350, tableTop, {width: 100});
    doc.text('AMOUNT (INR)', leftX, tableTop, { align: 'right' });
    doc.moveDown(0.5);
    drawLine(doc.y);
    
    doc.moveDown(1);
    
    // --- Get Project Name (works for custom or prebuilt) ---
    const projectName = payment.project?.projectName || payment.portfolioProjectName || 'Prebuilt Project';
    
    const itemY = doc.y;
    doc.font('Helvetica').fillColor(textColor).fontSize(11);
    doc.text(`Payment for: ${projectName}`, leftX + 10, itemY, { width: 250 });
    doc.text(payment.paymentType, 350, itemY, { width: 100 });
    doc.text(`INR ${payment.amount / 100}`, leftX, itemY, { align: 'right' }); 
    
    doc.moveDown(3);
    drawLine(doc.y);
    doc.moveDown(1);

    const totalY = doc.y;
    doc.font('Helvetica-Bold').fontSize(16).fillColor(headerColor);
    doc.text('Total Paid:', 350, totalY + 20, { align: 'left', width: 100 });
    doc.text(`INR ${payment.amount / 100}`, leftX, totalY + 20, { align: 'right' }); 
    
    doc.fontSize(10).font('Helvetica').fillColor('#9CA3AF').text('Thank you for your business! This is an auto-generated receipt.', 50, 700, { align: 'center' });
    
    doc.end();

  } catch (error) {
    console.error('Receipt Generation Error:', error);
    res.status(500).json({ message: 'Error generating PDF receipt.' });
  }
});

export default router;