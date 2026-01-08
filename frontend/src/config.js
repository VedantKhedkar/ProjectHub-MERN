// src/config.js

// 1. Check if we are in production mode on Vercel
// import.meta.env.PROD is a built-in Vite variable that is true during 'npm run build'
const isProd = import.meta.env.PROD;

// 2. Define your Backend URLs
const PROD_BACKEND_URL = "https://project-hub-mern-kk5m.vercel.app";
const DEV_BACKEND_URL = "http://localhost:5000";

// 3. ✅ Named Export for BASE_URL
// This ensures your pages can import it using { BASE_URL }
export const BASE_URL = isProd ? PROD_BACKEND_URL : DEV_BACKEND_URL;

// 4. ✅ Named Export for RAZORPAY_KEY_ID
// Ensure your .env file contains VITE_RAZORPAY_KEY_ID
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ReySia135ZQ7Zl';