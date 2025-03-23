import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardHeader, Button, Box } from '@mui/material';

const Pricing = () => {
  const plans = [
    {
      title: "Basic",
      price: "$29",
      period: "per month",
      features: [
        "100 analyses per month",
        "Basic reporting",
        "Email support",
        "API access"
      ]
    },
    {
      title: "Professional",
      price: "$99",
      period: "per month",
      features: [
        "500 analyses per month",
        "Advanced reporting",
        "Priority support",
        "Full API access"
      ]
    },
    {
      title: "Enterprise",
      price: "Custom",
      period: "per month",
      features: [
        "Unlimited analyses",
        "Custom reporting",
        "24/7 support",
        "Dedicated account manager"
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Pricing Plans
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Choose the perfect plan for your needs
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {plans.map((plan, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardHeader
                title={plan.title}
                titleTypographyProps={{ align: 'center' }}
                sx={{ bgcolor: 'primary.light' }}
              />
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h4" component="span">
                    {plan.price}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    /{plan.period}
                  </Typography>
                </Box>
                {plan.features.map((feature, idx) => (
                  <Typography key={idx} component="li" sx={{ mt: 1 }}>
                    {feature}
                  </Typography>
                ))}
                <Button fullWidth variant="contained" sx={{ mt: 4 }}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Pricing; 