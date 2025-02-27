import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Icon,
  useTheme
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const features = [
  {
    title: 'Advanced Analysis',
    description: 'Analyze social media profiles and posts with our AI-powered tools',
    icon: <AnalyticsIcon fontSize="large" />,
  },
  {
    title: 'Personality Insights',
    description: 'Get deep insights into personality traits and behavioral patterns',
    icon: <PsychologyIcon fontSize="large" />,
  },
  {
    title: 'Trend Detection',
    description: 'Identify emerging patterns and trends in social behavior',
    icon: <TrendingUpIcon fontSize="large" />,
  },
  {
    title: 'Secure & Private',
    description: 'Your data is protected with enterprise-grade security',
    icon: <SecurityIcon fontSize="large" />,
  },
];

export default function Home() {
  const theme = useTheme();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 12 }}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Welcome to AIPS
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ mb: 8 }}
        >
          Advanced Intelligent Personality System - Unlock the power of social media analysis
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardActionArea sx={{ height: '100%', p: 2 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        color: 'primary.main',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h2"
                      align="center"
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Our platform uses advanced machine learning algorithms to analyze social media
            profiles and content, providing valuable insights into personality traits,
            behavior patterns, and social trends.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
} 