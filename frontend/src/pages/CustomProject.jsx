import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProjectSubmissionForm from '../components/ProjectSubmissionForm.jsx';

function CustomProjectPage() {
  const navigate = useNavigate();

  // Callback to run when form submits successfully
  const handleSubmissionSuccess = () => {
    // Navigate back to the dashboard to see the new project in the tracker
    navigate('/dashboard');
  };

  return (
    // Global Deep Background
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
            <Link to="/dashboard" className="text-sm font-medium text-slate-500 hover:text-blue-400 mb-3 inline-block transition-colors">
                &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Start a New Project
            </h1>
            <p className="text-lg text-slate-400 mt-2 max-w-2xl">
                Tell us what you want to build. We will review your requirements and provide a quote within 24 hours.
            </p>
        </div>

        {/* The Form Component */}
        <section>
            <ProjectSubmissionForm onProjectSubmitted={handleSubmissionSuccess} />
        </section>

      </div>
    </div>
  );
}

export default CustomProjectPage;