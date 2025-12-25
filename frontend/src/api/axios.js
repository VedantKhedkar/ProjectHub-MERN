import axios from 'axios';

// Vite uses import.meta.env for environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // Important for cookies/sessions
});

export default api;