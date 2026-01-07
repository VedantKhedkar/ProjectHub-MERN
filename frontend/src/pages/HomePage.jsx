import React from 'react';
import { Link } from 'react-router-dom';
import PortfolioDisplay from '../components/PortfolioDisplay.jsx';
import { useAuth } from '../context/AuthContext.jsx'; 
import { motion } from 'framer-motion'; 

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100 } 
  }
};

function HomePage() {
  const { user, isLoggedIn } = useAuth();
  
  const isAdmin = isLoggedIn && user.email === 'admin@projecthub.com';

  const getGreeting = () => {
      if (isAdmin) {
          return <span className="font-extrabold text-amber-500 drop-shadow-md">Welcome, Admin!</span>;
      }
      if (isLoggedIn && user?.email) {
          const userName = user.email.split('@')[0];
          return <span className="font-extrabold text-blue-400 drop-shadow-md">Welcome, {userName}!</span>;
      }
      return null; 
  };

  return (
    // Global Background: Deep Midnight with overflow hidden
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      
      {/* --- Section 1: Hero --- */}
      <header className="relative pt-32 pb-24 text-center border-b border-slate-800/50 bg-[#0f172a] overflow-hidden">
        
        {/* Animated Background Glows */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"
        />
        <motion.div 
          animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none"
        />

        <div className="relative z-10 px-4 max-w-7xl mx-auto">
            {/* Greeting */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="h-8 mb-6 text-lg font-medium tracking-wide"
            >
              {getGreeting()}
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                Project<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Hub</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Turning ideas into reality with <span className="text-blue-400 font-semibold">Custom Development</span> & <span className="text-purple-400 font-semibold">Prebuilt Solutions</span>.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-5 items-center">
                
                {isAdmin ? (
                  /* --- Modern Admin Button --- */
                  <Link to="/admin/users">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative px-8 py-4 bg-[#0f172a] text-amber-500 font-bold rounded-2xl border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all duration-300 overflow-hidden"
                    >
                      {/* Gradient Fill on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
                      
                      {/* Shine Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:animate-shine" />

                      {/* Content */}
                      <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors duration-300 tracking-wide text-sm md:text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        ADMIN CONSOLE
                      </span>
                    </motion.button>
                  </Link>
                ) : (
                  /* --- User Buttons --- */
                  <>
                    <Link to="/custom-project">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/30 hover:bg-blue-500 hover:shadow-blue-600/50 transition-all duration-200"
                      >
                        + Start Custom Project
                      </motion.button>
                    </Link>
                    <motion.a 
                      href="#portfolio" 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm text-white font-semibold rounded-2xl border border-slate-700 hover:bg-slate-700 hover:border-slate-500 transition-all duration-200"
                    >
                      Browse Prebuilt
                    </motion.a>
                  </>
                )}
              </motion.div>
            </motion.div>
        </div>
      </header>

      {/* --- Section 2: Portfolio Display --- */}
      <motion.section 
        id="portfolio"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <PortfolioDisplay />
      </motion.section>

      {/* --- Section 3: Footer --- */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800 text-center text-slate-500 text-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} ProjectHub. All rights reserved.</p>
        </div>
      </footer>

     {/* --- FLOATING WHATSAPP BUTTON --- */}
      <motion.a 
        href="https://wa.me/918275794770" 
        target="_blank" 
        rel="noopener noreferrer"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1, rotate: 10 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-8 right-8 z-50 group flex items-center gap-3 px-5 py-3.5 bg-[#25D366] text-white rounded-full shadow-2xl shadow-green-600/30 hover:bg-[#20bd5a] transition-all duration-300"
      >
        <span className="font-bold text-sm hidden md:block">Chat on WhatsApp</span>
        {/* WhatsApp Icon SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </motion.a>

    </div>
  );
}

export default HomePage;