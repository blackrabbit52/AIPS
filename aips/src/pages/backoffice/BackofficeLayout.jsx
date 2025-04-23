import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  Drawer,
  Toolbar,
  AppBar,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  useTheme,
  Badge,
  Tooltip,
  Breadcrumbs,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  BarChart as BarChartIcon,
  Tune as TuneIcon,
  Pages as PagesIcon,
  Book as BookIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Navigation as NavigationIcon,
  FormatAlignJustify as FormatAlignJustifyIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const drawerWidth = 240;

export default function BackofficeLayout({ toggleTheme, isDarkMode }) {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications } = useNotification();
  
  const unreadNotifications = notifications ? notifications.filter(notif => !notif.read) : [];

  useEffect(() => {
    console.log("BackofficeLayout:", user);
    console.log("Roles :", user?.roles);
    
    if (!user) {
      console.log("Redirection:");
      navigate('/login');
      return;
    }
    

    console.log("Type of user.roles:", typeof user.roles);
    if (Array.isArray(user.roles)) {
      console.log("user.roles is an array of length:", user.roles.length);
    } else {
      console.log("user.roles is NOT an array");
    }
    
    if (user.roles) {
      console.log("Verification ROLE_ADMIN:", user.roles.includes('ROLE_ADMIN'));
      console.log("Verification ROLE_SUPER_ADMIN:", user.roles.includes('ROLE_SUPER_ADMIN'));
    }
    return; 

  }, [user, navigate]);


  const menuItems = [
    { text: 'Dashboard', path: '/backoffice', icon: <DashboardIcon /> },
    { text: 'Users', path: '/backoffice/users', icon: <PeopleIcon /> },
    { 
      text: 'Analysis', 
      path: '/backoffice/analysis', 
      icon: <AnalyticsIcon />,
      subItems: [
        { text: 'Templates', path: '/backoffice/analysis', icon: <AssignmentIcon /> },
        { text: 'History', path: '/backoffice/analysis/history', icon: <HistoryIcon /> },
        { text: 'Metrics', path: '/backoffice/analysis/metrics', icon: <BarChartIcon /> }
      ]
    },
    { text: 'Recommendations', path: '/backoffice/recommendations', icon: <TuneIcon /> },
    { 
      text: 'Content', 
      path: '/backoffice/content', 
      icon: <PagesIcon />,
      subItems: [
        { text: 'Pages', path: '/backoffice/content', icon: <PagesIcon /> },
        { text: 'Blog', path: '/backoffice/content/blog', icon: <BookIcon /> },
        { text: 'FAQs', path: '/backoffice/content/faqs', icon: <QuestionAnswerIcon /> }
      ]
    },
    { 
      text: 'Website', 
      path: '/backoffice/website', 
      icon: <NavigationIcon />,
      subItems: [
        { text: 'Navigation', path: '/backoffice/website', icon: <NavigationIcon /> },
        { text: 'Footer', path: '/backoffice/website/footer', icon: <FormatAlignJustifyIcon /> }
      ]
    },
    { text: 'Roles', path: '/backoffice/roles', icon: <AdminPanelSettingsIcon /> },
    { 
      text: 'Settings', 
      path: '/backoffice/settings', 
      icon: <SettingsIcon />,
      subItems: [
        { text: 'System', path: '/backoffice/settings/system', icon: <StorageIcon /> }
      ]
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };


  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    

    const breadcrumbs = [
      { text: 'Home', path: '/' }
    ];


    if (paths.includes('backoffice')) {
      breadcrumbs.push({ text: 'Backoffice', path: '/backoffice' });
      

      if (paths.length > 1 && paths[0] === 'backoffice') {
        const currentPath = paths[1];
        const menuItem = menuItems.find(item => item.path.includes(currentPath));
        if (menuItem && currentPath !== '') {
          breadcrumbs.push({ 
            text: menuItem.text || currentPath.charAt(0).toUpperCase() + currentPath.slice(1), 
            path: `/backoffice/${currentPath}` 
          });
        }
      }
    }
    
    return breadcrumbs;
  };

  const drawer = (
    <>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: [1],
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            fontWeight: 'bold',
            display: drawerOpen ? 'block' : 'none'
          }}
        >
          AIPS Admin
        </Typography>
        <IconButton 
          onClick={toggleDrawer}
          sx={{
            ...(drawerOpen ? {} : { ml: 0.5 }),
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.shortest,
            }),
          }}
        >
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List component="nav">
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem 
              disablePadding
              sx={{ 
                display: 'block',
                backgroundColor: location.pathname === item.path ? 
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)' : 'transparent',
                borderLeft: location.pathname === item.path ? 
                  `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              }}
            >
              <Tooltip 
                title={item.text} 
                placement="right"
                disableHoverListener={drawerOpen}
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: drawerOpen ? 'initial' : 'center',
                    px: 2.5,
                    py: 1,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: drawerOpen ? 3 : 'auto',
                      justifyContent: 'center',
                      color: location.pathname === item.path || 
                            (item.subItems && item.subItems.some(subItem => location.pathname === subItem.path)) 
                            ? theme.palette.primary.main : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      opacity: drawerOpen ? 1 : 0,
                      display: drawerOpen ? 'block' : 'none',
                      '& .MuiTypography-root': {
                        fontWeight: location.pathname === item.path ? 600 : 400,
                      }
                    }} 
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
            
            {}
            {drawerOpen && item.subItems && (
              <List component="div" disablePadding>
                {item.subItems.map((subItem) => (
                  <ListItem 
                    key={subItem.text} 
                    disablePadding 
                    sx={{ 
                      pl: 2,
                      backgroundColor: location.pathname === subItem.path ? 
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    }}
                  >
                    <ListItemButton
                      component={Link}
                      to={subItem.path}
                      sx={{ 
                        py: 0.5, 
                        minHeight: 36,
                        pl: 4
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: 2,
                          fontSize: '0.9rem',
                          color: location.pathname === subItem.path ? theme.palette.primary.main : 'inherit',
                        }}
                      >
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={subItem.text} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          fontWeight: location.pathname === subItem.path ? 600 : 400, 
                        }} 
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </React.Fragment>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 64}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : 64}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {drawerOpen ? 'Backoffice' : 'BO'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {}
            {user && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: '#ff9800',
                borderRadius: '20px',
                px: 2,
                py: 0.5,
                mr: 1
              }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600,
                  color: '#ffffff'
                }}>
                  {user.username} ({user.roles?.includes('ROLE_SUPER_ADMIN') ? 'Super Admin' : 'Admin'})
                </Typography>
              </Box>
            )}

            {}
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit"
                sx={{
                  backgroundColor: unreadNotifications.length > 0 ? 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' 
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                <Badge badgeContent={unreadNotifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {}
            <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
              <IconButton 
                color="inherit" 
                onClick={toggleTheme}
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            {}
            <Tooltip title="Go to Website">
              <Button 
                variant="contained" 
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                size="small"
                sx={{
                  ml: 1,
                  borderRadius: '20px',
                  backgroundColor: '#2e7d32',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#1b5e20',
                  }
                }}
              >
                Go to Website
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            position: 'fixed',
            whiteSpace: 'nowrap',
            width: drawerOpen ? drawerWidth : 64,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            overflowX: 'hidden',
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100vh',
            zIndex: theme.zIndex.drawer,
          },
        }}
        open={drawerOpen}
      >
        {drawer}
      </Drawer>

      {}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 64}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : 64}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: '64px',
          overflowX: 'hidden',
        }}
      >
        {}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
          >
            {getBreadcrumbs().map((item, index) => (
              <Typography
                key={item.text}
                color={index === getBreadcrumbs().length - 1 ? "text.primary" : "inherit"}
                component={index === getBreadcrumbs().length - 1 ? "span" : Link}
                to={item.path}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  fontWeight: index === getBreadcrumbs().length - 1 ? 600 : 400,
                  '&:hover': { textDecoration: index === getBreadcrumbs().length - 1 ? 'none' : 'underline' }
                }}
              >
                {index === 0 && <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />}
                {item.text}
              </Typography>
            ))}
          </Breadcrumbs>
        </Paper>
        <Outlet />
      </Box>
    </Box>
  );
} 