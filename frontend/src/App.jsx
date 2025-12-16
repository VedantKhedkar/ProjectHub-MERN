// src/App.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import { useAuth } from './context/AuthContext.jsx'; 
import LoginModal from './components/LoginModal.jsx';
import { Toaster } from 'react-hot-toast';

// REMOVE THIS LINE:
// import CustomProject from './pages/CustomProject'; 

function App() {
  const { isLoginModalOpen } = useAuth(); 

  return (
    <div className="min-h-screen">
        <Toaster 
          position="top-right"
          toastOptions={{
            className: '',
            style: { background: '#363636', color: '#fff' },
            success: { style: { background: '#10B981', color: 'white' } },
            error: { style: { background: '#EF4444', color: 'white' } },
          }}
        />

        <Sidebar />

        <main className="w-full pt-16 md:pt-0 md:pl-64"> 
            {/* The CustomProject page will render HERE automatically via Outlet */}
            <Outlet />
        </main>

        {isLoginModalOpen && <LoginModal />}
    </div>
  );
}

export default App;