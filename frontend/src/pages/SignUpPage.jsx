import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/auth/register';

function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    contact: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Submitting...');
    setError('');

    try {
      const response = await axios.post(API_URL, formData);
      
      setMessage(response.data.message); 
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'An unknown error occurred.');
      setMessage('');
    }
  };

  // --- Theme Classes ---
  const inputClass = "mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all";
  const labelClass = "block text-sm font-medium text-slate-300";

  return (
    // Global Deep Background
    <div className="flex justify-center items-center min-h-screen bg-[#0f172a] p-4 font-sans">
      
      {/* Card Container */}
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
        
        {/* Header Section */}
        <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                Join Project<span className="text-blue-500">Hub</span>
            </h1>
            <p className="text-sm text-slate-400">
                Create an account to browse prebuilt projects or request custom development.
            </p>
        </div>

        {/* Status Messages */}
        {message && (
            <div className="bg-green-900/20 border border-green-900/50 p-3 rounded-lg text-center">
                <p className="text-green-400 text-sm font-semibold">{message}</p>
            </div>
        )}
        {error && (
            <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg text-center">
                <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email Input */}
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

          {/* Password Input */}
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          {/* Contact Input */}
          <div>
            <label className={labelClass}>Contact Number <span className="text-slate-500 font-normal">(Optional)</span></label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className={inputClass}
              placeholder="+91 98765 43210"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-900/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
            disabled={message === 'Submitting...'}
          >
            {message === 'Submitting...' ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Footer / Login Link */}
        <div className="text-center pt-2 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    Log in here
                </Link>
            </p>
            <p className="text-xs text-slate-500 mt-4">
                Note: New accounts require admin approval before full access is granted.
            </p>
        </div>

      </div>
    </div>
  );
}

export default SignUpPage;