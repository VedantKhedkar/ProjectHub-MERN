import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import PortfolioProject from '../models/PortfolioProject.js';
import DeliveryFile from '../models/DeliveryFile.js'; // You'll need to create this model
import BuyRequest from '../models/BuyRequest.js';
import Payment from '../models/Payment.js';
import { 
  uploadSetupVideo, 
  uploadProjectCode, 
  uploadProjectAssets 
} from '../upload/projectUpload.js'; 

const router = express.Router();

// --- (HELPER FUNCTION) ---
// Save the Cloudinary Link to the DeliveryFile collection
const createDeliveryFile = async (projectId, filename, url, fileType) => {
  return await DeliveryFile.create({
    filename,
    url,
    fileType,
    projectId // In Mongoose, we store the ID directly
  });
};

// ==========================================
// 1. CUSTOM PROJECT DELIVERY ROUTES
// ==========================================

router.post('/projects/upload-video/:projectId', verifyToken, uploadSetupVideo, async (req, res) => {
  const { projectId } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No video file uploaded.' });

  try {
    const cloudLink = file.path;
    await createDeliveryFile(projectId, file.originalname, cloudLink, 'Video');
    
    await Project.findByIdAndUpdate(projectId, { status: 'Delivered' });
    
    res.status(200).json({ message: 'Setup video uploaded successfully.', link: cloudLink });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/projects/upload-code/:projectId', verifyToken, uploadProjectCode, async (req, res) => {
  const { projectId } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No code file uploaded.' });

  try {
    const cloudLink = file.path;
    await createDeliveryFile(projectId, file.originalname, cloudLink, 'Code');
    await Project.findByIdAndUpdate(projectId, { status: 'Delivered' });

    res.status(200).json({ message: 'Project code uploaded successfully.', link: cloudLink });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ==========================================
// 2. PREBUILT PORTFOLIO UPLOAD ROUTES
// ==========================================

router.post('/portfolio/upload-assets/:projectId', verifyToken, uploadProjectAssets, async (req, res) => {
  const { projectId } = req.params;
  const files = req.files;
  if (!files || files.length === 0) return res.status(400).json({ message: 'No asset files uploaded.' });

  try {
    const newLinks = files.map(file => file.path);
    
    // Mongoose "$push" with "$each" allows adding multiple items to an array at once
    await PortfolioProject.findByIdAndUpdate(projectId, {
      $push: { assetUrls: { $each: newLinks } }
    });

    res.status(200).json({ message: `${files.length} portfolio assets uploaded!` });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ==========================================
// 3. USER MANAGEMENT
// ==========================================
router.get('/pending-users', verifyToken, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'Pending' })
      .select('email contact createdAt'); 
    res.status(200).json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.patch('/approve-user/:userId', verifyToken, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId, 
      { status: 'Active' }, 
      { new: true }
    );
    res.status(200).json({ message: 'User approved successfully.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ==========================================
// 4. CUSTOM PROJECT MANAGEMENT
// ==========================================
router.get('/projects', verifyToken, async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'email contact'); // Mongoose uses populate instead of include
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.patch('/projects/send-quote/:projectId', verifyToken, async (req, res) => {
  const { finalQuote } = req.body; 
  if (!finalQuote || finalQuote <= 0) return res.status(400).json({ message: 'Invalid quote.' });

  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.projectId, { 
      finalQuote: parseInt(finalQuote, 10),
      status: "Quote Sent - Awaiting 50% Payment",
      paymentStatus: "Pending 50%"
    }, { new: true });
    res.status(200).json({ message: 'Quote sent.', project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ==========================================
// 5. OTHER ROUTES (Buy Requests, Payments)
// ==========================================
router.get('/buy-requests', verifyToken, async (req, res) => {
  try {
    const requests = await BuyRequest.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'email contact');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/payments', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'email')
      .populate('projectId', 'projectName');
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;