import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Admin-only routes
  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // User-only routes (prevent admin access)
  if (userOnly && userRole === 'admin') {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default PrivateRoute;


