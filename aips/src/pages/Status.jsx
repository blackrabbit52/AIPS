import React from 'react';
import { Container, Typography, Paper, Box, Grid, LinearProgress, Card, CardContent, Alert } from '@mui/material';
import { CheckCircle, Warning, Error } from '@mui/icons-material';

const Status = () => {
  const services = [
    {
      name: "API Service",
      status: "operational",
      uptime: "99.99%",
      latency: "45ms"
    },
    {
      name: "Analysis Engine",
      status: "operational",
      uptime: "99.95%",
      latency: "120ms"
    },
    {
      name: "Database",
      status: "operational",
      uptime: "99.99%",
      latency: "15ms"
    },
    {
      name: "Authentication",
      status: "operational",
      uptime: "99.99%",
      latency: "30ms"
    }
  ];

  const incidents = [
    {
      date: "March 20, 2024",
      title: "Scheduled Maintenance",
      status: "planned",
      description: "System upgrade scheduled for improved performance"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "operational":
        return <CheckCircle color="success" />;
      case "degraded":
        return <Warning color="warning" />;
      case "down":
        return <Error color="error" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        System Status
      </Typography>

      <Alert severity="success" sx={{ mb: 4 }}>
        All systems are operational
      </Alert>

      <Grid container spacing={4}>
        {services.map((service, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getStatusIcon(service.status)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {service.name}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Uptime: {service.uptime}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latency: {service.latency}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={99.9}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mt: 6, mb: 3 }}>
        Recent Incidents
      </Typography>
      {incidents.map((incident, index) => (
        <Paper key={index} sx={{ p: 3, mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            {incident.date}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {incident.title}
          </Typography>
          <Typography variant="body1">
            {incident.description}
          </Typography>
        </Paper>
      ))}
    </Container>
  );
};

export default Status; 