import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import Loader from '../components/common/Loader';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setData({
          welcomeMessage: 'Welcome to AIPS',
          description: 'Discover your personality through AI-powered analysis',
          features: [
            {
              title: 'Personality Analysis',
              description: 'Get insights into your personality traits using advanced AI algorithms',
            },
            {
              title: 'MBTI Assessment',
              description: 'Understand your Myers-Briggs Type Indicator profile',
            },
            {
              title: 'OCEAN Model',
              description: 'Explore your Big Five personality dimensions',
            },
          ],
        });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Loader size={80} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          {data?.welcomeMessage}
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
          {data?.description}
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {data?.features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 