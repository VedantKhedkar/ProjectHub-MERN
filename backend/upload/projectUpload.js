import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../utils/cloudinaryConfig.js'; // Ensure this path is correct

// --- Cloudinary Storage Configuration ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 1. Initialize default variables
    let folderName = 'projecthub_uploads';
    let resourceType = 'auto'; // 'auto' works for images/PDFs/Videos

    // 2. Logic to handle ZIP/RAR files (Must be 'raw')
    if (
      file.mimetype.includes('zip') || 
      file.mimetype.includes('rar') || 
      file.mimetype.includes('compressed') ||
      file.mimetype === 'application/octet-stream'
    ) {
      folderName = 'projecthub_code';
      resourceType = 'raw'; // CRITICAL: Zips must be 'raw' or download fails
    } 
    // 3. Logic to handle Videos
    else if (file.mimetype.startsWith('video/')) {
      folderName = 'projecthub_videos';
      resourceType = 'video';
    } 
    // 4. Logic for Images/PDFs
    else {
      folderName = 'projecthub_assets';
    }

    return {
      folder: folderName,
      resource_type: resourceType,
      // Create a unique filename (Cloudinary ignores extensions in public_id usually)
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`, 
    };
  },
});

// --- File Filters (Kept exactly as you had them) ---
const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only videos are allowed.'), false);
  }
};

const codeFilter = (req, file, cb) => {
  // Broad check for zip/rar types
  if (
    file.mimetype.includes('zip') || 
    file.mimetype.includes('rar') || 
    file.mimetype.includes('compressed') || 
    file.mimetype === 'application/octet-stream'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .zip or .rar files are allowed.'), false);
  }
};

const assetFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images or PDFs are allowed.'), false);
  }
};

// --- 1. Custom Project File Upload Handler (User) ---
const projectUpload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 50 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith('image/') || 
      file.mimetype === 'application/pdf' || 
      file.mimetype.includes('zip') || 
      file.mimetype.includes('rar') || 
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'), false);
    }
  }
}).array('attachments', 5);

// --- 2. Portfolio Image Upload Handler (Admin) ---
export const portfolioImageUpload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, 
  fileFilter: assetFilter,
}).array('portfolioImages', 5);

// --- 3. DELIVERY FILE UPLOAD HANDLERS (Admin) ---

// Handler for Setup Video (1 file, 200MB limit)
export const uploadSetupVideo = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 200 },
  fileFilter: videoFilter,
}).single('setupVideo');

// Handler for Project Code (1 file, 100MB limit)
export const uploadProjectCode = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter: codeFilter,
}).single('projectCode');

// Handler for Project Assets (Multiple files, 20MB limit)
export const uploadProjectAssets = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 20 },
  fileFilter: assetFilter,
}).array('projectAssets', 10);

export default projectUpload;