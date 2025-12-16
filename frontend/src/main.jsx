import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// --- Imports ---
import { AuthProvider } from './context/AuthContext.jsx'; 
import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx'; 
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx'; 
import ProjectDeliveryPage from './pages/ProjectDeliveryPage.jsx';
import MyPrebuiltProjectsPage from './pages/MyPrebuiltProjectsPage.jsx';
import PortfolioDeliveryPage from './pages/PortfolioDeliveryPage.jsx'; 
import CustomProject from './pages/CustomProject.jsx'

import './index.css';

// --- Router Configuration ---
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // --- Public Routes ---
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignUpPage /> },
      // The '/project/:id' route is REMOVED from here
      
      // --- Protected Routes (Accessed only if logged in) ---
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <UserDashboardPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
          { path: '/about', element: <AboutUsPage /> },
          { path: '/project/:id', element: <ProjectDetailPage /> }, // <-- MOVED '/project/:id' here
          { path: '/project/delivery/:projectId', element: <ProjectDeliveryPage /> },
          { path: '/my-prebuilt-projects', element: <MyPrebuiltProjectsPage /> },
          { path: '/admin/portfolio-files/:projectId', element: <PortfolioDeliveryPage /> },
          { path: "custom-project", element: <CustomProject />, },
        ],
      },
    ],
  },
]);

// --- Render the Application ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);