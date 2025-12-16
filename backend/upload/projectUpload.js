import multer from 'multer';
import path from 'path';

// --- Multer Disk Storage Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Use the original filename to keep it recognizable
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// --- File Filters ---
const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only videos are allowed.'), false);
  }
};

const codeFilter = (req, file, cb) => {
  if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed' || file.mimetype === 'application/x-rar-compressed') {
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
  limits: { fileSize: 1024 * 1024 * 50 }, 
  fileFilter: (req, file, cb) => { // General filter
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype === 'application/zip' || file.mimetype === 'video/mp4') {
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

// --- 3. (NEW) DELIVERY FILE UPLOAD HANDLERS (Admin) ---

// Handler for Setup Video (1 file, 200MB limit)
export const uploadSetupVideo = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 200 },
  fileFilter: videoFilter,
}).single('setupVideo'); // Expects a single file from a field named 'setupVideo'

// Handler for Project Code (1 file, 100MB limit)
export const uploadProjectCode = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter: codeFilter,
}).single('projectCode'); // Expects a single file from 'projectCode'

// Handler for Project Assets (Multiple files, 20MB limit)
export const uploadProjectAssets = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 20 },
  fileFilter: assetFilter,
}).array('projectAssets', 10); // Expects multiple files from 'projectAssets'

export default projectUpload;