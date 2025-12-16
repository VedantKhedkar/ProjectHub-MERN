import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
);

const API_URL = 'http://localhost:5000/api/portfolio';
const CREATE_ORDER_URL = 'http://localhost:5000/api/payment/create-order';
const VERIFY_PAYMENT_URL = 'http://localhost:5000/api/payment/verify-payment';
const RECEIPT_URL_BASE = 'http://localhost:5000/api/payment/receipt';
const RAZORPAY_KEY_ID = 'rzp_test_ReySia135ZQ7Zl'; 

function PortfolioDisplay() {
  const { isLoggedIn, token, user, openLoginModal } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const isAdmin = isLoggedIn && user?.email === 'admin@projecthub.com';

  // Fetch Logic
  const fetchProjects = async (query = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?search=${query}`);
      setProjects(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load portfolio projects.');
      setLoading(false);
    }
  };

  // Debounce Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects(searchTerm);
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- Payment Logic ---
  const proceedToPayment = async (project, toastId) => {
    toast.loading('Creating your order...', { id: toastId });
    const priceString = (project.price || "").replace(/[^0-9]/g, '');
    const amountInRupees = parseInt(priceString, 10);

    if (isNaN(amountInRupees) || amountInRupees <= 0) {
      toast.error('Invalid price.', { id: toastId });
      return;
    }
    
    try {
      const { data: order } = await axios.post(
        CREATE_ORDER_URL,
        { amountInRupees, portfolioProjectId: project.id, paymentType: 'Prebuilt_100' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.dismiss(toastId); 

      const options = {
        key: RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: "INR",
        name: `Purchase: ${project.name}`,
        description: `Full payment for ${project.name}`,
        order_id: order.id,
        handler: async function (response) {
          const verifyToastId = toast.loading('Verifying payment...');
          try {
            const verificationResponse = await axios.post(
              VERIFY_PAYMENT_URL, 
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                notes: order.notes, 
              },
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            toast.success('Payment Successful!', { id: verifyToastId });
            navigate('/my-prebuilt-projects');
          } catch (err) {
            toast.error('Verification failed.', { id: verifyToastId });
          }
        },
        prefill: { name: user.email, email: user.email },
        theme: { color: "#2563eb" }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Error creating order.', { id: toastId });
    }
  };

  // --- Buy Handler (Theme Updated) ---
  const handleBuyRequest = (project) => {
    if (!isLoggedIn) { 
        openLoginModal(); 
        return; 
    }
    
    // Custom Toast for Confirmation
    const toastId = toast(
      (t) => ( 
        <div className="flex flex-col gap-3 p-1">
          <p className="font-medium text-slate-200">
            Confirm purchase of <span className="text-white font-bold">{project.name}</span> for <span className="text-blue-400 font-bold">{project.price}</span>?
          </p>
          <div className="w-full flex gap-3">
            <button
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
              onClick={() => proceedToPayment(project, t.id)} 
            >
              Confirm
            </button>
            <button
              className="flex-1 bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-colors"
              onClick={() => toast.dismiss(t.id)} 
            >
              Cancel
            </button>
          </div>
        </div>
      ), 
      { 
        duration: Infinity, 
        style: { 
            background: '#1e293b', // bg-slate-800
            color: '#e2e8f0',      // text-slate-200
            border: '1px solid #334155', // border-slate-700
        } 
      }
    );
  };

  const handleCardClick = (projectId) => {
    if (isLoggedIn) { navigate(`/project/${projectId}`); } else { openLoginModal(); }
  };

  const handleEditRedirect = () => { navigate('/admin/users'); };

  return (
    <div className="py-8 bg-[#0f172a] min-h-full"> 
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- HEADER & SEARCH --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-slate-800 pb-6 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                   <span className="text-blue-500">●</span> Prebuilt Projects
                </h2>
                <p className="text-slate-400 text-sm mt-1">Ready-to-deploy solutions for your needs.</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm group-hover:border-slate-600"
                />
            </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading && <p className="text-lg text-slate-400 text-center py-20 animate-pulse">Searching library...</p>}
        {error && <p className="text-lg text-red-400 text-center py-20">Error: {error}</p>}
        
        {!loading && projects.length === 0 && (
            <div className="text-center py-24 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                <p className="text-slate-400 font-medium text-lg">No projects found matching "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-semibold hover:underline">Clear Search</button>
            </div>
        )}

        {/* PROJECTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg hover:shadow-xl hover:border-slate-600 transition-all duration-300 flex flex-col group overflow-hidden">
              
              {/* Card Content */}
              <div onClick={() => handleCardClick(p.id)} className="flex-grow cursor-pointer">
                
                {/* Image */}
                {p.imageUrls && p.imageUrls.length > 0 ? (
                  <div className="relative overflow-hidden h-48 w-full border-b border-slate-700">
                    <img 
                        src={`http://localhost:5000${p.imageUrls[0]}`} 
                        alt={p.name} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ) : (
                   <div className="h-48 w-full bg-slate-900 flex items-center justify-center text-slate-600 border-b border-slate-700">No Preview Image</div>
                )}
                
                {/* Details */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3"> 
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-200 line-clamp-1">{p.name}</h3>
                    {p.price && (
                        <span className="text-xs font-bold text-blue-300 bg-blue-900/30 border border-blue-500/30 px-2.5 py-1 rounded-lg whitespace-nowrap">
                            {p.price}
                        </span>
                    )}
                  </div>
                  
                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">{p.description}</p>
                  
                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.techStacks && p.techStacks.slice(0,4).map(tech => (
                      <span key={tech} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-slate-900 border border-slate-700 text-slate-300 rounded-md">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Features */}
                  <ul className="space-y-1">
                    {p.features && p.features.slice(0, 2).map((f, index) => (
                      <li key={index} className="text-slate-500 text-xs flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="p-5 pt-0 mt-auto grid grid-cols-2 gap-3">
                {isLoggedIn ? (
                  <a 
                    href={p.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center py-2.5 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded-lg hover:text-white hover:border-slate-500 transition-all duration-200"
                  >
                    View Demo
                  </a>
                ) : (
                  <button 
                    onClick={openLoginModal}
                    className="flex items-center justify-center py-2.5 text-sm font-medium text-slate-500 bg-slate-900 border border-slate-700/50 rounded-lg cursor-not-allowed opacity-70"
                  >
                    Login for Demo
                  </button>
                )}
                
                {isAdmin ? (
                  <button 
                    onClick={handleEditRedirect}
                    className="flex items-center justify-center py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-lg shadow-amber-900/20 transition-all duration-200"
                  >
                    Edit
                  </button>
                ) : (
                  <button 
                    onClick={() => handleBuyRequest(p)} 
                    className="flex items-center justify-center py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all duration-200"
                  >
                    Buy Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PortfolioDisplay;