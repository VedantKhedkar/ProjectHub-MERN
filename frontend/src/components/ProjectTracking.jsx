import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import BASE_URL from '../config';

const API_URL = `${BASE_URL}/api/admin/projects`;
const QUOTE_URL = `${BASE_URL}/api/admin/projects/send-quote`;
// Add other URLs if they exist in this file (like PROGRESS_URL, STATUS_URL)
const PROGRESS_URL = `${BASE_URL}/api/admin/projects/update-progress`;
const STATUS_URL = `${BASE_URL}/api/admin/projects/status`;

const STATUS_OPTIONS = [
  'Pending Admin Review', 
  'Quote Sent - Awaiting 50% Payment', 
  'In Progress', 
  'Awaiting Final Payment', 
  'Delivered'
];

// PAYMENT FILTER OPTIONS
const PAYMENT_FILTER_OPTIONS = ['All', 'Not Quoted', '50% Paid', '100% Paid'];

// --- PDF STYLES (Kept exactly as is) ---
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#333' },
  header: { marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginBottom: 5 }, 
  subtitle: { fontSize: 10, color: '#666' },
  section: { marginBottom: 15, padding: 10, border: '1px solid #eee', borderRadius: 5 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#1e293b', textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 100, fontWeight: 'bold', color: '#64748b' },
  value: { flex: 1, color: '#0f172a' },
  descriptionBox: { marginTop: 5, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4, lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 9, borderTop: '1px solid #eee', paddingTop: 10 }
});

const getPdfUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; 
  return `http://localhost:5000${path}`;   
};

