import React from 'react';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation, Outlet } from 'react-router-dom';
import { Footer } from './Footer';

export const Layout = () => {
  const location = useLocation();
  
  // Generate breadcrumb navigation from current path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    return [
      { text: 'Home', link: '/' },
      ...pathnames.map((name, index) => ({
        text: name.charAt(0).toUpperCase() + name.slice(1),
        link: index === pathnames.length - 1 ? null : `/${pathnames.slice(0, index + 1).join('/')}`
      }))
    ];
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        pt: '64px', // Account for fixed AppBar height
      }}
    >
      {/* Display breadcrumbs except on home page */}
      {location.pathname !== '/' && (
        <Box sx={{ p: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            {generateBreadcrumbs().map((crumb, index) => 
              crumb.link ? (
                <Link 
                  key={index}
                  component={RouterLink} 
                  to={crumb.link}
                  color="inherit"
                  sx={{ textDecoration: 'none' }}
                >
                  {crumb.text}
                </Link>
              ) : (
                <Typography key={index} color="text.primary">
                  {crumb.text}
                </Typography>
              )
            )}
          </Breadcrumbs>
        </Box>
      )}
      
      {/* Main content area */}
      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          p: 3,
          width: '100%',
          maxWidth: '100%',
          overflow: 'auto'
        }}
      >
        <Outlet />
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout; 