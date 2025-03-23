import React from 'react';
import { Container, Typography, Paper, Box, Divider } from '@mui/material';

const Terms = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Terms of Service
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Last updated: March 2024
      </Typography>

      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            1. Introduction
          </Typography>
          <Typography paragraph>
            Welcome to AIPS Platform. By accessing our service, you agree to these terms.
            Please read them carefully before using our platform.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            2. Use of Services
          </Typography>
          <Typography paragraph>
            Our services are designed for personality analysis and data processing.
            You agree to use them only for their intended purpose and in compliance
            with applicable laws and regulations.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            3. Privacy and Data Protection
          </Typography>
          <Typography paragraph>
            We take data protection seriously. All data processing is conducted in
            accordance with our Privacy Policy and applicable data protection laws.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Terms; 