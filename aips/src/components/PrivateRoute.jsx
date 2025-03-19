import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/auth.service';

const PrivateRoute = ({ children, requiredRoles = [], requiredPermissions = [] }) => {
    const location = useLocation();
    const isAuthenticated = authService.isAuthenticated();

    // Check authentication
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check roles if specified
    if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));
        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // Check permissions if specified
    if (requiredPermissions.length > 0) {
        const hasRequiredPermission = requiredPermissions.some(
            permission => authService.hasPermission(permission)
        );
        if (!hasRequiredPermission) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default PrivateRoute; 