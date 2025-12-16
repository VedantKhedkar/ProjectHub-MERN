import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 
import ImageSlider from '../components/ImageSlider.jsx';
import { toast } from 'react-hot-toast'; 
import React from 'react'; 

// API Endpoints
const API_BASE_URL = 'http://localhost:5000/api/portfolio';
const CREATE_ORDER_URL = 'http://localhost:5000/api/payment/create-order';
const VERIFY_PAYMENT_URL = 'http://localhost:5000/api/payment/verify-payment';
const RECEIPT_URL_BASE = 'http://localhost:5000/api/payment/receipt';
const RAZORPAY_KEY_ID = 'rzp_test_ReySia135ZQ7Zl'; // Your Key ID

function ProjectDetailPage() {
  const { id } = useParams();
  const { isLoggedIn, token, user, openLoginModal } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isAdmin = isLoggedIn && user?.email === 'admin@projecthub.com';

  useEffect(() => {
    const fetchProject = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        setError('You must be logged in to view this page.');
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        setProject(response.data);
        setLoading(false);
      } catch (err) {
        setError('Could not load project details. It may not exist or you may not have access.');
        setLoading(false);
      }
    };
    
    fetchProject();
    
  }, [id, token, isLoggedIn]);
  
  // --- Payment Logic function ---
  const proceedToPayment = async (toastId) => {
    toast.loading('Creating your order...', { id: toastId });

    const priceString = (project.price || "").replace(/[^0-9]/g, '');
    const amountInRupees = parseInt(priceString, 10);

    if (isNaN(amountInRupees) || amountInRupees <= 0) {
      toast.error('Could not determine price. Please contact support.', { id: toastId });
      return;
    }
    
    if (RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID_HERE') {
      toast.error('Razorpay Key ID is not set. Please update this file.', { id: toastId });
      return;
    }
    
    try {
      const { data: order } = await axios.post(
        CREATE_ORDER_URL,
        { 
          amountInRupees: amountInRupees,
          portfolioProjectId: project.id, 
          paymentType: 'Prebuilt_100',
        },
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

            const paymentId = verificationResponse.data.paymentId; 
            const receiptUrl = `${RECEIPT_URL_BASE}/${paymentId}`;
            
            toast.success(verificationResponse.data.message, { id: verifyToastId, duration: 4000 });
            window.open(receiptUrl, '_blank');
            
            navigate('/my-prebuilt-projects');

          } catch (err) {
            toast.error(`Payment verification failed: ${err.response?.data?.message || 'Server error'}`, { id: verifyToastId });
          }
        },
        prefill: {
          name: user.email, 
          email: user.email,
          contact: user.contact || '',
        },
        theme: {
          color: "#2563eb" // Updated to Blue-600
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(`Error creating order: ${err.response?.data?.message || 'Server error'}`, { id: toastId });
    }
  };
  
  // --- (MODIFIED UI) Buy Request Handler ---
  const handleBuyRequest = () => {
    if (!isLoggedIn) {
        openLoginModal();
        return;
    }

    const toastId = toast(
      (t) => ( 
        // Updated Toast UI to match Dark Theme
        <div className="flex flex-col gap-3 p-1">
          <p className="font-medium text-slate-200">
            Confirm purchase of <span className="text-white font-bold">{project.name}</span> for <span className="text-blue-400 font-bold">{project.price}</span>?
          </p>
          <div className="w-full flex gap-3">
            <button
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
              onClick={() => proceedToPayment(t.id)} 
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
        },
      }
    );
  };


  if (loading) return <div className="text-center p-20 text-slate-400 animate-pulse">Loading project details...</div>;
  if (error) return <div className="text-center p-20 text-red-400 font-bold bg-red-900/10 border border-red-900 mx-auto max-w-lg rounded-lg mt-10">{error}</div>;
  if (!project) return <div className="text-center p-20 text-slate-500">Project data not found.</div>;

  return (
    // Global Background
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-8 flex justify-center">
      
      {/* Main Card Container */}
      <div className="w-full max-w-5xl bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 space-y-8">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm group">
          <span className="group-hover:-translate-x-1 transition-transform duration-200 mr-2">&larr;</span> 
          Back to Portfolio
        </Link>

        {/* --- Header and Price Display --- */}
        <div className="border-b border-slate-700 pb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">{project.name}</h1>
                <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">{project.description}</p>
            </div>
            
            {project.price && (
                <div className="flex flex-col items-end">
                    <span className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Price</span>
                    <span className="text-2xl font-bold text-blue-300 bg-blue-900/30 border border-blue-500/30 px-5 py-2 rounded-xl shadow-lg whitespace-nowrap">
                        {project.price}
                    </span>
                </div>
            )}
        </div>
        
        {/* --- Image Slider --- */}
        <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner">
             <ImageSlider 
                images={project.imageUrls} 
                projectName={project.name} 
             />
        </div>

        {/* --- Key Details Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* Left Col: Tech Stack */}
            <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                    {project.techStacks.map(tech => (
                        <span key={tech} className="text-xs font-medium px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
            
            {/* Right Col: Features */}
            <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700 col-span-1 md:col-span-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Core Features
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.features.map((feature, index) => (
                        <li key={index} className="text-slate-400 text-sm flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700">
          <a 
            href={project.demoUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 py-3.5 text-center text-sm font-bold text-white bg-slate-700 rounded-xl hover:bg-slate-600 border border-slate-600 shadow-sm transition-all duration-200"
          >
            View Live Demo
          </a>

          <button 
            onClick={handleBuyRequest}
            className="flex-1 py-3.5 text-center text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all duration-200 transform hover:scale-[1.01]"
          >
            Buy This Project
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProjectDetailPage;