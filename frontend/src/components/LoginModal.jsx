import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast'; // <-- 1. Import toast

const API_URL = 'http://localhost:5000/api/auth/login';

function LoginModal() {
  const { login, closeLoginModal } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  // We no longer need the 'error' state, we'll use toast
  // const [error, setError] = useState(''); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(API_URL, formData);
      const userData = response.data.user;
      const token = response.data.token;
      
      login(userData, token);
      // No toast needed on success, the modal just closes.
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An unknown error occurred.';
      // --- 2. USE TOAST INSTEAD OF SETERROR ---
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    // 1. Full-screen overlay
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closeLoginModal} 
    >
      {/* 2. Modal content container */}
      <div
        className="relative w-full max-w-md p-8 bg-zinc-800 rounded-2xl shadow-xl border border-zinc-700"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Close Button */}
        <button 
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-bold text-center text-cyan-400">Login Required</h2>
        <p className="text-center text-zinc-400 mb-6">Please log in to continue.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-zinc-600 rounded-md shadow-sm bg-zinc-700 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-zinc-600 rounded-md shadow-sm bg-zinc-700 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-150 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default LoginModal;