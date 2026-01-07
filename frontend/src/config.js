// src/config.js

// ✅ Correct URL from your screenshot (No trailing slash at the end)
const PROD_BACKEND_URL = "https://project-hub-mern-kk5m.vercel.app"; 

// Automatically switches:
// - Uses localhost when you run "npm run dev"
// - Uses Vercel Backend when you deploy to Vercel
const BASE_URL = import.meta.env.PROD ? PROD_BACKEND_URL : "http://localhost:5000";

export default BASE_URL;