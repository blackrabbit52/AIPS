import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  IconButton,
  Stack,
  Alert,
  Container,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  Google as GoogleIcon,
  Twitter as TwitterIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/auth.service';
import { useNotification } from '../contexts/NotificationContext';

const validationSchema = yup.object({
  usernameOrEmail: yup
    .string()
    .required('Username or Email is required'),
  password: yup
    .string()
    .required('Password is required')
});

const Login = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

// Check if the user is already logged in
  useEffect(() => {
    if (authService.getCurrentUser()?.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      usernameOrEmail: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');

      try {
        await authService.login(values.usernameOrEmail, values.password);
        showNotification("Successfully logged in!");
        
        const intendedUrl = localStorage.getItem('intendedUrl') || '/dashboard';
        localStorage.removeItem('intendedUrl');
        navigate(intendedUrl);
      } catch (err) {
        const errorMessage = typeof err === 'string' ? err : 'Login failed. Please try again.';
        setError(errorMessage);
        showNotification(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  });

// Display the success message after registration
  React.useEffect(() => {
    if (location.state?.message) {
      // Message de succès après inscription
    }
  }, [location]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {location.state?.message && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {location.state.message}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="usernameOrEmail"
              label="Username or Email"
              name="usernameOrEmail"
              autoComplete="email"
              autoFocus
              value={formik.values.usernameOrEmail}
              onChange={formik.handleChange}
              error={formik.touched.usernameOrEmail && Boolean(formik.errors.usernameOrEmail)}
              helperText={formik.touched.usernameOrEmail && formik.errors.usernameOrEmail}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <IconButton
                sx={{
                  backgroundColor: '#DB4437',
                  color: 'white',
                  '&:hover': { backgroundColor: '#C53929' }
                }}
              >
                <GoogleIcon />
              </IconButton>
              <IconButton
                sx={{
                  backgroundColor: '#4267B2',
                  color: 'white',
                  '&:hover': { backgroundColor: '#365899' }
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                sx={{
                  backgroundColor: '#333',
                  color: 'white',
                  '&:hover': { backgroundColor: '#24292e' }
                }}
              >
                <GitHubIcon />
              </IconButton>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Button
                  onClick={() => navigate('/register')}
                  sx={{ textTransform: 'none' }}
                >
                  Sign Up
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 