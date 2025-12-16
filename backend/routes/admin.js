import express from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { 
  uploadSetupVideo, 
  uploadProjectCode, 
  uploadProjectAssets 
} from '../upload/projectUpload.js'; 
import fs from 'fs/promises'; 
import path from 'path';

const router = express.Router();

// --- (HELPER FUNCTION) ---
const createDeliveryFile = async (projectId, file, fileType) => {
  return prisma.deliveryFile.create({
    data: {
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      fileType: fileType, // "Video", "Code", or "Asset"
      project: { connect: { id: projectId } }
    }
  });
};

// --- (EXISTING) Custom Project Delivery Routes ---
router.post('/projects/upload-video/:projectId', verifyToken, uploadSetupVideo, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/projects/upload-video: HIT`);
  const { projectId } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No video file uploaded.' });

  try {
    await createDeliveryFile(projectId, file, 'Video');
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'Delivered' }
    });
    res.status(200).json({ message: 'Setup video uploaded successfully.' });
  } catch (error) {
    console.error("Database: FAILED to upload video file.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
router.post('/projects/upload-code/:projectId', verifyToken, uploadProjectCode, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/projects/upload-code: HIT`);
  const { projectId } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No code file (ZIP/RAR) uploaded.' });

  try {
    await createDeliveryFile(projectId, file, 'Code');
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'Delivered' }
    });
    res.status(200).json({ message: 'Project code uploaded successfully.' });
  } catch (error) {
    console.error("Database: FAILED to upload code file.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
router.post('/projects/upload-assets/:projectId', verifyToken, uploadProjectAssets, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/projects/upload-assets: HIT`);
  const { projectId } = req.params;
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No asset files uploaded.' });
  }

  try {
    for (const file of files) {
      await createDeliveryFile(projectId, file, 'Asset');
    }
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'Delivered' }
    });
    res.status(200).json({ message: `${files.length} assets uploaded successfully.` });
  } catch (error)
 {
    console.error("Database: FAILED to upload assets.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// --- (NEW) PREBUILT PORTFOLIO File Upload Routes ---
const updatePortfolioFile = async (projectId, file, fieldName) => {
  const filePath = `/uploads/${file.filename}`;
  return prisma.portfolioProject.update({
    where: { id: projectId },
    data: { [fieldName]: filePath }
  });
};
router.post('/portfolio/upload-video/:projectId', verifyToken, uploadSetupVideo, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/portfolio/upload-video: HIT`);
  const { projectId } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No video file uploaded.' });
  try {
    await updatePortfolioFile(projectId, file, 'setupVideoUrl');
    res.status(200).json({ message: 'Portfolio setup video uploaded!' });
  } catch (error) {
    console.error("Database: FAILED to upload portfolio video.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
router.post('/portfolio/upload-code/:projectId', verifyToken, uploadProjectCode, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/portfolio/upload-code: HIT`);
  const { projectId } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No code file uploaded.' });
  try {
    await updatePortfolioFile(projectId, file, 'projectCodeUrl');
    res.status(200).json({ message: 'Portfolio project code uploaded!' });
  } catch (error) {
    console.error("Database: FAILED to upload portfolio code.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
router.post('/portfolio/upload-assets/:projectId', verifyToken, uploadProjectAssets, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/portfolio/upload-assets: HIT`);
  const { projectId } = req.params;
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No asset files uploaded.' });
  }
  try {
    const filePaths = files.map(file => `/uploads/${file.filename}`);
    const project = await prisma.portfolioProject.findUnique({
      where: { id: projectId },
      select: { assetUrls: true }
    });
    const updatedAssets = [...(project.assetUrls || []), ...filePaths];
    await prisma.portfolioProject.update({
      where: { id: projectId },
      data: { assetUrls: updatedAssets }
    });
    res.status(200).json({ message: `${files.length} portfolio assets uploaded!` });
  } catch (error) {
    console.error("Database: FAILED to upload portfolio assets.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// --- USER MANAGEMENT ---
router.get('/pending-users', verifyToken, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/pending-users: HIT`);
  try {
    console.log("Database: Attempting to fetch pending users...");
    const pendingUsers = await prisma.user.findMany({
      where: { status: 'Pending' },
      select: { id: true, email: true, contact: true, createdAt: true }, 
    });
    console.log(`Database: SUCCESS! Found ${pendingUsers.length} pending users.`);
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Database: FAILED to fetch pending users.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
router.patch('/approve-user/:userId', verifyToken, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/approve-user: HIT`);
  const { userId } = req.params;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'Active' }, 
    });
    res.status(200).json({
      message: 'User approved successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error("Database: FAILED to approve user.", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// --- CUSTOM PROJECT MANAGEMENT ---
router.get('/projects', verifyToken, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/projects: HIT`);
  try {
    console.log("Database: Attempting to fetch all projects...");
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, contact: true } 
        }
      }
    });
    console.log(`Database: SUCCESS! Found ${projects.length} projects.`);
    res.status(200).json(projects);
  } catch (error) {
    console.error("Database: FAILED to fetch projects.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
router.patch('/projects/status/:projectId', verifyToken, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/projects/status: HIT`);
  const { projectId } = req.params;
  const { status } = req.body;
  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status: status },
    });
    res.status(200).json({
      message: 'Project status updated successfully.',
      project: updatedProject,
    });
  } catch (error) {
    console.error("Database: FAILED to update project status.", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
});
router.patch('/projects/send-quote/:projectId', verifyToken, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/projects/send-quote: HIT`);
  const { projectId } = req.params;
  const { finalQuote } = req.body; 
  if (!finalQuote || finalQuote <= 0) {
    return res.status(400).json({ message: 'A valid quote amount is required.' });
  }
  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { 
        finalQuote: parseInt(finalQuote, 10),
        status: "Quote Sent - Awaiting 50% Payment",
        paymentStatus: "Pending 50%"
      },
    });
    res.status(200).json({
      message: 'Quote sent successfully. Awaiting 50% payment from user.',
      project: updatedProject,
    });
  } catch (error) {
    console.error("Database: FAILED to send quote.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
router.patch('/projects/update-progress/:projectId', verifyToken, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/projects/update-progress: HIT`);
  const { projectId } = req.params;
  const { completionPercentage } = req.body; 
  const percentage = parseInt(completionPercentage, 10);
  if (completionPercentage == null || percentage < 0 || percentage > 100) {
    return res.status(400).json({ message: 'A valid percentage (0-100) is required.' });
  }
  try {
    let newStatus;
    if (percentage === 100) {
      newStatus = "Awaiting Final Payment";
    } else {
      newStatus = "In Progress";
    }
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { 
        completionPercentage: percentage,
        status: newStatus 
      },
    });
    res.status(200).json({
      message: 'Project progress updated.',
      project: updatedProject,
    });
  } catch (error) {
    console.error("Database: FAILED to update progress.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// --- PORTFOLIO BUY REQUESTS ---
router.get('/buy-requests', verifyToken, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/buy-requests: HIT`);
  try {
    console.log("Database: Attempting to fetch buy requests...");
    const requests = await prisma.buyRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, contact: true } }
      }
    });
    console.log(`Database: SUCCESS! Found ${requests.length} buy requests.`);
    res.status(200).json(requests);
  } catch (error) {
    console.error("Database: FAILED to fetch buy requests.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// --- GET ALL PAYMENT RECORDS ---
router.get('/payments', verifyToken, async (req, res) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] Route /api/admin/payments: HIT`);
  try {
    console.log("Database: Attempting to fetch payments...");
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        project: { select: { projectName: true } }
      }
    });
    console.log(`Database: SUCCESS! Found ${payments.length} payments.`);
    res.status(200).json(payments);
  } catch (error) {
    console.error("Database: FAILED to fetch payments.", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;