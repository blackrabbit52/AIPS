import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  useTheme,
  Switch,
  Container,
  Grid,
  Link as MuiLink
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  ExitToApp as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isAuthenticated = false;

  // Check if current route is login or register
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    navigate('/login');
    handleCloseMenu();
  };

  const handleRegister = () => {
    navigate('/register');
    handleCloseMenu();
  };

  const handleLogout = () => {
    handleCloseMenu();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Analysis', icon: <AnalyticsIcon />, path: '/analysis' },
    { text: 'Search', icon: <SearchIcon />, path: '/search' },
  ];

  const footerLinks = [
    { text: 'About', path: '/about' },
    { text: 'Privacy Policy', path: '/privacy' },
    { text: 'Terms of Service', path: '/terms' },
    { text: 'Contact', path: '/contact' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default
      }}
    >
      {!isAuthPage && <Navbar />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: isAuthPage ? 0 : 8,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>
      {!isAuthPage && <Footer />}
    </Box>
  );
}; 