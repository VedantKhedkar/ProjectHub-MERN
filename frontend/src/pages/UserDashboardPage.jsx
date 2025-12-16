import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 
import { format } from 'date-fns';

// API endpoints
const MY_PROJECTS_URL = 'http://localhost:5000/api/projects/my-projects';
const CREATE_ORDER_URL = 'http://localhost:5000/api/payment/create-order';
const VERIFY_PAYMENT_URL = 'http://localhost:5000/api/payment/verify-payment';
const MY_PAYMENTS_URL = 'http://localhost:5000/api/projects/my-payments';
const RECEIPT_URL_BASE = 'http://localhost:5000/api/payment/receipt';
const RAZORPAY_KEY_ID = 'rzp_test_ReySia135ZQ7Zl'; 

// --- Progress Bar Component (Themed) ---
const ProgressBar = ({ percentage }) => (
  <div className="w-full bg-slate-700 rounded-full h-3 mt-3 overflow-hidden">
    <div
      className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full text-[9px] text-white text-center font-bold flex items-center justify-center transition-all duration-700 ease-out shadow-lg shadow-blue-500/20"
      style={{ width: `${percentage}%` }}
    >
      {percentage > 10 && `${percentage}%`}
    </div>
  </div>
);

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
        key: RAZORPAY_KEY_ID, 
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
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group hover:border-slate-600 transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{project.projectName}</h3>
            <p className="text-xs text-slate-400 font-mono">ID: {project.id.slice(-6)} • {new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full bg-slate-900 text-blue-400 border border-slate-700 shadow-sm">
          {project.status}
        </span>
      </div>
      
      {/* Progress Section */}
      {project.status === 'In Progress' && (
        <div className="mb-6 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>DEVELOPMENT PROGRESS</span>
            <span className="text-blue-400">{project.completionPercentage}%</span>
          </div>
          <ProgressBar percentage={project.completionPercentage} />
        </div>
      )}

      {/* Payment Status Pill */}
      {project.paymentStatus !== "Not Quoted" && (
         <div className="mb-4">
            <span className={`px-2.5 py-1 inline-flex text-[10px] font-bold uppercase tracking-wide rounded-md border 
                ${project.paymentStatus === '100% Paid' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-amber-900/20 text-amber-500 border-amber-800'}`}>
                {project.paymentStatus}
            </span>
         </div>
      )}

      {/* Payment Actions Grid */}
      <div className="space-y-3 pt-2">
        {/* Step 1: Initial Payment */}
        {project.status === "Quote Sent - Awaiting 50% Payment" && !hasPaidInitial && (
            <div className="p-4 bg-amber-900/10 border border-amber-800/30 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                    <p className="text-amber-400 font-bold text-sm">Quote Approved</p>
                    <p className="text-slate-400 text-xs">Pay 50% advance to start work.</p>
                </div>
                <button onClick={() => handlePayment('Initial_50')} className="w-full sm:w-auto px-5 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-green-900/20 transition-all">
                    Pay ₹{project.finalQuote / 2}
                </button>
            </div>
        )}

        {/* Step 2: Final Payment */}
        {project.status === "Awaiting Final Payment" && project.paymentStatus === "50% Paid" && !hasPaidFinal && (
            <div className="p-4 bg-blue-900/10 border border-blue-800/30 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                    <p className="text-blue-400 font-bold text-sm">Project Complete</p>
                    <p className="text-slate-400 text-xs">Pay balance to release files.</p>
                </div>
                <button onClick={() => handlePayment('Final_100')} className="w-full sm:w-auto px-5 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-green-900/20 transition-all">
                    Pay ₹{project.finalQuote / 2}
                </button>
            </div>
        )}

        {/* Step 3: Delivery */}
        {isDelivered && (
            <Link to={`/project/delivery/${project.id}`} className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white text-center rounded-lg font-bold transition-all border border-slate-600 hover:border-blue-500 shadow-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Access Project Files
            </Link>
        )}
      </div>
    </div>
  );
};

// --- Transaction History Component (Themed) ---
const TransactionHistory = ({ token, refreshTrigger }) => { 
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Payment History
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{payments.length}</span>
            </h2>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                    <tr>
                        <th className="px-6 py-3 font-semibold">Date</th>
                        <th className="px-6 py-3 font-semibold">Project</th>
                        <th className="px-6 py-3 font-semibold">Amount</th>
                        <th className="px-6 py-3 font-semibold text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {payments.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">No payment records found.</td></tr>
                    ) : (
                        payments.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="px-6 py-4 text-slate-400 font-mono text-xs">{format(new Date(p.createdAt), 'MMM dd, yyyy')}</td>
                                <td className="px-6 py-4 text-white font-medium">{p.project?.projectName || p.portfolioProjectName || 'N/A'}</td>
                                <td className="px-6 py-4 text-emerald-400 font-bold">₹ {p.amount / 100}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDownloadReceipt(p)} className="text-blue-400 hover:text-white font-medium text-xs border border-slate-600 hover:bg-blue-600 px-3 py-1.5 rounded transition-all">Receipt</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
function UserDashboardPage() {
  const { user, token } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

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

  return (
    // Global Deep Background
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                    <span className="text-blue-500">●</span> My Projects
                </h1>
                <p className="text-slate-400 mt-2 text-lg">Manage your custom projects and track progress.</p>
            </div>
            <Link to="/custom-project" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 transform hover:scale-105">
                <span>+</span> New Custom Request
            </Link>
        </div>

        {/* Active Projects Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-white">Active Projects</h2>
             {myProjects.length > 0 && <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-lg text-xs font-mono border border-slate-700">{myProjects.length} Total</span>}
          </div>
          
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[1,2].map(i => <div key={i} className="h-64 bg-slate-800 rounded-xl animate-pulse"></div>)}
             </div>
          ) : myProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProjects.map(project => (
                <ProjectTrackerCard 
                  key={project.id} 
                  project={project}
                  token={token} 
                  user={user} 
                  onPaymentSuccess={refreshAllData} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                <p className="text-slate-400 font-medium text-lg">No active custom projects.</p>
                <Link to="/custom-project" className="text-blue-400 hover:text-blue-300 font-medium mt-2 inline-block hover:underline">Start a new project &rarr;</Link>
            </div>
          )}
        </section>
        
        {/* Transaction History */}
        <TransactionHistory token={token} refreshTrigger={refreshTrigger} />
        
      </div>
    </div>
  );
}

export default UserDashboardPage;