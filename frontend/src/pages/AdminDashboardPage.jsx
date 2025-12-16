import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserManagement from '../components/UserManagement.jsx'; 
import ProjectTracking from '../components/ProjectTracking.jsx'; 
import PortfolioManagement from '../components/PortfolioManagement.jsx';
import BuyRequestTracking from '../components/BuyRequestTracking.jsx';

const TABS = [
    { id: 'users', name: 'User Approval', component: <UserManagement /> },
    { id: 'projects', name: 'Custom Project Tracking', component: <ProjectTracking /> },
    { id: 'buy', name: 'Buy Inquiries', component: <BuyRequestTracking /> },
    { id: 'portfolio', name: 'Portfolio Content', component: <PortfolioManagement /> },
];

function AdminDashboardPage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('users'); // Default to User Approval

    const renderActiveComponent = () => {
        const tab = TABS.find(t => t.id === activeTab);
        return tab ? tab.component : null;
    };

    return (
        <div className="min-h-screen bg-[#0a0a16] text-white p-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#2d2d3d] pb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent mb-2">
                            Admin Dashboard ⚙️
                        </h1>
                        <p className="text-[#a0a0b0]">
                            Logged in as: <span className="font-semibold text-white">{user?.email}</span>
                        </p>
                    </div>
                    
                    <button
                        onClick={logout}
                        className="mt-4 md:mt-0 px-6 py-2 bg-[#1c1c2e] hover:bg-[#2d2d3d] text-white rounded-full font-medium text-sm border border-[#2d2d3d] transition-all"
                    >
                        Logout Admin
                    </button>
                </div>

                {/* --- Tab Navigation --- */}
                <div className="flex flex-wrap gap-2 border-b border-[#2d2d3d] mb-8 pb-1">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-3 px-6 text-[0.95rem] font-medium rounded-t-lg transition-all duration-200 ease-in-out
                                    ${isActive 
                                        ? 'bg-[#131324] text-white border-b-2 border-[#8b5cf6]' // Active State
                                        : 'text-[#a0a0b0] hover:bg-[#ffffff0d] hover:text-white' // Inactive State
                                    }`}
                            >
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* --- Tab Content: Renders ONLY the active management component --- */}
                <section className="p-8 bg-[#131324] rounded-xl border border-[#2d2d3d] shadow-2xl min-h-[500px]">
                    {renderActiveComponent()}
                </section>
                
            </div>
        </div>
    );
}

export default AdminDashboardPage;