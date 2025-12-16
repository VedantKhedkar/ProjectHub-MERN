import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UploadCloud, Download, FileArchive, Video, Image, FileText } from 'lucide-react';

// API Endpoints
const GET_PROJECT_URL = 'http://localhost:5000/api/projects/my-project';
const ADMIN_UPLOAD_VIDEO_URL = 'http://localhost:5000/api/admin/projects/upload-video';
const ADMIN_UPLOAD_CODE_URL = 'http://localhost:5000/api/admin/projects/upload-code';
const ADMIN_UPLOAD_ASSETS_URL = 'http://localhost:5000/api/admin/projects/upload-assets';

// --- Reusable Upload Form Component ---
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
          multiple={isMultiple}
          onChange={handleFileChange}
          accept={accept} 
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


// --- Reusable Download Section Component ---
const DownloadSection = ({ title, files, icon }) => {
  if (!files || files.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-zinc-500 text-sm">No {title.toLowerCase()} files uploaded yet.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <div className="space-y-3">
        {files.map((file) => (
          <a
            key={file.id}
            href={`http://localhost:5000${file.url}`}
            download
            className="flex items-center p-4 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition"
          >
            {icon}
            <span className="ml-4 text-white font-medium">{file.filename}</span>
            <Download className="w-5 h-5 ml-auto text-zinc-400" />
          </a>
        ))}
      </div>
    </div>
  );
};


// --- Main Delivery Page Component ---
function ProjectDeliveryPage() {
  const { projectId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.email === 'admin@projecthub.com';

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Data Fetching ---
  const fetchProject = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      // This route now includes 'deliveryFiles'
      const response = await axios.get(`${GET_PROJECT_URL}/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProject(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // --- THIS IS THE FIX ---
    // Removed the bad "if (isLoggedIn && !isAdmin)" check.
    // The route is already protected, so we just need to fetch the data.
    if (token) {
      fetchProject();
    }
    // --- END FIX ---
  }, [token, projectId]);

  // --- Render Functions ---

  const renderAdminView = () => (
    <div className="p-6 bg-zinc-800 rounded-lg shadow-xl space-y-6">
      <h2 className="text-2xl font-semibold text-white">Admin Upload: Final Assets</h2>
      
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
          {project && project.deliveryFiles ? (
            <>
              <p className={project.deliveryFiles.some(f => f.fileType === 'Video') ? "text-green-400" : "text-zinc-400"}>
                {project.deliveryFiles.some(f => f.fileType === 'Video') ? '✓ Setup Video' : '✗ No Setup Video'}
              </p>
              <p className={project.deliveryFiles.some(f => f.fileType === 'Code') ? "text-green-400" : "text-zinc-400"}>
                {project.deliveryFiles.some(f => f.fileType === 'Code') ? '✓ Project Code' : '✗ No Project Code'}
              </p>
              <p className={project.deliveryFiles.some(f => f.fileType === 'Asset') ? "text-green-400" : "text-zinc-400"}>
                {project.deliveryFiles.some(f => f.fileType === 'Asset') ? '✓ Assets' : '✗ No Assets'}
              </p>
            </>
          ) : (
            <p className="text-zinc-400">Loading file status...</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderUserView = () => {
    // Filter the files based on their type
    const videoFiles = project.deliveryFiles?.filter(f => f.fileType === 'Video') || [];
    const codeFiles = project.deliveryFiles?.filter(f => f.fileType === 'Code') || [];
    const assetFiles = project.deliveryFiles?.filter(f => f.fileType === 'Asset') || [];

    return (
      <div className="p-6 bg-zinc-800 rounded-lg shadow-xl space-y-8">
        <h2 className="text-3xl font-semibold text-white mb-4">Project Delivery Files</h2>
        <p className="text-zinc-300 mb-6">
          Thank you for your payment. Your final project files are available for download.
        </p>
        
        <DownloadSection 
          title="Setup Video(s)" 
          files={videoFiles} 
          icon={<Video className="w-6 h-6 text-cyan-400 flex-shrink-0" />} 
        />
        
        <DownloadSection 
          title="Project Code (.zip/.rar)" 
          files={codeFiles} 
          icon={<FileArchive className="w-6 h-6 text-cyan-400 flex-shrink-0" />} 
        />
        
        <DownloadSection 
          title="Assets & Documentation" 
          files={assetFiles} 
          icon={<Image className="w-6 h-6 text-cyan-400 flex-shrink-0" />} 
        />

        {(videoFiles.length + codeFiles.length + assetFiles.length === 0) && (
          <p className="text-yellow-400 font-semibold">The admin has not uploaded the final delivery files yet.</p>
        )}
      </div>
    );
  };

  // --- Main Return ---
  if (loading) return <div className="text-center p-20 text-white">Loading Delivery Page...</div>;
  if (error) return <div className="text-center p-20 text-red-400 font-bold">{error}</div>;
  if (!project) return <div className="text-center p-20 text-zinc-400">Project data not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to={isAdmin ? "/admin/users" : "/dashboard"} className="text-cyan-400 hover:text-cyan-300 transition">
          &larr; Back to Dashboard
        </Link>
        
        <h1 className="text-4xl font-bold text-white">
          Project Delivery: <span className="text-cyan-400">{project.projectName}</span>
        </h1>
        <p className="text-lg text-zinc-300">
          Status: <span className="font-semibold">{project.status}</span>
        </p>

        {/* Show Admin or User view */}
        {isAdmin ? renderAdminView() : renderUserView()}
      </div>
    </div>
  );
}

export default ProjectDeliveryPage;