// src/config.js

// 1. Determine if the app is running in Production mode (Vercel) or Development (Local)
const isProd = import.meta.env.PROD;

// 2. Define Backend URLs
// Your Backend Vercel URL from previous logs
const PROD_BACKEND_URL = "https://project-hub-mern-kk5m.vercel.app"; 
const DEV_BACKEND_URL = "http://localhost:5000";

// 3. ✅ Named Export for BASE_URL
// This allows pages to use: import { BASE_URL } from '../config'
export const BASE_URL = isProd ? PROD_BACKEND_URL : DEV_BACKEND_URL;

// 4. ✅ Named Export for RAZORPAY_KEY_ID
// Pulls from the VITE_ prefixed variable in your .env file
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ReySia135ZQ7Zl';