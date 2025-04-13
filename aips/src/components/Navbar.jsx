import React, { useState, useEffect } from 'react';
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
  Badge,
  Tooltip,
  Divider,
  useTheme,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Info as InfoIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

export const Navbar = ({ toggleTheme, isDarkMode }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState(authService.getCurrentUser());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleAuth = () => {
      setUser(authService.getCurrentUser());
    };

    handleAuth();
    window.addEventListener('auth-change', handleAuth);
    return () => window.removeEventListener('auth-change', handleAuth);
  }, []);

  useEffect(() => {
    if (user) {
      // Simulé pour l'instant - à remplacer par votre API
      const fetchNotifications = async () => {
        try {
          // const response = await notificationService.getNotifications();
          // setNotifications(response.data);
          setNotifications([
            { id: 1, text: 'New analysis result available', unread: true },
            { id: 2, text: 'Profile update successful', unread: false },
            { id: 3, text: 'Welcome to AIPS Platform!', unread: false },
          ]);
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      };

      fetchNotifications();
    }
  }, [user]);

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleSettingsMenu = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
    setSettingsAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    handleCloseMenu();
    navigate('/');
    setUser(null);
  };

  const handleLogin = () => {
    handleCloseMenu();
    navigate('/login');
  };

  const handleRegister = () => {
    handleCloseMenu();
    navigate('/register');
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const markAsRead = async (notificationId) => {
    try {
      // await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, unread: false }
            : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleCloseSettingsMenu = () => {
    setSettingsAnchorEl(null);
  };

  const handleThemeChange = () => {
    toggleTheme();
    handleCloseSettingsMenu();
  };

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon />, public: true },
    { text: 'About', path: '/about', icon: <InfoIcon />, public: true },
    { text: 'Analysis', path: '/analysis', icon: <AnalyticsIcon />, requireAuth: true },
    { 
      text: 'Backoffice', 
      path: '/backoffice', 
      icon: <AdminPanelSettingsIcon />, 
      requireAuth: true,
      requireRole: 'ROLE_ADMIN' 
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.public) return true;
    if (item.requireAuth && !user) return false;
    if (item.requireRole && !user?.roles?.includes(item.requireRole)) return false;
    return true;
  });

  // Menus publics toujours visibles
  const publicMenuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'About', path: '/about', icon: <InfoIcon /> }
  ];

  // Menus protégés (visibles uniquement si connecté)
  const protectedMenuItems = [
    { text: 'Analysis', path: '/analysis', icon: <AnalyticsIcon /> }
  ];

  // Menu réservé aux admins
  const adminMenuItems = user && (user.roles?.includes('ROLE_ADMIN') || user.roles?.includes('ROLE_SUPER_ADMIN')) ? [
    { text: 'Backoffice', path: '/backoffice', icon: <AdminPanelSettingsIcon /> }
  ] : [];

  // Modifier les styles des boutons du menu principal
  const buttonStyle = {
    color: theme.palette.mode === 'light' ? theme.palette.primary.main : 'white',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(25, 118, 210, 0.04)'
        : 'rgba(255, 255, 255, 0.08)',
    }
  };

  return (
    <>
      <AppBar 
        position="fixed"
        elevation={0}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'light' 
            ? theme.palette.background.paper 
            : theme.palette.primary.main
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ 
              mr: 2,
              color: theme.palette.text.icon
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #60a5fa, #a78bfa)'
                : 'linear-gradient(45deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AIPS Platform
          </Typography>

          {/* Notifications - uniquement visible si connecté */}
          {user && (
            <Tooltip title="Notifications">
              <IconButton
                onClick={handleNotificationMenu}
                sx={{ 
                  ml: 1,
                  color: theme.palette.text.icon
                }}
              >
                <Badge 
                  badgeContent={notifications.filter(n => n.unread).length} 
                  color="error"
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton
              onClick={handleSettingsMenu}
              sx={{ 
                ml: 1,
                color: theme.palette.text.icon
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {/* Menu items */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {publicMenuItems.map((item) => (
              <Button
                key={item.text}
                sx={buttonStyle}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
              >
                {item.text}
              </Button>
            ))}
            
            {user && protectedMenuItems.map((item) => (
              <Button
                key={item.text}
                sx={buttonStyle}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
              >
                {item.text}
              </Button>
            ))}

            {/* Ajout du menu admin */}
            {adminMenuItems.map((item) => (
              <Button
                key={item.text}
                sx={buttonStyle}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Profile */}
          <Tooltip title={user ? `${user.username}` : 'Login'}>
            <IconButton
              onClick={handleProfileMenu}
              sx={{ 
                ml: 1,
                color: theme.palette.mode === 'light' 
                  ? theme.palette.primary.main 
                  : 'white'
              }}
            >
              {user ? (
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    border: `2px solid ${theme.palette.background.paper}`
                  }}
                  src={user.profileImage} // Si vous avez une URL d'image
                >
                  {user.username?.[0]?.toUpperCase()}
                </Avatar>
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                mt: 1.5,
                minWidth: 200,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {user ? [
              <MenuItem key="profile" onClick={() => { handleCloseMenu(); navigate('/profile'); }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Profile"
                  secondary={user.username}
                />
              </MenuItem>,
              <MenuItem key="dashboard" onClick={() => { handleCloseMenu(); navigate('/dashboard'); }}>
                <ListItemIcon>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="My Analyses" />
              </MenuItem>,
              <Divider key="divider" />,
              <MenuItem key="logout" onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            ] : [
              <MenuItem key="login" onClick={handleLogin}>
                <ListItemIcon>
                  <LoginIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Sign In" />
              </MenuItem>,
              <MenuItem key="register" onClick={handleRegister}>
                <ListItemIcon>
                  <PersonAddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Sign Up" />
              </MenuItem>
            ]}
          </Menu>

          {/* Notifications Menu */}
          {user && (
            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleCloseMenu}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                  mt: 1.5,
                  minWidth: 300,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleNotificationToggle}>
                <ListItemIcon>
                  {notificationsEnabled ? (
                    <NotificationsActiveIcon fontSize="small" />
                  ) : (
                    <NotificationsOffIcon fontSize="small" />
                  )}
                </ListItemIcon>
                {notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
              </MenuItem>
              <Divider />
              {notifications.map((notification) => (
                <MenuItem 
                  key={notification.id}
                  onClick={() => {
                    markAsRead(notification.id);
                    handleCloseMenu();
                  }}
                  sx={{
                    backgroundColor: notification.unread 
                      ? theme.palette.mode === 'light' 
                        ? 'rgba(37, 99, 235, 0.08)'
                        : 'rgba(37, 99, 235, 0.15)'
                      : 'transparent',
                  }}
                >
                  <ListItemText 
                    primary={notification.text}
                    secondary={notification.unread ? 'New' : null}
                  />
                </MenuItem>
              ))}
            </Menu>
          )}

          {/* Settings Menu */}
          <Menu
            anchorEl={settingsAnchorEl}
            open={Boolean(settingsAnchorEl)}
            onClose={handleCloseSettingsMenu}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                mt: 1.5,
                minWidth: 200,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleThemeChange}>
              <ListItemIcon>
                {isDarkMode ? (
                  <LightModeIcon fontSize="small" />
                ) : (
                  <DarkModeIcon fontSize="small" />
                )}
              </ListItemIcon>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            border: 'none',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              fontWeight: 600,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #60a5fa, #a78bfa)'
                : 'linear-gradient(45deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AIPS Platform
          </Typography>
          <List>
            {filteredMenuItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light'
                      ? 'rgba(37, 99, 235, 0.08)'
                      : 'rgba(37, 99, 235, 0.15)',
                  },
                  // Ne pas afficher les éléments qui nécessitent des rôles si l'utilisateur ne les a pas
                  display: (item.requireRole && (!user || !user.roles?.includes(item.requireRole))) ? 'none' : 'flex'
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 500,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar; 