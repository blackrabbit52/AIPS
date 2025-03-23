import React from 'react';
import { Container, Typography, Card, CardContent, Button, Grid, Box, Chip, Divider } from '@mui/material';

const Careers = () => {
  const positions = [
    {
      title: "Senior AI Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Join our AI team to develop cutting-edge personality analysis algorithms"
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Paris",
      type: "Full-time",
      description: "Create intuitive and engaging user experiences for our platform"
    },
    {
      title: "Data Scientist",
      department: "Research",
      location: "Remote",
      type: "Full-time",
      description: "Work on advanced data models for personality assessment"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Join Our Team
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Help us shape the future of personality analysis
      </Typography>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" gutterBottom>
          Why Join AIPS?
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Innovation</Typography>
                <Typography>Work with cutting-edge AI technology</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Growth</Typography>
                <Typography>Continuous learning and development opportunities</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Impact</Typography>
                <Typography>Make a real difference in how businesses understand people</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 6 }}>
        Open Positions
      </Typography>
      {positions.map((position, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6">{position.title}</Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  {position.department} · {position.location}
                </Typography>
                <Typography>{position.description}</Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                <Chip label={position.type} color="primary" sx={{ mb: 2 }} />
                <Button variant="contained" fullWidth>
                  Apply Now
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default Careers; 