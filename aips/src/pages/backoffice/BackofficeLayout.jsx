import React from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, 
  ListItemIcon, ListItemText, IconButton, useTheme } from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Recommend as RecommendIcon,
  Web as WebIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

const drawerWidth = 240;

const BackofficeLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/admin/dashboard' 
    },
    { 
      text: 'User Management', 
      icon: <PeopleIcon />, 
      path: '/admin/users' 
    },
    { 
      text: 'Roles & Permissions', 
      icon: <SecurityIcon />, 
      path: '/admin/roles' 
    },
    {
      text: 'Analysis Service',
      icon: <AnalyticsIcon />,
      path: '/admin/analysis',
      subItems: [
        { text: 'Analysis Templates', path: '/admin/analysis/templates' },
        { text: 'Analysis History', path: '/admin/analysis/history' },
        { text: 'Performance Metrics', path: '/admin/analysis/metrics' }
      ]
    },
    {
      text: 'Recommendation Engine',
      icon: <RecommendIcon />,
      path: '/admin/recommendations',
      subItems: [
        { text: 'Algorithm Settings', path: '/admin/recommendations/settings' },
        { text: 'Recommendation History', path: '/admin/recommendations/history' },
        { text: 'Feedback Analysis', path: '/admin/recommendations/feedback' }
      ]
    },
    {
      text: 'Content Management',
      icon: <ArticleIcon />,
      path: '/admin/content',
      subItems: [
        { text: 'Pages', path: '/admin/content/pages' },
        { text: 'Blog Posts', path: '/admin/content/blog' },
        { text: 'FAQs', path: '/admin/content/faqs' }
      ]
    },
    {
      text: 'Website Settings',
      icon: <WebIcon />,
      path: '/admin/website',
      subItems: [
        { text: 'Homepage', path: '/admin/website/homepage' },
        { text: 'Navigation', path: '/admin/website/navigation' },
        { text: 'Footer', path: '/admin/website/footer' }
      ]
    },
    { 
      text: 'System Settings', 
      icon: <SettingsIcon />, 
      path: '/admin/settings' 
    }
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap>
          AIPS Admin
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            AIPS Backoffice
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/')}>
            <ExitIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          display: { xs: 'none', sm: 'block' }
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default BackofficeLayout; 