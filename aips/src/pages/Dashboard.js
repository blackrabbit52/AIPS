import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(4)
}));

const TraitCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

const Dashboard = () => {
  // Mock data for example
  const mbtiData = {
    type: 'ENTP',
    traits: {
      'E/I': 65,
      'N/S': 80,
      'T/F': 70,
      'P/J': 55
    }
  };

  const oceanData = {
    traits: {
      'Openness': 85,
      'Conscientiousness': 60,
      'Extraversion': 75,
      'Agreeableness': 65,
      'Neuroticism': 30
    }
  };

  const roleRecommendation = {
    primary: 'Innovator',
    secondary: 'Leader',
    description: 'Your profile suggests a strong ability to generate new ideas and lead teams towards innovation.'
  };

  return (
    <Container maxWidth="lg">
      <StyledPaper>
        <Typography variant="h4" gutterBottom align="center">
          Dashboard
        </Typography>

        <Grid container spacing={4}>
          {/* MBTI Section */}
          <Grid item xs={12} md={6}>
            <TraitCard>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  MBTI Profile
                </Typography>
                <Typography variant="h3" color="primary" align="center" gutterBottom>
                  {mbtiData.type}
                </Typography>
                {Object.entries(mbtiData.traits).map(([trait, value]) => (
                  <Box key={trait} sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {trait}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={value} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" align="right">
                      {value}%
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </TraitCard>
          </Grid>

          {/* OCEAN Section */}
          <Grid item xs={12} md={6}>
            <TraitCard>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  OCEAN Profile
                </Typography>
                {Object.entries(oceanData.traits).map(([trait, value]) => (
                  <Box key={trait} sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {trait}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={value} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" align="right">
                      {value}%
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </TraitCard>
          </Grid>

          {/* Role Recommendation Section */}
          <Grid item xs={12}>
            <TraitCard>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Role Recommendation
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={roleRecommendation.primary} color="primary" />
                  <Chip label={roleRecommendation.secondary} variant="outlined" />
                </Box>
                <Typography variant="body1">
                  {roleRecommendation.description}
                </Typography>
              </CardContent>
            </TraitCard>
          </Grid>
        </Grid>
      </StyledPaper>
    </Container>
  );
};

export default Dashboard; 