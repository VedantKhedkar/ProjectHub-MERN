import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const isAdmin = user && user.email === 'admin@projecthub.com';

  return (
    // Theme: Slate-900 Background with a subtle border
    <nav className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-white tracking-tight flex items-center gap-1">
              Project<span className="text-blue-500">Hub</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-2 items-center">
            <Link 
                to="/" 
                className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Home
            </Link>
            
            {/* --- CONDITIONALLY RENDERED LINKS --- */}
            {isLoggedIn ? (
              <>
                {/* Admin Link */}
                {isAdmin ? (
                  <Link 
                    to="/admin/users" 
                    className="text-amber-400 hover:text-amber-300 hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <span>🛡️</span> Admin Panel
                  </Link>
                ) : (
                  /* User Dashboard Link */
                  <Link 
                    to="/dashboard" 
                    className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                
                {/* Logout Button (Primary Action Style) */}
                <button 
                    onClick={logout} 
                    className="ml-2 px-4 py-2 bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm border border-slate-600 hover:border-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              /* Guest Links */
              <>
                <Link 
                    to="/login" 
                    className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                    to="/signup" 
                    className="ml-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;