import React from 'react';
import { Link } from 'react-router-dom';
import PortfolioDisplay from '../components/PortfolioDisplay.jsx';
import { useAuth } from '../context/AuthContext.jsx'; 

function HomePage() {
  const { user, isLoggedIn } = useAuth();
  
  const isAdmin = isLoggedIn && user.email === 'admin@projecthub.com';

  const getGreeting = () => {
      if (isAdmin) {
          return <span className="font-extrabold text-amber-500">Welcome, Admin!</span>;
      }
      if (isLoggedIn && user?.email) {
          const userName = user.email.split('@')[0];
          return <span className="font-extrabold text-blue-500">Welcome, {userName}!</span>;
      }
      return null; 
  };

  return (
    // Global Background: Deep Midnight
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-blue-500 selection:text-white relative">
      
      {/* --- Section 1: Hero --- */}
      <header className="py-24 text-center border-b border-slate-800 bg-[#0f172a] relative overflow-hidden">
        
        {/* Background Glow Effect (Optional Decorative) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 px-4">
            {/* Greeting */}
            <div className="h-8 mb-4 text-lg font-medium">{getGreeting()}</div>

            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
              Project<span className="text-blue-600">Hub</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Turning ideas into reality with <span className="text-blue-400">Custom Development</span> & <span className="text-blue-400">Prebuilt Solutions</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isAdmin ? (
                <Link to="/admin/users" className="px-8 py-3.5 bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-all transform hover:scale-105">
                  Admin Tools 🛠️
                </Link>
              ) : (
                <>
                  <Link 
                    to="/custom-project" 
                    className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all duration-200 transform hover:-translate-y-1"
                  >
                    + Start Custom Project
                  </Link>
                  <a 
                    href="#portfolio" 
                    className="px-8 py-3.5 bg-slate-800 text-white font-semibold rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all duration-200"
                  >
                    Browse Prebuilt
                  </a>
                </>
              )}
            </div>
        </div>
      </header>

      {/* --- Section 2: Portfolio Display --- */}
      <section id="portfolio">
        <PortfolioDisplay />
      </section>

      {/* --- Section 3: Footer --- */}
      <footer className="py-8 bg-slate-900 border-t border-slate-800 text-center text-slate-500 text-sm">
        <div className="max-w-6xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} ProjectHub. All rights reserved.</p>
        </div>
      </footer>

     {/* --- FLOATING WHATSAPP BUTTON (Bottom Right) --- */}
      <a 
        href="https://wa.me/918275794770" // <-- REPLACE WITH YOUR NUMBER
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 group flex items-center gap-3 px-5 py-3.5 bg-[#25D366] text-white rounded-full shadow-2xl shadow-green-600/30 hover:bg-[#20bd5a] hover:scale-105 transition-all duration-300"
      >
        <span className="font-bold text-sm hidden md:block">Chat on WhatsApp</span>
        {/* WhatsApp Icon SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>

    </div>
  );
}

export default HomePage;