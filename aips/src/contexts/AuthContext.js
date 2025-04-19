import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  const fetchUserRoles = async (username) => {
    try {
      const response = await axios.get(`${API_URL}/users/username/${username}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  };

  useEffect(() => {
    // Vérifier le token au chargement
    const token = localStorage.getItem('token');
    if (token) {
      // Décoder le token JWT et vérifier sa validité
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUser(decoded);
          // Récupérer les rôles de l'utilisateur
          fetchUserRoles(decoded.sub).then(userRoles => {
            setRoles(userRoles);
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (token) => {
    localStorage.setItem('token', token);
    const decoded = JSON.parse(atob(token.split('.')[1]));
    setIsAuthenticated(true);
    setUser(decoded);
    // Récupérer les rôles de l'utilisateur
    const userRoles = await fetchUserRoles(decoded.sub);
    setRoles(userRoles);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setRoles([]);
    navigate('/login');
  };

  const hasRole = (role) => {
    return roles.includes(role);
  };

  const hasPermission = (permission) => {
    return user?.authorities?.some((auth) => auth.authority === permission) || false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, roles, login, logout, hasRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 