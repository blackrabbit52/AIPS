import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme/theme';
import { Layout } from './components/layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import { Navbar } from './components/Navbar';
import { LoadingProvider } from './contexts/LoadingContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import PageProgress from './components/PageProgress';

// Import pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.js';
import Dashboard from './pages/Dashboard.js';
import Analysis from './pages/Analysis.jsx';
import Profile from './pages/Profile.jsx';
import Backoffice from './pages/Backoffice.jsx';
import About from './pages/About.jsx';
import Results from './pages/Results.jsx';

// Import new public pages
import Features from './pages/Features.jsx';
import Pricing from './pages/Pricing.jsx';
import CaseStudies from './pages/CaseStudies.jsx';
import Blog from './pages/Blog.jsx';
import Help from './pages/Help.jsx';
import Contact from './pages/Contact.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import Security from './pages/Security.jsx';
import Status from './pages/Status.jsx';
import Community from './pages/Community.jsx';

// Import backoffice components
import BackofficeLayout from './pages/backoffice/BackofficeLayout';
import CreateSuperUser from './pages/backoffice/CreateSuperUser';
import SecretSuperUserCreation from './pages/SecretSuperUserCreation';
import UserManagement from './pages/backoffice/UserManagement';
import AnalysisTemplates from './pages/backoffice/analysis/AnalysisTemplates';
import AnalysisHistory from './pages/backoffice/analysis/AnalysisHistory';
import MetricsDashboard from './pages/backoffice/analysis/MetricsDashboard';
import AlgorithmSettings from './pages/backoffice/recommendations/AlgorithmSettings';
import PageManager from './pages/backoffice/content/PageManager';
import BlogManager from './pages/backoffice/content/BlogManager';
import FAQManager from './pages/backoffice/content/FAQManager';
import NavigationSettings from './pages/backoffice/website/NavigationSettings';
import FooterSettings from './pages/backoffice/website/FooterSettings';
import SystemSettings from './pages/backoffice/settings/SystemSettings';
import RoleManagement from './pages/backoffice/roles/RoleManagement';

const DATASETS_URL = "http://localhost:8080/api/v1/datasets";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const theme = useMemo(() => getTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorProvider>
        <NotificationProvider>
          <LoadingProvider>
            <Router>
              <PageProgress isLoading={isPageLoading} />
              <Navbar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
              <AuthProvider>
                <Routes>
                  <Route element={<Layout />}>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/case-studies" element={<CaseStudies />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/security" element={<Security />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/initialize-super-admin-x8k9y7z" element={<SecretSuperUserCreation />} />
                  
                    {/* Protected Routes */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/analysis" element={<Analysis />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/results/:id" element={<Results />} />
                    </Route>
                    
                    {/* Admin Routes */}
                    <Route element={<PrivateRoute requiredRole="ROLE_ADMIN" />}>
                      <Route path="/backoffice" element={<BackofficeLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode} />}>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="analysis" element={<AnalysisTemplates />} />
                        <Route path="analysis/history" element={<AnalysisHistory />} />
                        <Route path="analysis/metrics" element={<MetricsDashboard />} />
                        <Route path="recommendations" element={<AlgorithmSettings />} />
                        <Route path="content" element={<PageManager />} />
                        <Route path="content/blog" element={<BlogManager />} />
                        <Route path="content/faqs" element={<FAQManager />} />
                        <Route path="website" element={<NavigationSettings />} />
                        <Route path="website/footer" element={<FooterSettings />} />
                        <Route path="roles" element={<RoleManagement />} />
                        <Route path="settings" element={<SystemSettings />} />
                        <Route path="settings/system" element={<SystemSettings />} />
                      </Route>
                    </Route>
                  </Route>
                </Routes>
              </AuthProvider>
            </Router>
          </LoadingProvider>
        </NotificationProvider>
      </ErrorProvider>
    </ThemeProvider>
  );
}

export default App; 