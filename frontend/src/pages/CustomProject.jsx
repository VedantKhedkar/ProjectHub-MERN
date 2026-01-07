import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProjectSubmissionForm from '../components/ProjectSubmissionForm.jsx';
import { motion } from 'framer-motion'; // Animation library
import { ArrowLeft, Sparkles } from 'lucide-react'; // Icons

function CustomProjectPage() {
  const navigate = useNavigate();

  // Callback to run when form submits successfully
  const handleSubmissionSuccess = () => {
    navigate('/dashboard');
  };

  return (
    // Global Deep Background with overflow hidden
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-6 md:p-12 relative overflow-x-hidden font-sans">
      
      {/* --- Animated Background Glows --- */}
      <motion.div 
         animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
         transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
         className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div 
         animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
         transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
         className="fixed bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"
      />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        
        {/* --- Header Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 border-b border-slate-700/50 pb-8"
        >
            {/* Back Button */}
            <Link to="/dashboard" className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-400 transition-colors w-fit">
                <div className="p-2 bg-slate-800 rounded-full group-hover:bg-blue-500/10 transition-colors">
                   <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                </div>
                Back to Dashboard
            </Link>

            <div>
               <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                   Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">New Project</span>
               </h1>
               <p className="text-lg text-slate-400 max-w-2xl flex items-center gap-2">
                   <Sparkles size={18} className="text-amber-400" />
                   Tell us what you want to build. We'll review your vision and provide a detailed quote within 24 hours.
               </p>
            </div>
        </motion.div>

        {/* --- The Form Component Container --- */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden p-1 md:p-2"
        >
            {/* Inner glow border effect */}
            <div className="bg-[#0f172a]/50 rounded-xl p-6 md:p-10 border border-slate-700/30">
               <ProjectSubmissionForm onProjectSubmitted={handleSubmissionSuccess} />
            </div>
        </motion.section>

      </div>
    </div>
  );
}

export default CustomProjectPage;