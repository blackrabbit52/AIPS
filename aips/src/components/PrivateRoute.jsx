import { Navigate, useLocation, Outlet } from 'react-router-dom';
import authService from '../services/auth.service';
import { useEffect, useState } from 'react';

const PrivateRoute = ({ requiredRole }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = authService.getCurrentUser();
        
        if (token && user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    localStorage.setItem('intendedUrl', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute; 