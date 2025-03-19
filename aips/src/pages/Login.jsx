import React, { useState } from 'react';
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
  Paper
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

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const socialButtons = [
  { 
    icon: <GoogleIcon />, 
    label: 'Google', 
    color: '#DB4437',
    onClick: () => {
      // Implement Google login
      console.log('Google login');
    }
  },
  { 
    icon: <FacebookIcon />, 
    label: 'Facebook', 
    color: '#4267B2',
    onClick: () => {
      // Implement Facebook login
      console.log('Facebook login');
    }
  },
  { 
    icon: <GitHubIcon />, 
    label: 'GitHub', 
    color: '#333',
    onClick: () => {
      // Implement GitHub login
      console.log('GitHub login');
    }
  },
  { 
    icon: <TwitterIcon />, 
    label: 'Twitter', 
    color: '#1DA1F2',
    onClick: () => {
      // Implement Twitter login
      console.log('Twitter login');
    }
  }
];

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(identifier, password);
      if (response.data.token) {
        navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

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

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="identifier"
              label="Username or Email"
              name="identifier"
              autoComplete="email"
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
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