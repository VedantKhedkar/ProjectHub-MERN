// src/config.js

// 1. Determine if we are in production
const isProd = import.meta.env.PROD;

// 2. Define the Backend URL
const PROD_BACKEND_URL = "https://project-hub-mern-kk5m.vercel.app";
const DEV_BACKEND_URL = "http://localhost:5000";

// 3. ⚠️ EXPORT the constant so other files can see it
export const BASE_URL = isProd ? PROD_BACKEND_URL : DEV_BACKEND_URL;

// 4. Also export your Razorpay ID if you've moved it here
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;