import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserManagement from '../components/UserManagement.jsx'; 
import ProjectTracking from '../components/ProjectTracking.jsx'; 
import PortfolioManagement from '../components/PortfolioManagement.jsx';
import BuyRequestTracking from '../components/BuyRequestTracking.jsx';
import { motion, AnimatePresence } from 'framer-motion'; // Import for animations
import { LogOut, Users, FileText, ShoppingCart, Briefcase } from 'lucide-react'; // Optional icons for better UI

const TABS = [
    { id: 'users', name: 'User Approval', icon: <Users size={18} />, component: <UserManagement /> },
    { id: 'projects', name: 'Custom Projects', icon: <FileText size={18} />, component: <ProjectTracking /> },
    { id: 'buy', name: 'Buy Inquiries', icon: <ShoppingCart size={18} />, component: <BuyRequestTracking /> },
    { id: 'portfolio', name: 'Portfolio Content', icon: <Briefcase size={18} />, component: <PortfolioManagement /> },
];

function AdminDashboardPage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('users');

    const renderActiveComponent = () => {
        const tab = TABS.find(t => t.id === activeTab);
        return tab ? tab.component : null;
    };

    return (
        <div className="min-h-screen bg-[#0a0a16] text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Decor (Subtle Glows) */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#8b5cf6]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* --- HEADER --- */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-[#2d2d3d]/50 pb-8"
                >
                    <div>
                        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#8b5cf6] bg-clip-text text-transparent mb-3 bg-[length:200%_auto] animate-gradient">
                            Admin Dashboard
                        </h1>
                        <p className="text-[#a0a0b0] flex items-center gap-2 text-lg">
                            Welcome back, <span className="font-semibold text-white tracking-wide">{user?.email}</span>
                        </p>
                    </div>
                    
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "#2d2d3d" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={logout}
                        className="mt-6 md:mt-0 px-6 py-3 bg-[#1c1c2e] text-white rounded-xl font-medium text-sm border border-[#2d2d3d] shadow-lg shadow-purple-900/10 flex items-center gap-2 transition-all group"
                    >
                        <LogOut size={18} className="text-[#a0a0b0] group-hover:text-red-400 transition-colors" />
                        <span>Logout System</span>
                    </motion.button>
                </motion.div>

                {/* --- MODERN TAB NAVIGATION --- */}
                <div className="flex flex-wrap gap-4 mb-8">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 outline-none focus:outline-none"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabBackground"
                                        className="absolute inset-0 bg-[#8b5cf6] rounded-xl shadow-lg shadow-purple-500/30"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-white' : 'text-[#a0a0b0] hover:text-white'}`}>
                                    {tab.icon}
                                    {tab.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* --- CONTENT AREA (Animated Switch) --- */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.section
                            key={activeTab}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="p-8 bg-[#131324]/80 backdrop-blur-xl rounded-2xl border border-[#2d2d3d] shadow-2xl min-h-[600px] relative overflow-hidden"
                        >
                            {/* Inner Glow Effect */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b5cf6]/50 to-transparent opacity-50" />
                            
                            {renderActiveComponent()}
                        </motion.section>
                    </AnimatePresence>
                </div>
                
            </div>
        </div>
    );
}

export default AdminDashboardPage;