import React, { createContext, useState, useContext } from 'react';
import axios from 'axios'; // <-- REQUIRED for API calls
import { useNavigate } from 'react-router-dom'; // <-- REQUIRED for future navigation needs

// --- LIVE RENDER URL FOR BACKEND ---
const RENDER_API_BASE_URL = 'https://projecthub-backend-osq8.onrender.com';
// ---

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch (e) {
      return null;
    }
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // --- State for the Login Modal ---
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  // --- END NEW ---

  // --- MODIFIED: Function to handle login with API call ---
  const login = async (email, password) => {
    try {
        const response = await axios.post(`${RENDER_API_BASE_URL}/api/auth/login`, { email, password });
        const userData = response.data.user;
        const jwtToken = response.data.token;

        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', jwtToken);
        closeLoginModal(); // Close modal on successful login

        return response;
    } catch (error) {
        // Re-throw the error so components can catch it (e.g., to display toast)
        throw error;
    }
  };
  
  // --- NEW: Function to handle registration with API call ---
  const register = async (formData) => {
    try {
        const response = await axios.post(`${RENDER_API_BASE_URL}/api/auth/register`, formData);
        return response;
    } catch (error) {
        throw error;
    }
  };

  // Function to handle logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // The value that will be passed down to children
  const contextValue = {
    user,
    token,
    isLoggedIn: !!token, 
    login,
    register, // Expose register function
    logout,
    // --- Expose modal controls ---
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook for consuming the context
export const useAuth = () => {
  return useContext(AuthContext);
};