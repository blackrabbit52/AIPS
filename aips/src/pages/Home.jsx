import { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Paper,
  useTheme,
  Fade
} from '@mui/material';
import { Analytics, Security, Speed } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: <Analytics fontSize="large" />,
      title: 'Advanced Analytics',
      description: 'Powerful tools for data analysis and visualization'
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Secure Platform',
      description: 'Enterprise-grade security for your sensitive data'
    },
    {
      icon: <Speed fontSize="large" />,
      title: 'Real-time Processing',
      description: 'Instant results with our high-performance engine'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper 
        sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1000}>
                <Box>
                  <Typography variant="h2" gutterBottom>
                    Welcome to AIPS
                  </Typography>
                  <Typography variant="h5" paragraph>
                    Advanced Intelligent Processing System
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Transform your data into actionable insights with our cutting-edge analysis platform.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    size="large"
                    onClick={() => navigate('/analysis')}
                    sx={{ mt: 2 }}
                  >
                    Start Analyzing
                  </Button>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Add an illustration or image here */}
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Our Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade in={true} timeout={1000 + index * 500}>
                <Card 
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  sx={{ 
                    height: '100%',
                    transform: hoveredFeature === index ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: theme.shadows[10]
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mb: 2,
                      color: theme.palette.primary.main
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" align="center" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Paper sx={{ bgcolor: theme.palette.grey[100], py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            Join thousands of users who are already transforming their data analysis process.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/register')}
            >
              Sign Up Now
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default Home; 