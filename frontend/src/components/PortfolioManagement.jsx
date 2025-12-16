import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom'; 

const API_URL = 'http://localhost:5000/api/portfolio';

function PortfolioManagement() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newProjectData, setNewProjectData] = useState({
    name: '', description: '', features: '', techStacks: '', demoUrl: '', price: '',
  });
  const [newFiles, setNewFiles] = useState(null); 
  
  const [editingProject, setEditingProject] = useState(null); 
  const [editFormData, setEditFormData] = useState(null); 
  const [editFiles, setEditFiles] = useState(null);

  const [message, setMessage] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  // --- Utility Functions ---
  const arrayToString = (arr) => (arr ? arr.join(', ') : '');

  // --- Fetching Logic ---
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL); 
      setProjects(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch portfolio projects.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- HANDLERS for Creating New Project ---
  const handleNewChange = (e) => {
    if (e.target.name === 'portfolioImages') {
      setNewFiles(e.target.files);
    } else {
      setNewProjectData({ ...newProjectData, [e.target.name]: e.target.value });
    }
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Adding project...');
    setError('');
    
    if (!newProjectData.name || !newFiles) {
        setError('Please fill in details and upload at least one image.');
        setMessage('');
        return;
    }

    try {
        const data = new FormData();
        data.append('name', newProjectData.name);
        data.append('description', newProjectData.description);
        data.append('demoUrl', newProjectData.demoUrl);
        data.append('price', newProjectData.price);
        data.append('techStacks', newProjectData.techStacks); 
        data.append('features', newProjectData.features); 
        
        if (newFiles) {
            for (let i = 0; i < newFiles.length; i++) {
                data.append('portfolioImages', newFiles[i]);
            }
        }
        
        const response = await axios.post(API_URL, data, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setMessage(response.data.message);
        setProjects(prev => [response.data.project, ...prev]);
        setNewProjectData({ name: '', description: '', features: '', techStacks: '', demoUrl: '', price: '' });
        setNewFiles(null);
        e.target.reset();

    } catch (err) {
        setError(err.response?.data?.message || 'Failed to add project. Check token.');
        setMessage('');
    }
  };

  // --- HANDLERS for Editing Project ---
  const startEdit = (project) => {
    setEditingProject(project);
    setEditFormData({
      ...project,
      features: arrayToString(project.features),
      techStacks: arrayToString(project.techStacks),
      imageUrls: arrayToString(project.imageUrls),
    });
    setEditFiles(null);
    setSubmitMessage('');
    setError('');
  };

  const handleEditChange = (e) => {
    if (e.target.name === 'portfolioImages') {
      setEditFiles(e.target.files);
    } else {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    }
    setSubmitMessage('');
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitMessage('Updating project...');

    try {
        const data = new FormData();
        Object.keys(editFormData).forEach(key => {
            if (key !== 'imageUrls' && key !== 'features' && key !== 'techStacks' && key !== 'assetUrls' && key !== 'setupVideoUrl' && key !== 'projectCodeUrl') {
                data.append(key, editFormData[key]);
            }
        });

        data.append('features', editFormData.features);
        data.append('techStacks', editFormData.techStacks);
        
        if (editFiles && editFiles.length > 0) {
            for (let i = 0; i < editFiles.length; i++) {
                data.append('portfolioImages', editFiles[i]);
            }
        } else {
             data.append('imageUrls', editFormData.imageUrls);
        }
        
        const response = await axios.patch(`${API_URL}/${editingProject.id}`, data, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setSubmitMessage(response.data.message);
        setProjects(prev => prev.map(p => p.id === editingProject.id ? response.data.project : p));
        setEditingProject(null); 
        
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to update project.');
        setSubmitMessage('');
    }
  };

  const handleDelete = async (projectId) => {
    const confirmation = window.confirm('Are you sure you want to delete this portfolio project?');
    if (!confirmation) return;
    
    try {
        await axios.delete(`${API_URL}/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setMessage('Project deleted successfully.');
    } catch (err) {
        setError('Failed to delete project. Check permissions.');
    }
  };

  // --- COMMON UI CLASSES ---
  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5";

  if (loading) return <p className="text-slate-400 animate-pulse text-center py-10">Loading portfolio data...</p>;
  if (error && !projects.length) return <p className="text-red-400 font-semibold bg-red-900/20 p-4 rounded border border-red-900">{error}</p>;

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-10">
      
      {/* --- 1. EDIT PROJECT FORM --- */}
      {editingProject && editFormData && (
        <div className="p-8 bg-slate-800 rounded-xl shadow-2xl border border-blue-500/50 relative overflow-hidden ring-1 ring-blue-500/20">
            {/* Active Edit Strip */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>

            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm">✎</span> 
                Editing: <span className="text-blue-400">{editingProject.name}</span>
            </h3>
            
            {submitMessage && <div className="mb-6 p-3 bg-green-900/20 border border-green-800 text-green-400 rounded-lg text-sm font-medium">{submitMessage}</div>}
            {error && <div className="mb-6 p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-sm font-medium">{error}</div>}

            <form onSubmit={handleUpdate} className="space-y-6" encType="multipart/form-data"> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Project Name</label>
                        <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} required className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Price (Display Text)</label>
                        <input type="text" name="price" value={editFormData.price} onChange={handleEditChange} required className={inputClass} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Description</label>
                    <textarea name="description" value={editFormData.description} onChange={handleEditChange} required rows="3" className={inputClass} />
                </div>

                <div>
                    <label className={labelClass}>Live Demo URL</label>
                    <input type="text" name="demoUrl" value={editFormData.demoUrl} onChange={handleEditChange} required className={inputClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Tech Stacks</label>
                        <input type="text" name="techStacks" value={editFormData.techStacks} onChange={handleEditChange} required className={inputClass} />
                    </div>
                    <div>
                         <label className={labelClass}>Features</label>
                        <input type="text" name="features" value={editFormData.features} onChange={handleEditChange} className={inputClass} />
                    </div>
                </div>
                
                {/* Image Upload Area */}
                <div className='bg-slate-900/50 border border-slate-700 p-5 rounded-lg border-dashed'>
                    <label className='block text-sm font-semibold text-white mb-2'>Project Images</label>
                    <div className="mb-4 text-xs text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto">
                        {editFormData.imageUrls || 'No current images.'}
                    </div>
                    
                    <label htmlFor="editImages" className='block text-sm font-medium text-blue-400 mb-2 cursor-pointer hover:text-blue-300 transition-colors'>+ Upload New Images (Replaces existing)</label>
                    <input 
                        type="file" 
                        name="portfolioImages" 
                        id="editImages"
                        multiple 
                        accept="image/*"
                        onChange={handleEditChange} 
                        className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                    {editFiles && <p className='text-xs text-green-400 mt-2 font-medium flex items-center gap-1'>✓ {editFiles.length} new file(s) selected.</p>}
                </div>

                <div className="flex gap-4 pt-2">
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all">
                        Save Changes
                    </button>
                    <button type="button" onClick={() => setEditingProject(null)} className="flex-1 py-3 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 border border-slate-600 transition-all">
                        Cancel Edit
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* --- 2. ADD NEW PROJECT FORM --- */}
      {!editingProject && (
        <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-green-400">+</span> Add New Project
              </h3>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Portfolio Manager</span>
          </div>
          
          {message && <div className="mb-6 p-3 bg-green-900/20 border border-green-800 text-green-400 rounded-lg text-sm font-medium">{message}</div>}
          {error && <div className="mb-6 p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-sm font-medium">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data"> 
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className={labelClass}>Project Name</label>
                  <input type="text" name="name" placeholder="e.g., E-commerce Platform" value={newProjectData.name} onChange={handleNewChange} required className={inputClass} />
              </div>
              <div>
                  <label className={labelClass}>Live Demo URL</label>
                  <input type="text" name="demoUrl" placeholder="https://..." value={newProjectData.demoUrl} onChange={handleNewChange} required className={inputClass} />
              </div>
            </div>

            <div>
                <label className={labelClass}>Price</label>
                <input type="text" name="price" placeholder="e.g., INR 50000" value={newProjectData.price} onChange={handleNewChange} required className={inputClass} />
            </div>
            
            <div>
                <label className={labelClass}>Description</label>
                <textarea name="description" placeholder="Brief project overview..." value={newProjectData.description} onChange={handleNewChange} required rows="2" className={inputClass} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className={labelClass}>Tech Stack <span className="text-slate-500 text-[10px] normal-case ml-1">(Comma separated)</span></label>
                  <input type="text" name="techStacks" placeholder="React, Node, Tailwind..." value={newProjectData.techStacks} onChange={handleNewChange} required className={inputClass} />
              </div>
              <div>
                  <label className={labelClass}>Features <span className="text-slate-500 text-[10px] normal-case ml-1">(Comma separated)</span></label>
                  <input type="text" name="features" placeholder="Auth, Payment, Dashboard..." value={newProjectData.features} onChange={handleNewChange} className={inputClass} />
              </div>
            </div>
            
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
              <label htmlFor="newImages" className={`${labelClass} mb-2`}>Project Images (Max 5)</label>
              <input 
                type="file" 
                name="portfolioImages" 
                id="newImages"
                multiple 
                accept="image/*"
                onChange={handleNewChange} 
                required
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>
            
            <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 transition-all transform hover:scale-[1.01]">
              Add Project to Portfolio
            </button>
          </form>
        </div>
      )}


      {/* --- 3. EXISTING PROJECTS LIST --- */}
      <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            Existing Portfolio <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full border border-slate-600">{projects.length} Items</span>
          </h3>

          <div className="space-y-4">
            {projects.map(p => (
              <div 
                key={p.id} 
                className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-500 hover:shadow-lg transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group"
              >
                <div className="flex-grow space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</p>
                    <span className="text-xs font-bold text-blue-300 bg-blue-900/30 border border-blue-500/30 px-2.5 py-0.5 rounded-md">
                        {p.price}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-1">{p.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">STACK</span> 
                      {arrayToString(p.techStacks)}
                  </div>
                </div>
                
                {/* --- Action Buttons --- */}
                <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-700"> 
                  {/* Edit Details Button */}
                  <button
                    onClick={() => startEdit(p)}
                    className="flex-1 md:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wide text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!editingProject}
                  >
                    Edit
                  </button>
                  
                  {/* Manage Files Button */}
                  <Link
                    to={`/admin/portfolio-files/${p.id}`}
                    className="flex-1 md:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 hover:text-white transition-colors text-center"
                  >
                    Files
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="flex-1 md:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wide text-white bg-red-600/90 rounded-lg hover:bg-red-700 shadow-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {projects.length === 0 && !loading && (
                <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                    <p className="text-slate-500 font-medium">No projects found in portfolio.</p>
                    <p className="text-slate-600 text-sm mt-1">Use the form above to add your first project.</p>
                </div>
            )}
          </div>
      </div>
    </div>
  );
}

export default PortfolioManagement;