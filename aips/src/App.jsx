import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme/theme';
import { Layout } from './components/layout/Layout';

// Import pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.js';
import Dashboard from './pages/Dashboard.js';
import Analysis from './pages/Analysis.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = useMemo(() => getTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);

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
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App; 