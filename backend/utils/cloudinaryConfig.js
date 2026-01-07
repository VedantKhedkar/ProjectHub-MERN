import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// 1. Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'projecthub_uploads', // The folder name in your Cloudinary Dashboard
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'zip'], // Adjust as needed
    resource_type: 'auto', // Important for allowing PDFs/ZIPs, not just images
  },
});

export { cloudinary, storage };