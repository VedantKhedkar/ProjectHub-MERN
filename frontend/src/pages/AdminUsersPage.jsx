import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserManagement from '../components/UserManagement.jsx'; 
import ProjectTracking from '../components/ProjectTracking.jsx'; 
import PortfolioManagement from '../components/PortfolioManagement.jsx';
import BuyRequestTracking from '../components/BuyRequestTracking.jsx';
import PaymentTracking from '../components/PaymentTracking.jsx'; 

const TABS = [
    { id: 'portfolio', name: 'Portfolio Content', component: <PortfolioManagement /> },
    { id: 'users', name: 'User Approval', component: <UserManagement /> },
    { id: 'projects', name: 'Custom Projects', component: <ProjectTracking /> },
    { id: 'buy', name: 'Buy Inquiries', component: <BuyRequestTracking /> },
    { id: 'payments', name: 'Payment Log', component: <PaymentTracking /> }, 
];

function AdminUsersPage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('portfolio'); 

    const renderActiveComponent = () => {
        const tab = TABS.find(t => t.id === activeTab);
        return tab ? tab.component : null;
    };

    return (
        // Global Deep Background
        <div className="min-h-screen bg-[#0f172a] text-slate-300 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-2">
                            <span>⚙️</span> Admin Console
                        </h1>
                        <p className="text-sm text-slate-400 mt-2">
                            Logged in as: <span className="font-semibold text-blue-400">{user?.email}</span>
                        </p>
                    </div>
                    {/* Logout Button (Optional here if not in Sidebar) */}
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-sm font-medium hover:bg-red-900/20 hover:text-red-400 hover:border-red-800 transition-all shadow-sm"
                    >
                        Sign Out
                    </button>
                </div>

                {/* --- Tab Navigation --- */}
                <div className="border-b border-slate-700/50 overflow-x-auto scrollbar-hide">
                    <nav className="flex space-x-2 pb-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    px-5 py-3 text-sm font-semibold rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2
                                    ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-400 bg-slate-800/50'
                                        : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                                    }
                                `}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* --- Tab Content --- */}
                <section className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 md:p-8 min-h-[500px]">
                    {renderActiveComponent()}
                </section>
                
            </div>
        </div>
    );
}

export default AdminUsersPage;