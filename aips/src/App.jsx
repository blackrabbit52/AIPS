import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { Layout } from './components/layout/Layout';
import { Home } from './components/Home';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Dashboard } from './components/Dashboard';
import { Analysis } from './components/Analysis';
import { Settings } from './components/Settings';
import { Profile } from './components/Profile';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: isDarkMode ? '#121212' : '#f5f5f5',
            paper: isDarkMode ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
        },
        components: {
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
              },
            },
          },
        },
      }),
    [isDarkMode]
  );

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout toggleTheme={toggleTheme} isDarkMode={isDarkMode}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App; 