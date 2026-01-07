import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { format } from 'date-fns';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const API_URL = 'http://localhost:5000/api/admin/payments';

// --- PDF STYLES ---
const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { marginBottom: 20, textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#666' },
  
  // Table
  table: { display: "table", width: "auto", borderStyle: "solid", borderRightWidth: 0, borderBottomWidth: 0 }, 
  tableRow: { margin: "auto", flexDirection: "row" }, 
  tableColHeader: { width: "16%", borderStyle: "solid", borderBottomWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, borderColor: "#e2e8f0", backgroundColor: "#f8fafc" },   
  tableCol: { width: "16%", borderStyle: "solid", borderBottomWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, borderColor: "#e2e8f0" }, 
  
  // Cells
  tableCellHeader: { margin: 5, fontSize: 8, fontWeight: 'bold', color: '#475569' },  
  tableCell: { margin: 5, fontSize: 8, color: '#334155' },
  
  // Specific Column Widths override
  colDate: { width: "20%" },
  colId: { width: "20%" },
  colEmail: { width: "25%" },
  colAmount: { width: "10%" },
  
  footer: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#94a3b8' }
});

// --- PDF COMPONENT ---
const PaymentHistoryDocument = ({ payments }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      
      {/* Header */}
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>Transaction Log Report</Text>
        <Text style={pdfStyles.subtitle}>Generated on {new Date().toLocaleDateString()} • {payments.length} Records</Text>
      </View>

      {/* Table Header */}
      <View style={pdfStyles.tableRow}>
        <View style={{...pdfStyles.tableColHeader, ...pdfStyles.colDate}}>
          <Text style={pdfStyles.tableCellHeader}>Date</Text>
        </View>
        <View style={{...pdfStyles.tableColHeader, ...pdfStyles.colId}}>
          <Text style={pdfStyles.tableCellHeader}>Payment ID</Text>
        </View>
        <View style={{...pdfStyles.tableColHeader, ...pdfStyles.colAmount}}>
          <Text style={pdfStyles.tableCellHeader}>Amount</Text>
        </View>
        <View style={pdfStyles.tableColHeader}>
          <Text style={pdfStyles.tableCellHeader}>Project</Text>
        </View>
        <View style={{...pdfStyles.tableColHeader, ...pdfStyles.colEmail}}>
          <Text style={pdfStyles.tableCellHeader}>Client</Text>
        </View>
        <View style={pdfStyles.tableColHeader}>
          <Text style={pdfStyles.tableCellHeader}>Type</Text>
        </View>
      </View>

      {/* Table Rows */}
      {payments.map((p, index) => {
         const projectName = p.project?.projectName || p.portfolioProjectName || 'N/A';
         return (
          <View style={pdfStyles.tableRow} key={index}>
            <View style={{...pdfStyles.tableCol, ...pdfStyles.colDate}}>
              <Text style={pdfStyles.tableCell}>{format(new Date(p.createdAt), 'MMM dd, yyyy HH:mm')}</Text>
            </View>
            <View style={{...pdfStyles.tableCol, ...pdfStyles.colId}}>
              <Text style={pdfStyles.tableCell}>{p.razorpayPaymentId}</Text>
            </View>
            <View style={{...pdfStyles.tableCol, ...pdfStyles.colAmount}}>
              <Text style={{...pdfStyles.tableCell, fontWeight: 'bold'}}>Rs. {p.amount / 100}</Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCell}>{projectName}</Text>
            </View>
            <View style={{...pdfStyles.tableCol, ...pdfStyles.colEmail}}>
              <Text style={pdfStyles.tableCell}>{p.user?.email}</Text>
            </View>
            <View style={pdfStyles.tableCol}>
              <Text style={pdfStyles.tableCell}>{p.paymentType}</Text>
            </View>
          </View>
         );
      })}

      <View style={pdfStyles.footer}>
        <Text>Confidential • Internal Admin Document</Text>
      </View>
    </Page>
  </Document>
);


