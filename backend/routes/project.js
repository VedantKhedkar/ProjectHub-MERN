import express from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/verifyToken.js';
import projectUpload from '../upload/projectUpload.js';
import crypto from 'crypto';

const router = express.Router();

// ... (existing POST /, GET /my-projects, GET /my-project/:projectId, POST /buy) ...
// ... (existing POST /, GET /my-projects, GET /my-project/:projectId, POST /buy) ...
// POST /api/projects
router.post('/', verifyToken, projectUpload, async (req, res) => {
  const projectData = req.body;
  const files = req.files; 
  const userIdFromToken = req.userId;
  try {
    let attachmentPaths = [];
    if (files && files.length > 0) {
      attachmentPaths = files.map(file => `/uploads/${file.filename}`);
    }
    const newProject = await prisma.project.create({
      data: {
        projectName: projectData.projectName,
        projectSummary: projectData.projectSummary,
        projectDetails: projectData.projectDetails,
        budgetEstimate: projectData.budgetEstimate,
        completionDate: new Date(projectData.completionDate),
        contactName: projectData.contactName,
        contactDetails: projectData.contactDetails,
        attachments: attachmentPaths, 
        user: { connect: { id: userIdFromToken } },
      },
    });
    res.status(201).json({
      message: 'Project request submitted successfully. Files saved locally.',
      project: newProject,
    });
  } catch (error) {
    console.error('Project Submission Error:', error);
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// GET /api/projects/my-projects
router.get('/my-projects', verifyToken, async (req, res) => {
  const userIdFromToken = req.userId;
  try {
    const myProjects = await prisma.project.findMany({
      where: { userId: userIdFromToken },
      include: {
        payments: {
          orderBy: { createdAt: 'asc' }
        },
        deliveryFiles: true // Include delivery files for custom projects
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(myProjects);
  } catch (error) {
    console.error('Get My Projects Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/projects/my-project/:projectId
router.get('/my-project/:projectId', verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const userIdFromToken = req.userId;
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userIdFromToken, 
      },
      include: {
        payments: true,
        deliveryFiles: true, 
      }
    });

    if (!project) {
      const adminUser = await prisma.user.findUnique({ where: { id: userIdFromToken } });
      if (adminUser && adminUser.email === 'admin@projecthub.com') {
        const adminProject = await prisma.project.findUnique({ 
          where: { id: projectId },
          include: { deliveryFiles: true, payments: true } 
        }); 
        if (adminProject) {
          return res.status(200).json(adminProject);
        }
      }
      return res.status(404).json({ message: 'Project not found or you do not have access.' });
    }
    
    res.status(200).json(project);
  } catch (error) {
    console.error('Get Single Project Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// POST /api/projects/buy
router.post('/buy', verifyToken, async (req, res) => {
  const { projectId, projectName } = req.body;
  const userIdFromToken = req.userId;
  try {
    // This just creates an "inquiry"
    const newBuyRequest = await prisma.buyRequest.create({
      data: {
        projectId: projectId, // This is the PortfolioProject ID
        projectName: projectName,
        user: { connect: { id: userIdFromToken } },
      },
    });
    res.status(201).json({
      message: `Buy request for ${projectName} submitted successfully. We will contact you shortly.`,
      request: newBuyRequest,
    });
  } catch (error) {
    console.error('Buy Request Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/projects/confirm-payment/:projectId
router.post('/confirm-payment/:projectId', verifyToken, async (req, res) => {
  const { projectId } = req.params; // This is the Custom Project ID
  const { paymentType, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body; 

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
     return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
  }
  
  try {
    let newStatus = {};
    let amountInPaise = 0;
    
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
        return res.status(404).json({ message: 'Project not found during verification.' });
    }

    if (paymentType === 'Initial_50') {
      newStatus = { paymentStatus: '50% Paid', status: 'In Progress' };
      amountInPaise = (project.finalQuote / 2) * 100;
    } else if (paymentType === 'Final_100') {
      newStatus = { paymentStatus: '100% Paid', status: 'Delivered' };
      amountInPaise = (project.finalQuote / 2) * 100;
    } else {
      return res.status(400).json({ message: 'Invalid payment type.' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: newStatus,
    });
    
    const newPayment = await prisma.payment.create({
        data: {
          razorpayPaymentId: razorpay_payment_id, 
          razorpayOrderId: razorpay_order_id,
          amount: amountInPaise,
          paymentType: paymentType,
          status: 'Success',
          userId: req.userId,
          projectId: projectId, // This is a Custom Project payment
        }
      });

    res.status(200).json({
      message: `Payment confirmed for ${paymentType}. Project status updated.`,
      paymentId: newPayment.razorpayPaymentId, 
      project: updatedProject,
    });
  } catch (error) {
    console.error('Confirm Payment Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// GET /api/projects/my-payments
router.get('/my-payments', verifyToken, async (req, res) => {
  const userIdFromToken = req.userId;
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: userIdFromToken },
      include: {
        project: { 
          select: { projectName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(payments);
  } catch (error) {
    console.error('Get My Payments Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// --- (NEW) GET MY PREBUILT PURCHASES ---
// GET /api/projects/my-purchases
router.get('/my-purchases', verifyToken, async (req, res) => {
  const userIdFromToken = req.userId;
  try {
    // 1. Find all successful "Prebuilt_100" payments for this user
    const successfulPayments = await prisma.payment.findMany({
      where: {
        userId: userIdFromToken,
        paymentType: 'Prebuilt_100',
        status: 'Success',
        portfolioProjectId: { not: null } // Ensure it's linked to a portfolio item
      },
      select: {
        portfolioProjectId: true
      }
    });

    if (successfulPayments.length === 0) {
      return res.status(200).json([]); // User hasn't bought anything
    }

    // 2. Get the unique IDs of the portfolio projects they bought
    const purchasedProjectIds = [
      ...new Set(successfulPayments.map(p => p.portfolioProjectId))
    ];

    // 3. Find those portfolio projects and return their full details
    const purchasedProjects = await prisma.portfolioProject.findMany({
      where: {
        id: { in: purchasedProjectIds }
      }
    });
    
    res.status(200).json(purchasedProjects);

  } catch (error) {
    console.error('Get My Purchases Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


export default router;