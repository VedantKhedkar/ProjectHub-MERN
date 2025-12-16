import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Download, Video, FileArchive, Image } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/projects/my-purchases';

// Helper component to render a download link (Themed)
const DownloadLink = ({ url, label, icon }) => (
  <a 
    href={url} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center p-4 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-200 group"
  >
    <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-600/20 transition-colors">
        {icon}
    </div>
    <span className="ml-4 text-slate-300 font-medium group-hover:text-white transition-colors">{label}</span>
    <Download className="w-5 h-5 ml-auto text-slate-500 group-hover:text-blue-400 transition-colors" />
  </a>
);

function MyPrebuiltProjectsPage() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPurchases = async () => {
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
        setProjects(response.data);
      } catch (err) {
        setError('Failed to load your purchased projects.');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [token]);

  return (
    // Global Deep Background
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-blue-500">●</span> My Prebuilt Projects
            </h1>
            <p className="text-lg text-slate-400 mt-2 max-w-2xl">
                Access and download resources for all your purchased projects.
            </p>
        </div>

        <section>
          {loading && <p className="text-slate-400 animate-pulse">Loading library...</p>}
          {error && <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg text-red-400">{error}</div>}
          
          {!loading && projects.length === 0 && (
            <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
              <p className="text-slate-400 text-lg mb-4">
                You haven't purchased any prebuilt projects yet.
              </p>
              <Link 
                to="/my-prebuilt-projects" // Assuming this redirects to the shop/portfolio
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
              >
                Browse Portfolio
              </Link>
            </div>
          )}

          <div className="space-y-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>
                    <p className="text-sm text-slate-400">
                        Purchase Verified • Access Granted
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  
                  {/* 1. Setup Video */}
                  {project.setupVideoUrl ? (
                    <DownloadLink 
                      url={project.setupVideoUrl} 
                      label="Download Setup Video" 
                      icon={<Video className="w-6 h-6 text-blue-400" />} 
                    />
                  ) : (
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500 text-sm flex items-center gap-3">
                        <Video className="w-5 h-5 opacity-50" /> No setup video provided.
                    </div>
                  )}
                  
                  {/* 2. Project Code */}
                  {project.projectCodeUrl ? (
                    <DownloadLink 
                      url={project.projectCodeUrl} 
                      label="Download Source Code (.zip)" 
                      icon={<FileArchive className="w-6 h-6 text-blue-400" />} 
                    />
                  ) : (
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500 text-sm flex items-center gap-3">
                        <FileArchive className="w-5 h-5 opacity-50" /> No source code provided.
                    </div>
                  )}
                  
                  {/* 3. Other Assets */}
                  {project.assetUrls && project.assetUrls.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Additional Assets</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.assetUrls.map((url, index) => (
                           <DownloadLink 
                             key={index}
                             url={url} 
                             label={`Asset ${index + 1}`} 
                             icon={<Image className="w-6 h-6 text-blue-400" />} 
                           />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default MyPrebuiltProjectsPage;