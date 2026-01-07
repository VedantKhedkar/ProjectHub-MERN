import express from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { 
  uploadSetupVideo, 
  uploadProjectCode, 
  uploadProjectAssets 
} from '../upload/projectUpload.js'; 
// REMOVED: import { uploadToDrive } from '../utils/googleDrive.js'; 

const router = express.Router();

// --- (HELPER FUNCTION) ---
// Save the Cloudinary Link to the DeliveryFile table
const createDeliveryFile = async (projectId, filename, url, fileType) => {
  return prisma.deliveryFile.create({
    data: {
      filename: filename,
      url: url, // Stores the Cloudinary Link
      fileType: fileType, // "Video", "Code", or "Asset"
      project: { connect: { id: projectId } }
    }
  });
};

// ==========================================
// 1. CUSTOM PROJECT DELIVERY ROUTES
// ==========================================

// Upload Setup Video
router.post('/projects/upload-video/:projectId', verifyToken, uploadSetupVideo, async (req, res) => {
  console.log(`--- Route /api/admin/projects/upload-video: HIT`);
  const { projectId } = req.params;
  const file = req.file;
  
  if (!file) return res.status(400).json({ message: 'No video file uploaded.' });

  try {
    // 1. Get Cloudinary Link (Middleware already uploaded it)
    const cloudLink = file.path;

    // 2. Save Link to Database
    await createDeliveryFile(projectId, file.originalname, cloudLink, 'Video');
    
    // 3. Update Status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'Delivered' }
    });
    
    res.status(200).json({ message: 'Setup video uploaded to Cloud successfully.', link: cloudLink });
  } catch (error) {
    console.error("Upload Failed:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Upload Project Code (Zip)
router.post('/projects/upload-code/:projectId', verifyToken, uploadProjectCode, async (req, res) => {
  console.log(`--- Route /api/admin/projects/upload-code: HIT`);
  const { projectId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'No code file (ZIP/RAR) uploaded.' });

  try {
    const cloudLink = file.path; // Cloudinary URL

    await createDeliveryFile(projectId, file.originalname, cloudLink, 'Code');
    
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'Delivered' }
    });

    res.status(200).json({ message: 'Project code uploaded to Cloud successfully.', link: cloudLink });
  } catch (error) {
    console.error("Upload Failed:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Upload Project Assets (Multiple Files)
router.post('/projects/upload-assets/:projectId', verifyToken, uploadProjectAssets, async (req, res) => {
  console.log(`--- Route /api/admin/projects/upload-assets: HIT`);
  const { projectId } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No asset files uploaded.' });
  }

  try {
    // Files are already uploaded to Cloudinary by middleware
    const savePromises = files.map((file) => {
        return createDeliveryFile(projectId, file.originalname, file.path, 'Asset');
    });

    await Promise.all(savePromises);

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'Delivered' }
    });

    res.status(200).json({ message: `${files.length} assets uploaded to Cloud successfully.` });
  } catch (error) {
    console.error("Upload Failed:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// ==========================================
// 2. PREBUILT PORTFOLIO UPLOAD ROUTES
// ==========================================

// Helper to update portfolio fields
const updatePortfolioFile = async (projectId, url, fieldName) => {
  return prisma.portfolioProject.update({
    where: { id: projectId },
    data: { [fieldName]: url } // Save the Cloudinary URL
  });
};

router.post('/portfolio/upload-video/:projectId', verifyToken, uploadSetupVideo, async (req, res) => {
  console.log(`--- Route /api/admin/portfolio/upload-video: HIT`);
  const { projectId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'No video file uploaded.' });

  try {
    const cloudLink = file.path;
    await updatePortfolioFile(projectId, cloudLink, 'setupVideoUrl');
    res.status(200).json({ message: 'Portfolio setup video uploaded!', link: cloudLink });
  } catch (error) {
    console.error("Upload Failed:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/portfolio/upload-code/:projectId', verifyToken, uploadProjectCode, async (req, res) => {
  console.log(`--- Route /api/admin/portfolio/upload-code: HIT`);
  const { projectId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'No code file uploaded.' });

  try {
    const cloudLink = file.path;
    await updatePortfolioFile(projectId, cloudLink, 'projectCodeUrl');
    res.status(200).json({ message: 'Portfolio project code uploaded!', link: cloudLink });
  } catch (error) {
    console.error("Upload Failed:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/portfolio/upload-assets/:projectId', verifyToken, uploadProjectAssets, async (req, res) => {
  console.log(`--- Route /api/admin/portfolio/upload-assets: HIT`);
  const { projectId } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No asset files uploaded.' });
  }

  try {
    // 1. Get new Cloudinary URLs
    const newLinks = files.map(file => file.path);

    // 2. Get existing assets and append new ones
    const project = await prisma.portfolioProject.findUnique({
      where: { id: projectId },
      select: { assetUrls: true }
    });
    
    const updatedAssets = [...(project.assetUrls || []), ...newLinks];

    // 3. Save updated list
    await prisma.portfolioProject.update({
      where: { id: projectId },
      data: { assetUrls: updatedAssets }
    });

    res.status(200).json({ message: `${files.length} portfolio assets uploaded!` });
  } catch (error) {
    console.error("Upload Failed:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// ==========================================
// 3. USER MANAGEMENT (Unchanged)
// ==========================================
router.get('/pending-users', verifyToken, async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { status: 'Pending' },
      select: { id: true, email: true, contact: true, createdAt: true }, 
    });
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.patch('/approve-user/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'Active' }, 
    });
    res.status(200).json({ message: 'User approved successfully.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ==========================================
// 4. CUSTOM PROJECT MANAGEMENT (Unchanged)
// ==========================================
router.get('/projects', verifyToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, contact: true } }
      }
    });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.patch('/projects/status/:projectId', verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;
  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status: status },
    });
    res.status(200).json({ message: 'Status updated.', project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.patch('/projects/send-quote/:projectId', verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const { finalQuote } = req.body; 
  if (!finalQuote || finalQuote <= 0) return res.status(400).json({ message: 'Invalid quote.' });

  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { 
        finalQuote: parseInt(finalQuote, 10),
        status: "Quote Sent - Awaiting 50% Payment",
        paymentStatus: "Pending 50%"
      },
    });
    res.status(200).json({ message: 'Quote sent.', project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.patch('/projects/update-progress/:projectId', verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const { completionPercentage } = req.body; 
  const percentage = parseInt(completionPercentage, 10);
  
  if (completionPercentage == null || percentage < 0 || percentage > 100) {
    return res.status(400).json({ message: 'Invalid percentage.' });
  }
  
  try {
    let newStatus = percentage === 100 ? "Awaiting Final Payment" : "In Progress";
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { completionPercentage: percentage, status: newStatus },
    });
    res.status(200).json({ message: 'Progress updated.', project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ==========================================
// 5. OTHER ROUTES (Buy Requests, Payments)
// ==========================================
router.get('/buy-requests', verifyToken, async (req, res) => {
  try {
    const requests = await prisma.buyRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, contact: true } } }
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/payments', verifyToken, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        project: { select: { projectName: true } }
      }
    });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;