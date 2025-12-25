import axios from 'axios';

// This ensures the frontend uses the Vercel backend URL you set in the dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

export default api;