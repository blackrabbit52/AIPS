import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = ({ children, toggleTheme, isDarkMode }) => {
  const location = useLocation();
  const theme = useTheme();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
      }}
    >
      {!isAuthPage && <Navbar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: isAuthPage ? 0 : 8,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
        }}
      >
        {children}
      </Box>
      {!isAuthPage && <Footer />}
    </Box>
  );
}; 