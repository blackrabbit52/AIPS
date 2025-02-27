import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  IconButton,
  Stack
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  Google as GoogleIcon,
  Twitter as TwitterIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link } from 'react-router-dom';

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
      // Implémenter la connexion Google
      console.log('Google login');
    }
  },
  { 
    icon: <FacebookIcon />, 
    label: 'Facebook', 
    color: '#4267B2',
    onClick: () => {
      // Implémenter la connexion Facebook
      console.log('Facebook login');
    }
  },
  { 
    icon: <GitHubIcon />, 
    label: 'GitHub', 
    color: '#333',
    onClick: () => {
      // Implémenter la connexion GitHub
      console.log('GitHub login');
    }
  },
  { 
    icon: <TwitterIcon />, 
    label: 'Twitter', 
    color: '#1DA1F2',
    onClick: () => {
      // Implémenter la connexion Twitter
      console.log('Twitter login');
    }
  }
];

export default function Login() {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      // Implémenter la connexion
      console.log('Form submit:', values);
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: 'background.default',
        p: 3
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Login
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              variant="outlined"
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>or</Divider>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
            {socialButtons.map((btn) => (
              <IconButton
                key={btn.label}
                onClick={btn.onClick}
                sx={{
                  color: 'white',
                  backgroundColor: btn.color,
                  '&:hover': {
                    backgroundColor: btn.color,
                    opacity: 0.9
                  }
                }}
              >
                {btn.icon}
              </IconButton>
            ))}
          </Stack>

          <Typography variant="body2" align="center">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'primary' }}>
              Sign up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
} 