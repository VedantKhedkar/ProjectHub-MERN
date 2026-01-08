import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import projectUpload from '../upload/projectUpload.js'; 
import crypto from 'crypto';

// ✅ Import Mongoose Models
import Project from '../models/Project.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import BuyRequest from '../models/BuyRequest.js';
import PortfolioProject from '../models/PortfolioProject.js';

const router = express.Router();

// ------------------------------------------------------------------
// 1. CREATE CUSTOM PROJECT REQUEST
// ------------------------------------------------------------------
router.post('/', verifyToken, projectUpload, async (req, res) => {
  const projectData = req.body;
  const files = req.files; 
  const userIdFromToken = req.userId;

  try {
    let attachmentPaths = [];
    if (files && files.length > 0) {
      attachmentPaths = files.map(file => file.path); 
    }

    const standardKeys = [
      'projectName', 'projectSummary', 'projectDetails', 
      'budgetEstimate', 'completionDate', 'contactName', 
      'contactDetails', 'category', 'attachments'
    ];

    let specificDetailsString = '';
    Object.keys(projectData).forEach(key => {
      if (!standardKeys.includes(key) && projectData[key]) {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        specificDetailsString += `\n- ${label}: ${projectData[key]}`;
      }
    });

    const fullDetails = `${projectData.projectDetails}\n\n--- SPECIFIC REQUIREMENTS ---${specificDetailsString}`;

    // ✅ Mongoose create logic
    const newProject = await Project.create({
      projectName: projectData.projectName,
      projectSummary: projectData.projectSummary,
      projectDetails: fullDetails, 
      budgetEstimate: projectData.budgetEstimate,
      completionDate: new Date(projectData.completionDate),
      contactName: projectData.contactName,
      contactDetails: projectData.contactDetails,
      attachments: attachmentPaths,
      status: "Pending Admin Review",
      userId: userIdFromToken // Mongoose stores ID directly
    });

    res.status(201).json({
      message: 'Project request submitted successfully. Files uploaded to Cloud.',
      project: newProject,
    });
  } catch (error) {
    console.error('Project Submission Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ------------------------------------------------------------------
// 2. GET MY PROJECTS
// ------------------------------------------------------------------
router.get('/my-projects', verifyToken, async (req, res) => {
  const userIdFromToken = req.userId;
  try {
    // ✅ find replaces findMany, populate replaces include
    const myProjects = await Project.find({ userId: userIdFromToken })
      .populate({
        path: 'payments',
        options: { sort: { createdAt: 1 } }
      })
      .populate('deliveryFiles')
      .sort({ createdAt: -1 });

    res.status(200).json(myProjects);
  } catch (error) {
    console.error('Get My Projects Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ------------------------------------------------------------------
// 3. GET SINGLE PROJECT (User or Admin)
// ------------------------------------------------------------------
router.get('/my-project/:projectId', verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const userIdFromToken = req.userId;
  try {
    // ✅ findOne replaces findFirst
    let project = await Project.findOne({
        _id: projectId,
        userId: userIdFromToken, 
    }).populate('payments').populate('deliveryFiles');

    if (!project) {
      // Check if Admin
      const adminUser = await User.findById(userIdFromToken);
      if (adminUser && adminUser.email === 'admin@projecthub.com') {
        project = await Project.findById(projectId)
          .populate('deliveryFiles')
          .populate('payments'); 
      }
    }

    if (!project) {
      return res.status(404).json({ message: 'Project not found or you do not have access.' });
    }
    
    res.status(200).json(project);
  } catch (error) {
    console.error('Get Single Project Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ------------------------------------------------------------------
// 4. BUY PORTFOLIO PROJECT (Inquiry)
// ------------------------------------------------------------------
router.post('/buy', verifyToken, async (req, res) => {
  const { projectId, projectName } = req.body;
  const userIdFromToken = req.userId;
  try {
    const newBuyRequest = await BuyRequest.create({
      projectId: projectId, 
      projectName: projectName,
      userId: userIdFromToken,
    });
    res.status(201).json({
      message: `Buy request for ${projectName} submitted successfully.`,
      request: newBuyRequest,
    });
  } catch (error) {
    console.error('Buy Request Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ------------------------------------------------------------------
// 5. CONFIRM PAYMENT (Custom Projects)
// ------------------------------------------------------------------
router.post('/confirm-payment/:projectId', verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const { paymentType, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body; 

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
     return res.status(400).json({ message: 'Payment verification failed.' });
  }
  
  try {
    const project = await Project.findById(projectId);
    if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
    }

    let newStatus = {};
    let amountInPaise = 0;
    
    if (paymentType === 'Initial_50') {
      newStatus = { paymentStatus: '50% Paid', status: 'In Progress' };
      amountInPaise = (project.finalQuote / 2) * 100;
    } else if (paymentType === 'Final_100') {
      newStatus = { paymentStatus: '100% Paid', status: 'Delivered' };
      amountInPaise = (project.finalQuote / 2) * 100;
    }

    // ✅ findByIdAndUpdate replaces update
    const updatedProject = await Project.findByIdAndUpdate(projectId, newStatus, { new: true });
    
    const newPayment = await Payment.create({
      razorpayPaymentId: razorpay_payment_id, 
      razorpayOrderId: razorpay_order_id,
      amount: amountInPaise,
      paymentType: paymentType,
      status: 'Success',
      userId: req.userId,
      projectId: projectId,
    });

    res.status(200).json({
      message: `Payment confirmed.`,
      paymentId: newPayment.razorpayPaymentId, 
      project: updatedProject,
    });
  } catch (error) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ------------------------------------------------------------------
// 6. GET MY PAYMENTS
// ------------------------------------------------------------------
router.get('/my-payments', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId })
      .populate('projectId', 'projectName')
      .sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ------------------------------------------------------------------
// 7. GET MY PURCHASES (Prebuilt/Portfolio)
// ------------------------------------------------------------------
router.get('/my-purchases', verifyToken, async (req, res) => {
  try {
    // ✅ $ne replaces not: null
    const successfulPayments = await Payment.find({
      userId: req.userId,
      paymentType: 'Prebuilt_100',
      status: 'Success',
      portfolioProjectId: { $ne: null }
    }).select('portfolioProjectId');

    if (successfulPayments.length === 0) return res.status(200).json([]);

    const purchasedProjectIds = [...new Set(successfulPayments.map(p => p.portfolioProjectId))];

    // ✅ $in replaces in: [...]
    const purchasedProjects = await PortfolioProject.find({
      _id: { $in: purchasedProjectIds }
    });
    
    res.status(200).json(purchasedProjects);

  } catch (error) {
    console.error('Get My Purchases Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;