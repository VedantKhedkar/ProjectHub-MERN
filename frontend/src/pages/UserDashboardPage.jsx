"use client";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
    CreditCard, Clock, CheckCircle, FileText, 
    Plus, Download, Activity, AlertCircle, FolderOpen,
    Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp 
} from 'lucide-react'; 

// ✅ Corrected Imports: Named exports from your config file
import { BASE_URL, RAZORPAY_KEY_ID } from '../config.js'; 

// API endpoints - Using dynamic BASE_URL
const MY_PROJECTS_URL = `${BASE_URL}/api/projects/my-projects`;
const CREATE_ORDER_URL = `${BASE_URL}/api/payment/create-order`;
const VERIFY_PAYMENT_URL = `${BASE_URL}/api/payment/verify-payment`;
const MY_PAYMENTS_URL = `${BASE_URL}/api/projects/my-payments`;
const RECEIPT_URL_BASE = `${BASE_URL}/api/payment/receipt`;

// --- Progress Bar Component ---
const ProgressBar = ({ percentage }) => (
  <div className="w-full bg-slate-900/50 rounded-full h-3 mt-4 overflow-hidden border border-slate-700/50">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full relative"
    >
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
    </motion.div>
  </div>
);

// --- Status Badge Helper ---
const getStatusStyle = (status) => {
    switch (status) {
        case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'In Progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
};

// --- Project Card Component ---
const ProjectTrackerCard = ({ project, token, user, onPaymentSuccess }) => {
  
  const proceedToPayment = async (paymentType, toastId) => {
    toast.loading('Creating your order...', { id: toastId });

    let paymentAmount = 0;
    if (paymentType === 'Initial_50') {
      paymentAmount = project.finalQuote / 2;
    } else if (paymentType === 'Final_100') {
      paymentAmount = project.finalQuote / 2; 
    }
    
    try {
      const { data: order } = await axios.post(
        CREATE_ORDER_URL,
        { 
          amountInRupees: paymentAmount, 
          projectId: project.id,
          paymentType: paymentType,
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      toast.dismiss(toastId); 

      const options = {
        key: RAZORPAY_KEY_ID, // ✅ Pulls from VITE_RAZORPAY_KEY_ID via config
        amount: order.amount,
        currency: "INR",
        name: "ProjectHub",
        description: `Payment for ${project.projectName} (${paymentType})`,
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
            toast.success('Payment successful!', { id: verifyToastId });
            window.open(receiptUrl, '_blank');
            onPaymentSuccess(); 
          } catch (err) {
            toast.error('Payment verification failed.', { id: verifyToastId });
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

  const handlePayment = (paymentType) => {
    let amount = project.finalQuote / 2;
    const toastId = toast(
      (t) => ( 
        <div className="flex flex-col gap-3 p-1">
          <p className="font-medium text-slate-200">
            Confirm payment of <span className="text-white font-bold">INR {amount}</span> for {paymentType === 'Initial_50' ? 'Advance' : 'Final Balance'}?
          </p>
          <div className="flex gap-3">
            <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-500" onClick={() => proceedToPayment(paymentType, t.id)}>Pay Now</button>
            <button className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-600" onClick={() => toast.dismiss(t.id)}>Cancel</button>
          </div>
        </div>
      ), 
      { duration: Infinity, style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }
    );
  };

  const hasPaidInitial = project.payments?.some(p => p.paymentType === 'Initial_50');
  const hasPaidFinal = project.payments?.some(p => p.paymentType === 'Final_100');
  const isDelivered = project.status === 'Delivered';

  return (
    <motion.div 
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all group"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors tracking-tight">{project.projectName}</h3>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <Clock size={12} />
                {new Date(project.createdAt).toLocaleDateString()}
            </p>
        </div>
        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border ${getStatusStyle(project.status)}`}>
          {project.status}
        </span>
      </div>
      
      {project.status === 'In Progress' && (
        <div className="mb-6 bg-slate-900/40 p-5 rounded-xl border border-slate-700/50">
          <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-2"><Activity size={14} className="text-blue-400"/> Development Velocity</span>
            <span className="text-blue-400">{project.completionPercentage}%</span>
          </div>
          <ProgressBar percentage={project.completionPercentage} />
        </div>
      )}

      {project.paymentStatus !== "Not Quoted" && (
         <div className="mb-5">
            <span className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide rounded-lg border 
                ${project.paymentStatus === '100% Paid' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-amber-900/20 text-amber-500 border-amber-800'}`}>
                <CreditCard size={12} />
                {project.paymentStatus}
            </span>
         </div>
      )}

      <div className="space-y-3 pt-2">
        {project.status === "Quote Sent - Awaiting 50% Payment" && !hasPaidInitial && (
            <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-gradient-to-r from-amber-900/10 to-transparent border-l-4 border-amber-500 rounded-r-lg flex flex-col sm:flex-row justify-between items-center gap-4"
            >
                <div>
                    <p className="text-amber-400 font-bold text-sm flex items-center gap-2"><AlertCircle size={16}/> Quote Approved</p>
                    <p className="text-slate-400 text-xs mt-1">Pay 50% advance to start work.</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handlePayment('Initial_50')} className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-green-900/20 transition-all">
                    Pay ₹{project.finalQuote / 2}
                </motion.button>
            </motion.div>
        )}

        {project.status === "Awaiting Final Payment" && project.paymentStatus === "50% Paid" && !hasPaidFinal && (
            <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-gradient-to-r from-blue-900/10 to-transparent border-l-4 border-blue-500 rounded-r-lg flex flex-col sm:flex-row justify-between items-center gap-4"
            >
                <div>
                    <p className="text-blue-400 font-bold text-sm flex items-center gap-2"><CheckCircle size={16}/> Project Complete</p>
                    <p className="text-slate-400 text-xs mt-1">Pay balance to release files.</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handlePayment('Final_100')} className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-green-900/20 transition-all">
                    Pay ₹{project.finalQuote / 2}
                </motion.button>
            </motion.div>
        )}

        {isDelivered && (
            <Link to={`/project/delivery/${project.id}`}>
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-slate-700/50 hover:bg-blue-600/20 text-white text-center rounded-xl font-bold transition-all border border-slate-600 hover:border-blue-500 shadow-lg flex items-center justify-center gap-3 group/btn"
                >
                    <Download size={18} className="text-blue-400 group-hover/btn:text-white transition-colors" />
                    Access Project Files
                </motion.div>
            </Link>
        )}
      </div>
    </motion.div>
  );
};

// --- Transaction History Component (Paginated) ---
const TransactionHistory = ({ token, refreshTrigger }) => { 
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 5; 

  useEffect(() => {
    const fetchPayments = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await axios.get(MY_PAYMENTS_URL, { headers: { 'Authorization': `Bearer ${token}` } });
            setPayments(response.data);
        } catch (err) {
            console.error("History Error", err);
        } finally {
            setLoading(false);
        }
    };
    fetchPayments();
  }, [token, refreshTrigger]);

  const handleDownloadReceipt = async (payment) => {
    const toastId = toast.loading('Downloading...'); 
    try {
      const response = await axios.get(`${RECEIPT_URL_BASE}/${payment.razorpayPaymentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob', 
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${payment.razorpayPaymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded', { id: toastId }); 
    } catch (err) {
      toast.error("Error downloading receipt.", { id: toastId }); 
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
        const name = p.project?.projectName || p.portfolioProjectName || '';
        const amount = (p.amount / 100).toString();
        const date = format(new Date(p.createdAt), 'MMM dd, yyyy');
        const search = searchTerm.toLowerCase();
        
        return name.toLowerCase().includes(search) || 
               amount.includes(search) || 
               date.toLowerCase().includes(search);
    });
  }, [payments, searchTerm]);

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedData = filteredPayments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl flex flex-col h-full"
    >
        <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-800/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg"><FileText size={20} className="text-blue-500"/></div>
                <div>
                    <h2 className="text-lg font-bold text-white">Transaction History</h2>
                    <p className="text-xs text-slate-400">Total Spent: ₹{payments.reduce((acc, curr) => acc + (curr.amount/100), 0).toLocaleString()}</p>
                </div>
            </div>
            <div className="relative w-full sm:w-64 group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"/>
                <input 
                    type="text" placeholder="Search transactions..." value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                />
            </div>
        </div>
        
        <div className="overflow-x-auto flex-grow min-h-[300px]"> 
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/30 border-b border-slate-700/50">
                    <tr>
                        <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Project Details</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Amount</th>
                        <th className="px-6 py-4 font-semibold tracking-wider text-right">Receipt</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                    {loading ? (
                         [...Array(3)].map((_, i) => (
                             <tr key={i} className="animate-pulse">
                                 <td className="px-6 py-4"><div className="h-4 bg-slate-700/50 rounded w-24"></div></td>
                                 <td className="px-6 py-4"><div className="h-4 bg-slate-700/50 rounded w-32"></div></td>
                                 <td className="px-6 py-4"><div className="h-4 bg-slate-700/50 rounded w-16"></div></td>
                                 <td className="px-6 py-4"></td>
                             </tr>
                         ))
                    ) : paginatedData.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">No transactions found matching your search.</td></tr>
                    ) : (
                        paginatedData.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-700/20 transition-colors group">
                                <td className="px-6 py-4 text-slate-400 font-mono text-xs whitespace-nowrap">
                                    {format(new Date(p.createdAt), 'MMM dd, yyyy')}
                                    <div className="text-[10px] text-slate-600">{format(new Date(p.createdAt), 'hh:mm a')}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white font-medium group-hover:text-blue-400 transition-colors line-clamp-1">{p.project?.projectName || p.portfolioProjectName || 'Unknown Project'}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">ID: {p.razorpayPaymentId.slice(-8)}</div>
                                </td>
                                <td className="px-6 py-4 text-emerald-400 font-bold font-mono whitespace-nowrap">₹ {(p.amount / 100).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDownloadReceipt(p)} className="text-slate-400 hover:text-white font-medium text-xs border border-slate-600 hover:bg-blue-600 hover:border-blue-500 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ml-auto group/btn">
                                        <Download size={12} className="group-hover/btn:animate-bounce"/> PDF
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {filteredPayments.length > ITEMS_PER_PAGE && (
            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                    Showing <span className="text-white font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-white font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)}</span> of {filteredPayments.length}
                </span>
                <div className="flex items-center gap-2">
                    <button onClick={prevPage} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft size={16} /></button>
                    <button onClick={nextPage} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight size={16} /></button>
                </div>
            </div>
        )}
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---
function UserDashboardPage() {
  const { user, token } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [showAllProjects, setShowAllProjects] = useState(false);
  const INITIAL_PROJECT_LIMIT = 4;

  const refreshAllData = () => {
    fetchMyProjects();
    setRefreshTrigger(prev => prev + 1); 
  };
  
  const fetchMyProjects = async () => {
    if (!token) return; 
    try {
      setLoading(true);
      const response = await axios.get(MY_PROJECTS_URL, { headers: { 'Authorization': `Bearer ${token}` } });
      setMyProjects(response.data);
    } catch (err) {
      console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if(token) fetchMyProjects();
  }, [token]);

  const displayedProjects = showAllProjects ? myProjects : myProjects.slice(0, INITIAL_PROJECT_LIMIT);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-6 md:p-12 relative overflow-x-hidden">
      
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <motion.div animate={{ x: [-50, 50, -50], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-700/50 pb-8 gap-6">
            <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">My Projects</span>
                </h1>
                <p className="text-slate-400 mt-3 text-lg font-light">Track progress, manage payments, and access deliverables.</p>
            </div>
            
            <Link to="/custom-project">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-blue-600/50 transition-all flex items-center gap-2">
                    <Plus size={20} /> New Request
                </motion.button>
            </Link>
        </motion.div>

        <section>
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold text-white flex items-center gap-2"><FolderOpen size={24} className="text-amber-500"/> Active Dashboard</h2>
                 {myProjects.length > 0 && <span className="bg-slate-800/50 text-slate-300 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-700">{myProjects.length} Projects</span>}
             </div>

             {myProjects.length > INITIAL_PROJECT_LIMIT && (
                <button onClick={() => setShowAllProjects(!showAllProjects)} className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-white transition-colors group">
                    {showAllProjects ? 'Show Less' : 'View All'}
                    {showAllProjects ? <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform"/> : <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform"/>}
                </button>
             )}
          </div>
          
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[1,2].map(i => <div key={i} className="h-72 bg-slate-800/30 rounded-2xl animate-pulse border border-slate-700/30"></div>)}
             </div>
          ) : myProjects.length > 0 ? (
            <motion.div 
                key={showAllProjects ? 'all' : 'limited'} 
                initial="hidden" 
                animate="visible" 
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }} 
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {displayedProjects.map(project => (
                <ProjectTrackerCard key={project.id} project={project} token={token} user={user} onPaymentSuccess={refreshAllData} />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700/50 backdrop-blur-sm">
                <FolderOpen size={48} className="text-slate-600 mx-auto mb-4 opacity-50"/>
                <p className="text-slate-400 font-medium text-lg">No active custom projects found.</p>
                <Link to="/custom-project" className="text-blue-400 hover:text-blue-300 font-bold mt-3 inline-block hover:underline">Start a new project &rarr;</Link>
            </motion.div>
          )}
        </section>
        
        <TransactionHistory token={token} refreshTrigger={refreshTrigger} />
        
      </div>
    </div>
  );
}

export default UserDashboardPage;