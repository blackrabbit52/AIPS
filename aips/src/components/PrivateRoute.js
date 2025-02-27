import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = true; // À remplacer par la logique d'authentification réelle
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute; 