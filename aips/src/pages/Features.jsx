import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';

const Features = () => {
  const features = [
    {
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms for accurate personality insights"
    },
    {
      title: "Real-time Processing",
      description: "Instant analysis of social media profiles and text content"
    },
    {
      title: "Comprehensive Reports",
      description: "Detailed personality assessments with actionable insights"
    },
    {
      title: "Data Security",
      description: "Enterprise-grade security measures to protect your data"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Platform Features
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Discover the powerful features that make AIPS the leading personality analysis platform
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Features; 