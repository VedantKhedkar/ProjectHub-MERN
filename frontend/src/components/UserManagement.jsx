import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { format } from 'date-fns';

const API_URL = 'http://localhost:5000/api/admin/pending-users';
const APPROVE_URL = 'http://localhost:5000/api/admin/approve-user';

function UserManagement() {
  const { token } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingUsers = async () => {
    if (!token) {
      console.log("UserManagement: Fetch aborted, no token.");
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      console.log("UserManagement: Fetching with token...");
      
      const response = await axios.get(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("UserManagement: Data fetched", response.data);
      setPendingUsers(response.data);
      
    } catch (err) {
      console.error("UserManagement Fetch Error:", err);
      setError(`Failed to fetch pending users. Status: ${err.response?.status || 'Network Error'}`);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (token) {
      fetchPendingUsers();
    } else {
      console.log("UserManagement: Waiting for token...");
      setLoading(true);
    }
  }, [token]); 

  const handleApprove = async (userId) => {
    try {
      await axios.patch(`${APPROVE_URL}/${userId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      alert('User approved and status set to Active!');
    } catch (err) {
      setError(`Failed to approve user ${userId}.`);
    }
  };

  if (loading) return <p className="text-slate-400 animate-pulse text-center py-10">Loading pending users...</p>;
  if (error) return <p className="text-red-400 font-semibold bg-red-900/20 p-4 rounded border border-red-900/50">{error}</p>;

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
           <span className="text-blue-500">●</span> Pending Registrations 
           {pendingUsers.length > 0 && <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full ml-2">{pendingUsers.length}</span>}
        </h3>
        
        <button 
            onClick={fetchPendingUsers} 
            className="px-4 py-2 bg-slate-800 text-blue-400 border border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors"
        >
            Refresh List
        </button>
      </div>
      
      {pendingUsers.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
             <p className="text-green-400 font-medium">No new users are pending approval. 🎉</p>
             <p className="text-slate-500 text-sm mt-1">All registrations have been processed.</p>
        </div>
      ) : (
        // Table Container
        <div className="overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              
              {/* Table Header */}
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Registered On</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody className="divide-y divide-slate-700">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    
                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white">{user.email}</div>
                    </td>
                    
                    {/* Contact */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-slate-400">{user.contact || 'N/A'}</div>
                    </td>
                    
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </td>
                    
                    {/* Action Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-105"
                      >
                        ✓ Approve
                      </button>
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

export default UserManagement;