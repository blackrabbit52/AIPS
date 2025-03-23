import React from 'react';
import { Container, Typography, Paper, Grid, Card, CardContent, Box } from '@mui/material';
import { Shield, Lock, Security as SecurityIcon, Verified } from '@mui/icons-material';

const Security = () => {
  const securityFeatures = [
    {
      icon: <Shield />,
      title: "Data Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard protocols"
    },
    {
      icon: <Lock />,
      title: "Access Control",
      description: "Strict access controls and authentication mechanisms"
    },
    {
      icon: <SecurityIcon />,
      title: "Regular Audits",
      description: "Continuous security monitoring and regular penetration testing"
    },
    {
      icon: <Verified />,
      title: "Compliance",
      description: "Compliant with GDPR, CCPA, and other privacy regulations"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Security at AIPS
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Your security and privacy are our top priorities
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {securityFeatures.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 4, mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Our Security Commitment
        </Typography>
        <Typography paragraph>
          We employ industry-leading security measures to protect your data and ensure
          the integrity of our platform. Our security practices are regularly audited
          and updated to maintain the highest standards of protection.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Security; 