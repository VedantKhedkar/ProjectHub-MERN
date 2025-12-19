import { createContext, useState, useContext } from 'react';

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

  // --- NEW: State for the Login Modal ---
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  // --- END NEW ---

  // Function to handle login
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
    closeLoginModal(); // Close modal on successful login
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
    logout,
    // --- NEW: Expose modal controls ---
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