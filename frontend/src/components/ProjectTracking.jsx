import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom'; 

// Define all API endpoints
const API_URL = 'http://localhost:5000/api/admin/projects';
const QUOTE_URL = 'http://localhost:5000/api/admin/projects/send-quote';
const PROGRESS_URL = 'http://localhost:5000/api/admin/projects/update-progress';
const STATUS_URL = 'http://localhost:5000/api/admin/projects/status'; 

const STATUS_OPTIONS = [
  'Pending Admin Review', 
  'Quote Sent - Awaiting 50% Payment', 
  'In Progress', 
  'Awaiting Final Payment', 
  'Delivered'
];

function ProjectTracking() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [quoteInputs, setQuoteInputs] = useState({});
  const [progressInputs, setProgressInputs] = useState({});

  const fetchProjects = async () => {
    if (!token) {
      setLoading(false); 
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProjects(response.data);
      
      const initialQuotes = {};
      const initialProgress = {};
      response.data.forEach(p => {
        initialQuotes[p.id] = p.finalQuote || '';
        initialProgress[p.id] = p.completionPercentage || 0;
      });
      setQuoteInputs(initialQuotes);
      setProgressInputs(initialProgress);
      
    } catch (err) {
      setError(`Failed to fetch project list. Status: ${err.response?.status || 'Network Error'}`);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
    } else {
      setLoading(true);
    }
  }, [token]);

  // --- API Handlers ---
  const handleSendQuote = async (projectId) => {
    const finalQuote = quoteInputs[projectId];
    if (!finalQuote || finalQuote <= 0) {
      alert('Please enter a valid quote amount.');
      return;
    }
    try {
      await axios.patch(`${QUOTE_URL}/${projectId}`, { finalQuote }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProjects(); 
      alert('Quote sent to user!');
    } catch (err) {
      setError(`Failed to send quote for project ${projectId}.`);
    }
  };

  const handleUpdateProgress = async (projectId) => {
    const completionPercentage = progressInputs[projectId];
    if (completionPercentage == null || completionPercentage < 0 || completionPercentage > 100) {
      alert('Please enter a percentage between 0 and 100.');
      return;
    }
    try {
      await axios.patch(`${PROGRESS_URL}/${projectId}`, { completionPercentage }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProjects(); 
      alert('Progress updated!');
    } catch (err) {
      setError(`Failed to update progress for project ${projectId}.`);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await axios.patch(`${STATUS_URL}/${projectId}`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProjects(prevProjects => 
        prevProjects.map(p => p.id === projectId ? { ...p, status: newStatus } : p)
      );
    } catch (err) {
      setError(`Failed to update status for project ${projectId}.`);
    }
  };

  // --- Input Change Handlers ---
  const handleQuoteChange = (projectId, value) => {
    setQuoteInputs(prev => ({ ...prev, [projectId]: value }));
  };
  
  const handleProgressChange = (projectId, value) => {
    setProgressInputs(prev => ({ ...prev, [projectId]: value }));
  };

  // --- Theme Classes ---
  const inputClass = "bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 placeholder-slate-500 transition-colors";
  const selectClass = "bg-slate-900 border border-slate-700 text-white text-xs font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 transition-colors cursor-pointer hover:border-slate-600";

  if (loading) return <p className="text-slate-400 animate-pulse text-center py-10">Loading project requests...</p>;
  if (error) return <p className="text-red-400 font-semibold bg-red-900/20 p-4 rounded border border-red-900/50">{error}</p>;

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
           <span className="text-blue-500">●</span> Project Requests 
           <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full ml-2 border border-slate-600">{projects.length}</span>
        </h3>
        
        <button 
            onClick={fetchProjects} 
            className="px-4 py-2 bg-slate-800 text-blue-400 border border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all shadow-sm"
        >
            Refresh Data
        </button>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
             <p className="text-slate-400 font-medium">No project requests submitted yet.</p>
             <p className="text-slate-500 text-sm mt-1">New submissions will appear here.</p>
        </div>
      ) : (
        // Table Container
        <div className="overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
                
              {/* Table Header */}
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Client & Project</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Attachments</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-64">Status & Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Quote (INR)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th> 
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-700">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition-colors group">
                    
                    {/* Client & Project Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xs">
                              {p.projectName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                              <div className="text-sm font-bold text-white mb-0.5">{p.projectName}</div>
                              <div className="text-xs text-slate-400 font-mono mb-1">{p.user.email}</div>
                              <div className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 border border-slate-600">
                                Est. {p.budgetEstimate}
                              </div>
                          </div>
                      </div>
                    </td>
                    
                    {/* Attachments */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {p.attachments && p.attachments.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                            {p.attachments.map((url, index) => (
                                <a 
                                    key={index}
                                    href={`http://localhost:5000${url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50 hover:border-slate-600 hover:bg-slate-700"
                                >
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                    File {index + 1}
                                </a>
                            ))}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs italic">No attachments</span>
                      )}
                    </td>
                    
                    {/* Status & Payment Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                          <select
                            value={p.status}
                            onChange={(e) => handleStatusChange(p.id, e.target.value)}
                            className={selectClass}
                          >
                            {STATUS_OPTIONS.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          
                          <div>
                             <span className={`px-2.5 py-1 inline-flex text-[10px] font-bold uppercase tracking-wide rounded-md border 
                                ${p.paymentStatus === 'Paid' 
                                    ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' 
                                    : 'bg-amber-900/20 text-amber-500 border-amber-800'}`}>
                                {p.paymentStatus}
                             </span>
                          </div>
                      </div>
                    </td>

                    {/* Quote Input */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {p.status === "Pending Admin Review" ? (
                        <div className="flex items-center gap-2">
                          <div className="relative w-28">
                              <span className="absolute left-2.5 top-2 text-slate-500 text-xs">₹</span>
                              <input
                                type="number"
                                placeholder="Amount"
                                value={quoteInputs[p.id] || ''}
                                onChange={(e) => handleQuoteChange(p.id, e.target.value)}
                                className={`${inputClass} pl-6 py-1.5`}
                              />
                          </div>
                          <button
                            onClick={() => handleSendQuote(p.id)}
                            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/20"
                            title="Send Quote"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-900/10 px-3 py-1.5 rounded-lg border border-emerald-900/30">
                            ₹ {p.finalQuote}
                        </span>
                      )}
                    </td>
                    
                    {/* Progress Input */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {p.status !== "Pending Admin Review" && p.paymentStatus !== "Not Quoted" ? (
                        <div className="flex items-center gap-2">
                           <div className="relative w-20">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={progressInputs[p.id] || 0}
                                onChange={(e) => handleProgressChange(p.id, e.target.value)}
                                className={`${inputClass} pr-6 py-1.5 text-center`}
                              />
                              <span className="absolute right-2 top-2 text-slate-500 text-xs">%</span>
                           </div>
                          <button
                            onClick={() => handleUpdateProgress(p.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-900/20"
                          >
                            Set
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic pl-2">Waiting for quote...</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(p.status === 'Awaiting Delivery' || p.status === 'Delivered') ? (
                        <Link 
                          to={`/project/delivery/${p.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-slate-700 text-blue-400 border border-slate-600 text-xs font-semibold rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-sm"
                        >
                          Files & Delivery
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-600 pl-4">--</span>
                      )}
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

export default ProjectTracking;