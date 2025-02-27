import React from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, useTheme, ThemeProvider, createTheme, CssBaseline, Badge } from '@mui/material';
import { Brightness4, Brightness7, AccountCircle, Notifications } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  const [notificationCount, setNotificationCount] = React.useState(0);
  const navigate = useNavigate();

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      }),
    [mode]
  );

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleNotificationsClick = () => {
    // Handle notifications click
    setNotificationCount(0);
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                AIPS
              </Typography>
              <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <IconButton color="inherit" onClick={handleNotificationsClick}>
                <Badge badgeContent={notificationCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              <IconButton color="inherit" onClick={handleProfileClick}>
                <AccountCircle />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            {children}
          </Box>
          <Footer />
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}; 