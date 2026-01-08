import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { verifyToken } from '../middleware/verifyToken.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import PortfolioProject from '../models/PortfolioProject.js';
import Payment from '../models/Payment.js';
import PDFDocument from 'pdfkit'; 

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- 1. CREATE ORDER ---
router.post('/create-order', verifyToken, async (req, res) => {
  const { amountInRupees, projectId, portfolioProjectId, paymentType } = req.body; 

  try {
    const amountInPaise = Math.round(amountInRupees * 100);
    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount.' });
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`, 
      notes: {
        projectId: projectId || "", 
        portfolioProjectId: portfolioProjectId || "",
        userId: req.userId,
        paymentType: paymentType,
      }
    };
    
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating Razorpay order.' });
  }
});

// --- 2. VERIFY PAYMENT ---
router.post('/verify-payment', verifyToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, notes } = req.body;
  const { projectId, portfolioProjectId, paymentType, userId } = notes;

  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    let amountInPaise = 0;
    let portfolioProjectName = null;

    if (paymentType === 'Initial_50' || paymentType === 'Final_100') {
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found.');
      
      const updateData = paymentType === 'Initial_50' 
        ? { paymentStatus: '50% Paid', status: 'In Progress' }
        : { paymentStatus: '100% Paid', status: 'Delivered' };
      
      amountInPaise = (project.finalQuote / 2) * 100;
      await Project.findByIdAndUpdate(projectId, updateData);

    } else if (paymentType === 'Prebuilt_100') {
      const portfolioProject = await PortfolioProject.findById(portfolioProjectId);
      if (!portfolioProject) throw new Error('Portfolio project not found.');
      
      const priceString = portfolioProject.price.replace(/[^0-9]/g, '');
      amountInPaise = parseInt(priceString, 10) * 100;
      portfolioProjectName = portfolioProject.name;
    }

    // Save Payment Log
    await Payment.create({
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      amount: amountInPaise,
      paymentType,
      status: 'Success',
      userId,
      projectId: projectId || null,
      portfolioProjectId: portfolioProjectId || null,
      portfolioProjectName: portfolioProjectName || null,
    });

    res.status(200).json({ message: 'Payment verified.', paymentId: razorpay_payment_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 3. GENERATE RECEIPT ---
router.get('/receipt/:paymentId', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({ razorpayPaymentId: req.params.paymentId })
      .populate('userId', 'email')
      .populate('projectId', 'projectName');

    if (!payment) return res.status(404).json({ message: 'Payment record not found.' });

    // Authorization Check
    const user = await User.findById(req.userId);
    const isAdmin = user && user.email === 'admin@projecthub.com';
    if (payment.userId.toString() !== req.userId && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment.razorpayPaymentId}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#06b6d4').font('Helvetica-Bold').text('ProjectHub', 50, 50);
    doc.fontSize(24).fillColor('#111827').text('INVOICE', 50, 50, { align: 'right' });
    
    // Line item
    const projectName = payment.projectId?.projectName || payment.portfolioProjectName || 'Project Purchase';
    doc.fontSize(10).fillColor('#374151').text(`Customer: ${payment.userId.email}`, 50, 150);
    doc.text(`Description: ${projectName}`, 50, 250);
    doc.text(`Total: INR ${payment.amount / 100}`, 50, 270);
    
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Error generating PDF.' });
  }
});

export default router;