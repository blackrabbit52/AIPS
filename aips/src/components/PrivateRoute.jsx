import { Navigate, useLocation, Outlet } from 'react-router-dom';
import authService from '../services/auth.service';

const PrivateRoute = ({ requiredRole }) => {
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  // Debug authentication state
  console.log('Route protection check:', {
    currentUser,
    token: localStorage.getItem('token'),
    currentPath: location.pathname
  });

  // Vérification plus stricte de l'authentification
  if (!currentUser || !localStorage.getItem('token')) {
    localStorage.setItem('intendedUrl', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification du rôle si nécessaire
  if (requiredRole && !authService.hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute; 