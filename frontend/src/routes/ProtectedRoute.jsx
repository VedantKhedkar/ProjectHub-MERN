import { useAuth } from '../context/AuthContext.jsx';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function ProtectedRoute() {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // 1. Check if user is logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2. If it's an Admin route, check for admin status
  // We'll hardcode the admin email for now. In a real app, this would be a user.role check.
  if (isAdminRoute && user.email !== 'admin@projecthub.com') {
    // Redirect non-admin users to their regular dashboard
    return <Navigate to="/dashboard" replace state={{ message: 'Access Denied: Admin required.' }} />;
  }
  
  // If logged in and either not an admin route OR is the admin, allow access
  return <Outlet />;
}

export default ProtectedRoute;