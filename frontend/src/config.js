// src/config.js

// Replace the string below with your ACTUAL Backend Vercel URL
const PROD_BACKEND_URL = "https://project-hub-mern-kk5m.vercel.app/"; 

const BASE_URL = import.meta.env.PROD ? PROD_BACKEND_URL : "http://localhost:5000";

export default BASE_URL;