// --- PDF DOCUMENT COMPONENT ---
const ProjectRequestDocument = ({ project }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>PROJECT REQUEST</Text>
        <Text style={pdfStyles.subtitle}>Ref ID: {project.id}</Text>
        <Text style={pdfStyles.subtitle}>Generated on: {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Client Information</Text>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>User Email:</Text>
          <Text style={pdfStyles.value}>{project.user?.email || 'N/A'}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Contact:</Text>
          <Text style={pdfStyles.value}>{project.user?.contact || 'N/A'}</Text>
        </View>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Project Overview</Text>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Project Name:</Text>
          <Text style={pdfStyles.value}>{project.projectName}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Budget Est:</Text>
          <Text style={pdfStyles.value}>{project.budgetEstimate}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Current Status:</Text>
          <Text style={pdfStyles.value}>{project.status}</Text>
        </View>
        
        <Text style={{ marginTop: 10, fontSize: 10, color: '#64748b' }}>Detailed Description:</Text>
        <View style={pdfStyles.descriptionBox}>
          <Text>
            {project.projectDetails || project.description || 'No description found.'}
          </Text>
        </View>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Financial & Progress</Text>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Final Quote:</Text>
          <Text style={pdfStyles.value}>{project.finalQuote ? `INR ${project.finalQuote}` : 'Not Quoted'}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Payment Status:</Text>
          <Text style={pdfStyles.value}>{project.paymentStatus}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Progress:</Text>
          <Text style={pdfStyles.value}>{project.completionPercentage}%</Text>
        </View>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Attachments</Text>
        {project.attachments && project.attachments.length > 0 ? (
          project.attachments.map((url, idx) => (
            <Text key={idx} style={{ fontSize: 10, color: '#2563eb', marginBottom: 2 }}>
              • File {idx + 1}: {getPdfUrl(url)}
            </Text>
          ))
        ) : (
          <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#94a3b8' }}>No files attached.</Text>
        )}
      </View>

      <View style={pdfStyles.footer}>
        <Text>ProjectHub Internal Admin Document • Confidential</Text>
      </View>
    </Page>
  </Document>
);

// --- MAIN COMPONENT ---
function ProjectTracking() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [quoteInputs, setQuoteInputs] = useState({});
  const [progressInputs, setProgressInputs] = useState({});

  // NEW: Track expanded row
  const [expandedRowId, setExpandedRowId] = useState(null);

  // NEW: Filter and Sort state
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

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

  // NEW: Function to get filtered and sorted projects
  const getFilteredAndSortedProjects = () => {
    let filtered = [...projects];

    // Filtering by Payment Status
    if (paymentFilter !== 'All') {
      filtered = filtered.filter(p => p.paymentStatus === paymentFilter);
    }

    // Sorting by Date (assuming 'createdAt' field exists)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

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
      alert('Failed to send quote.');
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
      alert('Failed to update progress.');
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
      alert('Failed to update status.');
    }
  };

  const handleQuoteChange = (projectId, value) => {
    setQuoteInputs(prev => ({ ...prev, [projectId]: value }));
  };
  
  const handleProgressChange = (projectId, value) => {
    setProgressInputs(prev => ({ ...prev, [projectId]: value }));
  };

  // --- Styles ---
  const inputClass = "bg-slate-900 border border-slate-700 text-white text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full px-2 py-1 transition-colors";
  const selectClass = "bg-slate-900 border border-slate-700 text-white text-xs font-medium rounded focus:ring-1 focus:ring-blue-500 block w-full py-1 px-2 cursor-pointer hover:border-slate-600";

  if (loading) return <p className="text-slate-400 animate-pulse text-center py-10">Loading...</p>;
  if (error) return <p className="text-red-400 text-center py-10">{error}</p>;

  const displayedProjects = getFilteredAndSortedProjects();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
           <span className="text-blue-500">●</span> Project Requests 
           <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full ml-2 border border-slate-600">{projects.length}</span>
        </h3>
        <button onClick={fetchProjects} className="px-3 py-1.5 bg-slate-800 text-blue-400 border border-slate-700 rounded text-xs font-medium hover:bg-slate-700 hover:text-white transition-all">
           Refresh
        </button>
      </div>
      
      {/* NEW: Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
        
        {/* Payment Filter */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          <label htmlFor="paymentFilter" className="text-sm text-slate-400 font-medium">Filter Payment:</label>
          <select
            id="paymentFilter"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-medium rounded focus:ring-1 focus:ring-blue-500 block py-1 px-2 cursor-pointer hover:border-slate-600"
          >
            {PAYMENT_FILTER_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
          <label htmlFor="sortOrder" className="text-sm text-slate-400 font-medium">Sort Date:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-medium rounded focus:ring-1 focus:ring-blue-500 block py-1 px-2 cursor-pointer hover:border-slate-600"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
             <p className="text-slate-400 text-sm">No project requests found.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900/50 uppercase font-bold text-xs">
                <tr>
                  <th className="px-4 py-3">Client & Project</th>
                  <th className="px-4 py-3 w-48">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 w-32">Quote (INR)</th>
                  <th className="px-4 py-3 w-32">Progress</th>
                  <th className="px-4 py-3 text-center w-16">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {displayedProjects.map((p) => {
                  const isExpanded = expandedRowId === p.id;
                  
                  return (
                    // React Fragment to allow two TRs per map iteration
                    < >
                      {/* --- MAIN ROW (Collapsed View) --- */}
                      <tr key={p.id} className={`hover:bg-slate-700/30 transition-colors ${isExpanded ? 'bg-slate-700/20' : ''}`}>
                        
                        {/* 1. Project Info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xs">
                                  {p.projectName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                  <div className="font-bold text-white text-sm">{p.projectName}</div>
                                  <div className="text-[10px] text-slate-500">{p.user.email}</div>
                              </div>
                          </div>
                        </td>

                        {/* 2. Status Select */}
                        <td className="px-4 py-3">
                          <select
                            value={p.status}
                            onChange={(e) => handleStatusChange(p.id, e.target.value)}
                            className={selectClass}
                            onClick={(e) => e.stopPropagation()} // Prevent row toggle
                          >
                            {STATUS_OPTIONS.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>

                        {/* 3. Payment Badge */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wide rounded border 
                            ${p.paymentStatus === 'Paid' 
                                ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' 
                                : 'bg-amber-900/20 text-amber-500 border-amber-800'}`}>
                            {p.paymentStatus}
                          </span>
                        </td>

                        {/* 4. Quote Input */}
                        <td className="px-4 py-3">
                           <div className="flex items-center gap-1">
                              <span className="text-slate-500 text-xs">₹</span>
                              <input
                                type="number"
                                placeholder="0"
                                value={quoteInputs[p.id] || ''}
                                onChange={(e) => handleQuoteChange(p.id, e.target.value)}
                                className={inputClass}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button onClick={(e) => { e.stopPropagation(); handleSendQuote(p.id); }} className="text-emerald-500 hover:text-emerald-400" title="Save Quote">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              </button>
                           </div>
                        </td>

                        {/* 5. Progress Bar & Input */}
                        <td className="px-4 py-3">
                           <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progressInputs[p.id] || 0}%` }}></div>
                              </div>
                              <input
                                type="number"
                                min="0" max="100"
                                value={progressInputs[p.id] || 0}
                                onChange={(e) => handleProgressChange(p.id, e.target.value)}
                                onBlur={() => handleUpdateProgress(p.id)} // Save on blur
                                className={`${inputClass} w-12 text-center`}
                                onClick={(e) => e.stopPropagation()}
                              />
                           </div>
                        </td>

                        {/* 6. Expand Button */}
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => toggleRow(p.id)}
                            className={`p-1.5 rounded hover:bg-slate-600 transition-all ${isExpanded ? 'text-blue-400 rotate-180 transform' : 'text-slate-400'}`}
                          >
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </td>
                      </tr>

                      {/* --- EXPANDED ROW (Details) --- */}
                      {isExpanded && (
                        <tr className="bg-slate-900/50 border-b border-slate-700 shadow-inner">
                          <td colSpan="6" className="p-0">
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                              
                              {/* Left: Details & Attachments */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Detailed Description</h4>
                                  <div className="bg-slate-800 p-3 rounded border border-slate-700 text-xs text-slate-300 leading-relaxed">
                                    {p.projectDetails || p.description || "No specific details provided."}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Attachments</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {p.attachments && p.attachments.length > 0 ? (
                                      p.attachments.map((url, index) => (
                                        <a key={index} href={getPdfUrl(url)} target="_blank" rel="noreferrer"
                                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-xs text-blue-400 hover:text-white hover:border-blue-500 transition-colors">
                                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg>
                                          Attachment {index + 1}
                                        </a>
                                      ))
                                    ) : (
                                      <span className="text-xs text-slate-600 italic">No files attached</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className="space-y-4 border-l border-slate-700 pl-8">
                                <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Project Actions</h4>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  {/* PDF Export */}
                                  <PDFDownloadLink document={<ProjectRequestDocument project={p} />} fileName={`request-${p.id.slice(-6)}.pdf`} className="w-full">
                                    {({ loading }) => (
                                      <button disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 hover:bg-slate-600 text-white text-xs font-medium rounded transition-all">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        {loading ? 'Generating...' : 'Export PDF'}
                                      </button>
                                    )}
                                  </PDFDownloadLink>

                                  {/* Deliver Button (Conditional) */}
                                  {(p.status === 'In Progress' || p.status === 'Awaiting Final Payment' || p.status === 'Delivered') && (
                                    <Link to={`/project/delivery/${p.id}`} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 border border-blue-500 hover:bg-blue-700 text-white text-xs font-medium rounded transition-all">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                      Deliver Files
                                    </Link>
                                  )}
                                </div>

                                <div className="bg-slate-800 p-3 rounded mt-4">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Budget Estimate:</span>
                                    <span className="text-slate-200">₹ {p.budgetEstimate}</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-400">Final Quote:</span>
                                    <span className="text-emerald-400">₹ {p.finalQuote || '0'}</span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </ >
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

export default ProjectTracking;