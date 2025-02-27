import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import Loader from '../components/common/Loader';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
}

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    bio: 'AI enthusiast and personality researcher',
    preferences: {
      notifications: true,
      theme: 'light',
      language: 'en',
    },
  });

  const handleEdit = () => {
    setEditing(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEditing(false);
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{ width: 100, height: 100, mr: 3 }}
            src="/path/to/avatar.jpg"
          />
          <Box>
            <Typography variant="h4">
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography color="textSecondary">{profile.email}</Typography>
          </Box>
        </Box>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={profile.firstName}
              disabled={!editing}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={profile.lastName}
              disabled={!editing}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={profile.email}
              disabled={!editing}
              type="email"
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              value={profile.bio}
              disabled={!editing}
              multiline
              rows={4}
              onChange={(e) => handleChange('bio', e.target.value)}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          {!editing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              color="primary"
            >
              Save Changes
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 