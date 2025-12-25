import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx'; 
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // Added icons

const API_URL = 'https://project-hub-mern.vercel.app/';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state
  
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Logging in...');
    setError('');

    try {
      const response = await axios.post(API_URL, formData);
      const userData = response.data.user;
      
      login(userData, response.data.token);
      navigate('/'); 

    } catch (err) {
      setError(err.response?.data?.message || 'An unknown error occurred.');
      setMessage('');
    }
  };

  const inputClass = "mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all";
  const labelClass = "block text-sm font-medium text-slate-300";

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0f172a] p-4 font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
        
        <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                Welcome Back
            </h1>
            <p className="text-sm text-slate-400">
                Sign in to access your ProjectHub dashboard.
            </p>
        </div>

        {error && (
            <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg text-center">
                <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="name@company.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
                <label className={labelClass}>Password</label>
            </div>
            {/* Password Wrapper */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`${inputClass} pr-12`} // Added padding right for icon
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-900/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
            disabled={message === 'Logging in...'}
          >
            {message === 'Logging in...' ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    Create one now
                </Link>
            </p>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;