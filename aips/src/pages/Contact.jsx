import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, TextField, Button, Card, CardContent, Box, Alert } from '@mui/material';
import { Email, Phone, LocationOn, AttachFile } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Assume there is an authentication context

const Contact = () => {
  const [formStatus, setFormStatus] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const location = useLocation();
  const { user } = useAuth(); // Retrieve information of the logged-in user


// Default values for the form fields
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'Problem with the analysis models\n'
  });

// Pre-fill the fields if the user is logged in
  useEffect(() => {
    if (user) {
      setFormValues({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        subject: location.state?.subject || ' Problem with the analysis models\n'
      });
    }
  }, [user, location]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Create a FormData object for sending the file
    const formData = new FormData();
    formData.append('firstName', formValues.firstName);
    formData.append('lastName', formValues.lastName);
    formData.append('email', formValues.email);
    formData.append('subject', formValues.subject);
    formData.append('message', message);
    if (file) {
      formData.append('file', file);
    }
    
    // Here, you would add the logic to submit the form with the file
    // for example: await contactService.submitContactForm(formData);

    setFormStatus('success');
    setMessage('');
    setFile(null);
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
                      value={formValues.firstName}
                      disabled={user && user.firstName}
                      InputProps={{
                        readOnly: user && user.firstName,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      required
                      value={formValues.lastName}
                      disabled={user && user.lastName}
                      InputProps={{
                        readOnly: user && user.lastName,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      required
                      value={formValues.email}
                      disabled={user && user.email}
                      InputProps={{
                        readOnly: user && user.email,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      required
                      value={formValues.subject}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={4}
                      required
                      value={message}
                      onChange={handleMessageChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<AttachFile />}
                      sx={{ mb: 2 }}
                    >
                      Submit Attachments
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>
                    {file && (
                      <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                        {file.name}
                      </Typography>
                    )}
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