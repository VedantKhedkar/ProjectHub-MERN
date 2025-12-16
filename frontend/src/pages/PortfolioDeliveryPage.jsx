import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UploadCloud, Video, FileArchive, Image } from 'lucide-react';

// API Endpoints for PORTFOLIO file management
const GET_PORTFOLIO_PROJECT_URL = 'http://localhost:5000/api/portfolio'; // We'll use /:id
const ADMIN_UPLOAD_VIDEO_URL = 'http://localhost:5000/api/admin/portfolio/upload-video';
const ADMIN_UPLOAD_CODE_URL = 'http://localhost:5000/api/admin/portfolio/upload-code';
const ADMIN_UPLOAD_ASSETS_URL = 'http://localhost:5000/api/admin/portfolio/upload-assets';

// --- Reusable Upload Form Component ---
// This component handles the logic for a single file upload form
const UploadForm = ({ title, description, fileTypeKey, uploadUrl, token, projectId, onUploadSuccess, accept, isMultiple = false }) => {
  const [files, setFiles] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFiles(e.target.files);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }
    
    setIsUploading(true);
    setMessage('Uploading...');
    setError('');

    const data = new FormData();
    // Append all selected files
    for (let i = 0; i < files.length; i++) {
      data.append(fileTypeKey, files[i]);
    }

    try {
      const response = await axios.post(`${uploadUrl}/${projectId}`, data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      setMessage(response.data.message);
      onUploadSuccess(); // Refresh the parent's file list
      e.target.reset(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-zinc-700 rounded-lg">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-zinc-400 text-sm mb-4">{description}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name={fileTypeKey}
          required
          multiple={isMultiple} // Allow multiple files
          onChange={handleFileChange}
          accept={accept} // Apply the specific file filter
          className="block w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
        />
        <button
          type="submit"
          disabled={isUploading}
          className="mt-3 w-full flex items-center justify-center py-2 px-4 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition font-semibold"
        >
          <UploadCloud className="w-5 h-5 mr-2" />
          {isUploading ? 'Uploading...' : `Upload ${title}`}
        </button>
        {message && <p className="text-green-400 mt-2 text-sm">{message}</p>}
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </form>
    </div>
  );
};


// --- Main Delivery Page Component ---
function PortfolioDeliveryPage() {
  const { projectId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user && user.email === 'admin@projecthub.com';

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Data Fetching ---
  const fetchProject = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      // Use the public route to get portfolio details
      const response = await axios.get(`${GET_PORTFOLIO_PROJECT_URL}/${projectId}`);
      setProject(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // This page is ADMIN-ONLY
    if (token && !isAdmin) {
      navigate('/'); // Redirect non-admins
    }
    if (token) {
      fetchProject();
    }
  }, [token, projectId, isAdmin]);

  // --- Render Functions ---
  const renderAdminView = () => (
    <div className="p-6 bg-zinc-800 rounded-lg shadow-xl space-y-6">
      <h2 className="text-2xl font-semibold text-white">Upload Deliverables for: {project.name}</h2>
      
      {/* Form 1: Setup Video */}
      <UploadForm
        title="1. Setup Video"
        description="Upload the project setup guide (.mp4, .mov, etc.)."
        fileTypeKey="setupVideo"
        uploadUrl={ADMIN_UPLOAD_VIDEO_URL}
        token={token}
        projectId={projectId}
        onUploadSuccess={fetchProject}
        accept="video/*"
      />
      
      {/* Form 2: Project Code */}
      <UploadForm
        title="2. Project Code"
        description="Upload the final source code (.zip or .rar)."
        fileTypeKey="projectCode"
        uploadUrl={ADMIN_UPLOAD_CODE_URL}
        token={token}
        projectId={projectId}
        onUploadSuccess={fetchProject}
        accept=".zip,.rar,.7z,application/octet-stream"
      />

      {/* Form 3: Project Assets (Handles multiple files) */}
       <UploadForm
        title="3. Project Assets"
        description="Upload other assets (docs, images, PDFs, etc.)."
        fileTypeKey="projectAssets"
        uploadUrl={ADMIN_UPLOAD_ASSETS_URL}
        token={token}
        projectId={projectId}
        onUploadSuccess={fetchProject}
        accept="image/*,.pdf"
        isMultiple={true}
      />
      
      {/* Display current files */}
      <div className="pt-6 border-t border-zinc-700">
        <h3 className="text-xl font-semibold text-white mb-3">Current Uploaded Files:</h3>
        <div className="space-y-2">
          {project.setupVideoUrl ? (
             <p className="text-green-400">✓ Setup Video: {project.setupVideoUrl.split('-').pop()}</p>
          ) : (
             <p className="text-zinc-400">✗ No Setup Video</p>
          )}
          {project.projectCodeUrl ? (
             <p className="text-green-400">✓ Project Code: {project.projectCodeUrl.split('-').pop()}</p>
          ) : (
             <p className="text-zinc-400">✗ No Project Code</p>
          )}
          {project.assetUrls && project.assetUrls.length > 0 ? (
             <p className="text-green-400">✓ Assets: {project.assetUrls.length} file(s)</p>
          ) : (
             <p className="text-zinc-400">✗ No Assets</p>
          )}
        </div>
      </div>
    </div>
  );

  // --- Main Return ---
  if (loading) return <div className="text-center p-20 text-white">Loading Delivery Page...</div>;
  if (error) return <div className="text-center p-20 text-red-400 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/admin/users" className="text-cyan-400 hover:text-cyan-300 transition">
          &larr; Back to Admin Tools
        </Link>
        
        {/* Check if project exists before trying to access its name */}
        {project ? (
          <>
            <h1 className="text-4xl font-bold text-white">
              Manage Delivery: <span className="text-cyan-400">{project.name}</span>
            </h1>
            {isAdmin ? renderAdminView() : <p>Access Denied.</p>}
          </>
        ) : (
          <h1 className="text-4xl font-bold text-white">Project not found.</h1>
        )}
      </div>
    </div>
  );
}

export default PortfolioDeliveryPage;