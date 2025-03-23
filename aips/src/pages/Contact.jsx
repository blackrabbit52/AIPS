import React, { useState } from 'react';
import { Container, Typography, Grid, TextField, Button, Card, CardContent, Box, Alert } from '@mui/material';
import { Email, Phone, LocationOn } from '@mui/icons-material';

const Contact = () => {
  const [formStatus, setFormStatus] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormStatus('success');
    // Add actual form submission logic here
  };

  const contactInfo = [
    {
      icon: <Email />,
      title: "Email",
      content: "support@aips-platform.com"
    },
    {
      icon: <Phone />,
      title: "Phone",
      content: "+1 (555) 123-4567"
    },
    {
      icon: <LocationOn />,
      title: "Address",
      content: "123 Tech Street, Silicon Valley, CA 94025"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        We're here to help and answer any questions you might have
      </Typography>

      <Grid container spacing={6} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 4 }}>
            {contactInfo.map((info, index) => (
              <Card sx={{ mb: 2 }} key={index}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {info.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {info.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {info.content}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Send us a message
              </Typography>
              {formStatus === 'success' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Message sent successfully!
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={4}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact; 