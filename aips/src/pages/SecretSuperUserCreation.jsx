import React, { useState } from 'react';
import { 
  Box, Card, CardContent, TextField, Button, Typography, 
  Alert, CircularProgress 
} from '@mui/material';
import authService from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

const SecretSuperUserCreation = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.createSuperAdmin(
        formData.username,
        formData.email,
        formData.password
      );
      navigate('/login');
    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data || err.message || 'Failed to create super admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 400, 
      mx: 'auto', 
      mt: 8,
      p: 2
    }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Initialize Super Admin
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <TextField
              fullWidth
              label="First Name"
              margin="normal"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              margin="normal"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Initialize Super Admin'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SecretSuperUserCreation; 