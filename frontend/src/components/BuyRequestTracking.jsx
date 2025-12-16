import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { format } from 'date-fns';

const API_URL = 'http://localhost:5000/api/admin/buy-requests';

function BuyRequestTracking() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    if (!token) {
      console.log("BuyRequestTracking: Fetch aborted, no token.");
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log("BuyRequestTracking: Fetching with token...");
      
      const response = await axios.get(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("BuyRequestTracking: Data fetched", response.data);
      setRequests(response.data);
      
    } catch (err) {
      console.error("BuyRequestTracking Fetch Error:", err);
      setError(`Failed to fetch buy requests. Status: ${err.response?.status || 'Network Error'}`);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    } else {
      console.log("BuyRequestTracking: Waiting for token...");
      setLoading(true);
    }
  }, [token]);

  if (loading) return <p className="text-slate-400 animate-pulse text-center py-10">Loading buy inquiries...</p>;
  if (error) return <p className="text-red-400 font-semibold bg-red-900/20 p-4 rounded border border-red-900/50">{error}</p>;

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
           <span className="text-blue-500">●</span> Pre-Built Project Inquiries 
           <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full border border-slate-600 ml-2">{requests.length}</span>
        </h3>
        
        <button 
            onClick={fetchRequests} 
            className="px-4 py-2 bg-slate-800 text-blue-400 border border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors shadow-sm"
        >
            Refresh List
        </button>
      </div>
      
      {requests.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
             <p className="text-slate-400 font-medium">No purchase requests yet.</p>
             <p className="text-slate-500 text-sm mt-1">Inquiries for pre-built projects will be listed here.</p>
        </div>
      ) : (
        // Table Container
        <div className="overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              
              {/* Table Header */}
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Client Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Client Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody className="divide-y divide-slate-700">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-700/30 transition-colors group">
                    
                    {/* Project Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                            {req.projectName}
                        </div>
                    </td>
                    
                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {req.user.email}
                    </td>
                    
                    {/* Contact */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-400">
                        {req.user.contact || 'N/A'}
                    </td>
                    
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                    </td>
                    
                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/30 text-amber-500 border border-amber-800">
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyRequestTracking;