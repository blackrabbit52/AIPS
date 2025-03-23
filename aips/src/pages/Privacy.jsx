import React from 'react';
import { Container, Typography, Paper, Box, Divider, List, ListItem, ListItemText } from '@mui/material';

const Privacy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Privacy Policy
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Last updated: March 2024
      </Typography>

      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Data Collection
          </Typography>
          <Typography paragraph>
            We collect the following types of information:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Personal Information"
                secondary="Name, email, and professional details"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Usage Data"
                secondary="How you interact with our platform"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Analysis Data"
                secondary="Data submitted for personality analysis"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Data Usage
          </Typography>
          <Typography paragraph>
            Your data is used to provide and improve our services, generate analysis
            results, and enhance user experience. We never sell your personal data
            to third parties.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Privacy; 