import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mon Profil
        </Typography>
        <Typography variant="body1">
          Cette page est en cours de développement.
        </Typography>
      </Box>
    </Container>
  );
};

export default Profile; 