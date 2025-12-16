import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { format } from 'date-fns';

const API_URL = 'http://localhost:5000/api/admin/payments';

function PaymentTracking() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    if (!token) {
      setLoading(true);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (err) {
      setError('Failed to fetch payment records.');
      console.error("PaymentTracking Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPayments();
    }
  }, [token]); 

  if (loading) return <p className="text-slate-400 animate-pulse text-center py-10">Loading payment records...</p>;
  if (error) return <p className="text-red-400 font-semibold bg-red-900/20 p-4 rounded border border-red-900/50">{error}</p>;

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
           <span className="text-blue-500">●</span> Transaction Log 
           <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full border border-slate-600 ml-2">{payments.length}</span>
        </h3>
        
        <button 
            onClick={fetchPayments} 
            className="px-4 py-2 bg-slate-800 text-blue-400 border border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors shadow-sm"
        >
            Refresh Log
        </button>
      </div>
      
      {payments.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
             <p className="text-slate-400 font-medium">No successful payments recorded yet.</p>
             <p className="text-slate-500 text-sm mt-1">Transactions will appear here once processed.</p>
        </div>
      ) : (
        // Table Container
        <div className="overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              
              {/* Table Header */}
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Payment ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Amount (INR)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Client Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody className="divide-y divide-slate-700">
                {payments.map((payment) => {
                  
                  // Check if payment.project exists. If not, use the stored portfolioProjectName.
                  const projectName = payment.project?.projectName || payment.portfolioProjectName || 'N/A';

                  return (
                    <tr key={payment.id} className="hover:bg-slate-700/30 transition-colors group">
                      
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                        {format(new Date(payment.createdAt), 'MMM dd, yyyy - hh:mm a')}
                      </td>
                      
                      {/* Payment ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-700 select-all">
                              {payment.razorpayPaymentId}
                          </span>
                      </td>
                      
                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-400">
                        ₹ {payment.amount / 100}
                      </td>
                      
                      {/* Project Name */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                          {projectName}
                      </td>
                      
                      {/* Client Email */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {payment.user.email}
                      </td>
                      
                      {/* Payment Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800">
                              {payment.paymentType}
                          </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentTracking;