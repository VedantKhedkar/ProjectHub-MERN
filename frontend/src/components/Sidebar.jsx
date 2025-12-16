import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';

function Sidebar() {
    const { isLoggedIn, logout, user } = useAuth();
    const isAdmin = user && user.email === 'admin@projecthub.com';
    const [isOpen, setIsOpen] = useState(false);
    
    // key to highlight active link
    const location = useLocation(); 

    // Helper component for Links
    const NavLink = ({ to, label, isActionBtn = false }) => {
        const isActive = location.pathname === to;
        let classes = "block px-4 py-3 rounded-xl text-[0.95rem] font-medium transition-all duration-200 ease-in-out mb-1 ";
        
        if (isActionBtn) {
            classes += "bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700 hover:shadow-blue-500/20 hover:scale-[1.02]";
        } else if (isActive) {
            classes += "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500";
        } else {
            classes += "text-slate-400 hover:bg-slate-800 hover:text-slate-200";
        }

        return (
            <Link to={to} className={classes} onClick={() => setIsOpen(false)}>
                {label}
            </Link>
        );
    };

    return (
        <>
            {/* MOBILE TOGGLE BUTTON */}
            <button 
                className="fixed top-4 left-4 z-[60] md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
            </button>

            {/* LEFT SIDEBAR */}
            <aside className={`fixed top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-700 z-50 shadow-2xl transition-transform duration-300 flex flex-col
                            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                            md:translate-x-0`}
            >
                {/* 1. Header / Logo Area */}
                <div className="p-6 pb-2">
                    <Link to="/" className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        <span>Project<span className="text-blue-600">Hub</span></span>
                    </Link>
                </div>

                {/* 2. Navigation Links (Scrollable area) */}
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <NavLink to="/" label="Home" />
                    
                    {isLoggedIn ? (
                        <>
                            <NavLink to="/about" label="About Us" />
                            {isAdmin && (
                                <>
                                    <div className="my-4 border-t border-slate-700/50"></div>
                                    <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin</p>
                                    <NavLink to="/admin/users" label="Admin Tools" />
                                </>
                            )}
                            {!isAdmin && (
                                <>
                                    <div className="my-4 border-t border-slate-700/50"></div>
                                    <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Workspace</p>
                                    <NavLink to="/custom-project" label="+ New Custom Project" isActionBtn={true} />
                                    <NavLink to="/dashboard" label="My Custom Projects" />
                                    <NavLink to="/my-prebuilt-projects" label="My Prebuilt Projects" />
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="my-4 border-t border-slate-700/50"></div>
                            <NavLink to="/login" label="Login" />
                            <NavLink to="/signup" label="Sign Up" />
                        </>
                    )}
                </nav>

                {/* 3. User Profile & Logout (Pinned to Bottom) */}
                {isLoggedIn && user && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50 mt-auto">
                        <div className="flex items-center gap-3 mb-4">
                            {/* Avatar Circle */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold shadow-lg">
                                {user.email.charAt(0).toUpperCase()}
                            </div>
                            
                            {/* User Info */}
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">
                                    {user.email.split('@')[0]}
                                </p>
                                <p className="text-xs text-slate-500 truncate" title={user.email}>
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-all duration-200 group"
                        >
                            <svg className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                )}
            </aside>

            {/* MOBILE OVERLAY */}
            {isOpen && <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />}
        </>
    );
}

export default Sidebar;