import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { text: 'Home', path: '/', icon: <HomeIcon /> },
  { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { text: 'Analysis', path: '/analysis', icon: <AnalyticsIcon /> },
  { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

export const Navbar = ({ toggleTheme, isDarkMode }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isAuthenticated = false; // TODO: Replace with actual auth state

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    handleCloseMenu();
    navigate('/login');
  };

  const handleRegister = () => {
    handleCloseMenu();
    navigate('/register');
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    handleCloseMenu();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AIPS Platform
          </Typography>

          <IconButton color="inherit" onClick={toggleTheme}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <IconButton
            color="inherit"
            onClick={handleProfileMenu}
          >
            {isAuthenticated ? (
              <Avatar sx={{ width: 32, height: 32 }} />
            ) : (
              <PersonIcon />
            )}
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            {isAuthenticated ? (
              [
                <MenuItem key="profile" onClick={() => navigate('/profile')}>
                  Profile
                </MenuItem>,
                <MenuItem key="logout" onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              ]
            ) : (
              [
                <MenuItem key="login" onClick={handleLogin}>
                  Login
                </MenuItem>,
                <MenuItem key="register" onClick={handleRegister}>
                  Register
                </MenuItem>
              ]
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              Theme
            </Typography>
            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
              color="primary"
            />
          </Box>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}; 