import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = 'http://localhost:5000/api/projects'; 

const CATEGORIES = [
  'E-commerce', 'Social Media', 'Machine Learning', 'Custom Utility', 'Hardware', 'Other'
];

function ProjectSubmissionForm({ onProjectSubmitted }) {
  const { token, user } = useAuth();
  
  const [formData, setFormData] = useState({
    projectName: '',
    projectSummary: '',
    projectDetails: '',
    budgetEstimate: '',
    completionDate: '',
    contactName: user.email, 
    contactDetails: user.contact || user.email,
    category: CATEGORIES[0], 
    specificInputs: {}, 
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };
  
  const handleSpecificChange = (e) => {
    setFormData(prev => ({
      ...prev,
      specificInputs: {
        ...prev.specificInputs,
        [e.target.name]: e.target.value,
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('Submitting Project...');
    setError('');

    const data = new FormData();

    data.append('projectName', formData.projectName);
    data.append('projectSummary', formData.projectSummary);
    data.append('projectDetails', formData.projectDetails);
    data.append('budgetEstimate', formData.budgetEstimate);
    data.append('completionDate', new Date(formData.completionDate).toISOString());
    data.append('contactName', formData.contactName);
    data.append('contactDetails', formData.contactDetails);
    
    Object.keys(formData.specificInputs).forEach(key => {
      data.append(key, formData.specificInputs[key]);
    });
    
    const files = e.target.attachments.files;
    for (let i = 0; i < files.length; i++) {
      data.append('attachments', files[i]);
    }
    
    try {
      const response = await axios.post(API_URL, data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
        }
      });
      
      setMessage(response.data.message); 
      setIsSubmitting(false);
      
      setFormData(prev => ({ 
        ...prev, 
        projectName: '', 
        projectSummary: '',
        projectDetails: '',
        budgetEstimate: '',
        completionDate: '',
      }));
      e.target.reset(); 

      if (onProjectSubmitted) {
        onProjectSubmitted();
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
      setMessage('');
      setIsSubmitting(false);
    }
  };

  const isHardware = formData.category === 'Hardware';

  // --- THEME STYLES ---
  const inputClass = "mt-1 block w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300";

  // RENDER UTILITY
  const renderInputField = (name, label, type = 'text', required = false) => (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label} {required && <span className="text-blue-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        className={inputClass}
      />
    </div>
  );

  return (
    <div className="p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4 flex items-center gap-2">
        <span className="text-blue-500">+</span> Submit Custom Project
      </h2>
      
      {message && <p className="text-green-400 bg-green-900/20 px-4 py-2 rounded mb-6 border border-green-900/50">{message}</p>}
      {error && <p className="text-red-400 bg-red-900/20 px-4 py-2 rounded mb-6 border border-red-900/50">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* --- SECTION 1: CORE DETAILS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderInputField('projectName', 'Project Name', 'text', true)}
          
          <div>
            <label htmlFor="category" className={labelClass}>
              Project Category <span className="text-blue-500">*</span>
            </label>
            <select
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              required
              className={inputClass}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {renderInputField('budgetEstimate', 'Estimated Budget (INR)', 'text', true)}
          {renderInputField('completionDate', 'Required Completion Date', 'date', true)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {renderInputField('contactName', 'Contact Name', 'text', true)}
             {renderInputField('contactDetails', 'Contact Email/Phone', 'text', true)}
        </div>
        
        {/* Project Summary */}
        <div>
          <label htmlFor="projectSummary" className={labelClass}>
            Project Summary (Max 100 words) <span className="text-blue-500">*</span>
          </label>
          <textarea
            name="projectSummary"
            id="projectSummary"
            value={formData.projectSummary}
            onChange={handleChange}
            required
            rows="2"
            className={inputClass}
          ></textarea>
        </div>

        {/* Project Details */}
        <div>
          <label htmlFor="projectDetails" className={labelClass}>
            Full Project Details/Requirements <span className="text-blue-500">*</span>
          </label>
          <textarea
            name="projectDetails"
            id="projectDetails"
            value={formData.projectDetails}
            onChange={handleChange}
            required
            rows="4"
            className={inputClass}
          ></textarea>
        </div>

        {/* --- Attachment Input --- */}
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 border-dashed">
          <label htmlFor="attachments" className="block text-sm font-medium text-slate-300 mb-2">
            Attachments (PDF, ZIP, Images, Videos - Max 5 files)
          </label>
          <input
            type="file"
            name="attachments"
            id="attachments"
            multiple 
            accept=".pdf,.zip,image/*,video/mp4" 
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
        </div>

        {/* --- SECTION 2: CATEGORY-SPECIFIC FIELDS --- */}
        <div className="pt-4 border-t border-slate-700">
             <h3 className="text-lg font-semibold text-blue-400 mb-4">Specific Requirements ({formData.category})</h3>
             
             {isHardware && (
               <div className="space-y-4 bg-slate-900 p-4 rounded-lg border border-slate-700">
                 {/* ... (Hardware specific fields placeholders) ... */}
                 <p className="text-slate-500 text-sm italic">Hardware specific inputs will appear here...</p>
               </div>
             )}
             {!isHardware && (
               <div className="space-y-4 bg-slate-900 p-4 rounded-lg border border-slate-700">
                 {/* ... (Software specific fields placeholders) ... */}
                 <p className="text-slate-500 text-sm italic">Software specific inputs will appear here...</p>
               </div>
             )}
        </div>

        {/* --- SECTION 3: SUBMIT --- */}
        <button
          type="submit"
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg shadow-blue-900/20 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.01]"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Project Request'}
        </button>
      </form>
    </div>
  );
}

export default ProjectSubmissionForm;