function PaymentTracking() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPayments();
    }
  }, [token]); 

  // --- FILTER & SORT LOGIC ---
  const getProcessedPayments = () => {
    let processed = [...payments];

    // Filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      processed = processed.filter(payment => {
        const projectName = payment.project?.projectName || payment.portfolioProjectName || '';
        const email = payment.user?.email || '';
        const paymentId = payment.razorpayPaymentId || '';
        return (
          projectName.toLowerCase().includes(lowerQuery) ||
          email.toLowerCase().includes(lowerQuery) ||
          paymentId.toLowerCase().includes(lowerQuery)
        );
      });
    }

    // Sort
    processed.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      const amountA = a.amount;
      const amountB = b.amount;

      switch (sortOption) {
        case 'newest': return dateB - dateA;
        case 'oldest': return dateA - dateB;
        case 'amountHigh': return amountB - amountA;
        case 'amountLow': return amountA - amountB;
        default: return 0;
      }
    });

    return processed;
  };

  const displayedPayments = getProcessedPayments();

  // Styles
  const selectClass = "bg-slate-900 border border-slate-700 text-white text-xs font-medium rounded focus:ring-1 focus:ring-blue-500 block py-2 px-3 cursor-pointer hover:border-slate-600 outline-none";
  const searchInputClass = "w-full md:w-64 bg-slate-900 border border-slate-700 text-white text-xs rounded pl-9 pr-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-500 transition-colors";


  if (loading) return <p className="text-slate-400 animate-pulse text-center py-10">Loading payment records...</p>;
  if (error) return <p className="text-red-400 font-semibold bg-red-900/20 p-4 rounded border border-red-900/50">{error}</p>;

  return (
    <div className="space-y-6">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-6">
        
        {/* Title & Actions */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <span className="text-blue-500">●</span> Transaction Log 
             <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full border border-slate-600 ml-2">{payments.length}</span>
          </h3>
          
          <div className="flex gap-3">
             {/* PDF Export Button */}
             <PDFDownloadLink 
                document={<PaymentHistoryDocument payments={displayedPayments} />} 
                fileName={`transactions-${new Date().toISOString().slice(0,10)}.pdf`}
             >
                {({ loading }) => (
                  <button 
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white border border-blue-500 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    {loading ? 'Generating...' : 'Export PDF'}
                  </button>
                )}
             </PDFDownloadLink>

             <button 
                onClick={fetchPayments} 
                className="px-4 py-2 bg-slate-800 text-blue-400 border border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors shadow-sm"
             >
                Refresh
             </button>
          </div>
        </div>

        {/* Controls: Search & Sort */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
           
           <div className="relative w-full md:w-auto">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <input 
               type="text" 
               placeholder="Search by ID, Project, or Email..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className={searchInputClass}
             />
           </div>

           <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Sort By:</label>
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)} 
                className={`${selectClass} w-full md:w-auto`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amountHigh">Highest Amount</option>
                <option value="amountLow">Lowest Amount</option>
              </select>
           </div>
        </div>
      </div>
      
      {/* --- TABLE --- */}
      {payments.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
             <p className="text-slate-400 font-medium">No successful payments recorded yet.</p>
        </div>
      ) : (
        <>
           {displayedPayments.length === 0 && (
              <div className="text-center py-10 bg-slate-800/30 rounded-xl border border-slate-700">
                 <p className="text-slate-400">No transactions match your search.</p>
                 <button onClick={() => setSearchQuery('')} className="text-blue-400 text-xs mt-2 hover:underline">Clear Search</button>
              </div>
           )}

           {displayedPayments.length > 0 && (
            <div className="overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
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
                  <tbody className="divide-y divide-slate-700">
                    {displayedPayments.map((payment) => {
                      const projectName = payment.project?.projectName || payment.portfolioProjectName || 'N/A';
                      return (
                        <tr key={payment.id} className="hover:bg-slate-700/30 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                            {format(new Date(payment.createdAt), 'MMM dd, yyyy - hh:mm a')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-700 select-all">
                                  {payment.razorpayPaymentId}
                              </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-400">
                            ₹ {payment.amount / 100}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                              {projectName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                              {payment.user.email}
                          </td>
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
        </>
      )}
    </div>
  );
}

export default PaymentTracking;