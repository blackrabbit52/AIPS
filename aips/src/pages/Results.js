import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(4)
}));

const ResultCard = styled(Card)(({ theme }) => ({
  height: '100%',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

const Results = () => {
  // Mock data for example
  const analysisResults = {
    mbti: {
      type: 'ENTP',
      description: 'The Innovator - Quick, ingenious, stimulating, alert, and outspoken.',
      strengths: [
        'Creative problem-solving',
        'Adaptability',
        'Strong communication skills',
        'Strategic thinking'
      ],
      weaknesses: [
        'May neglect routine tasks',
        'Can be argumentative',
        'May miss important details',
        'Difficulty with follow-through'
      ]
    },
    ocean: {
      traits: [
        {
          name: 'Openness',
          score: 85,
          description: 'High openness indicates creativity, curiosity, and preference for variety.'
        },
        {
          name: 'Conscientiousness',
          score: 60,
          description: 'Moderate conscientiousness suggests a balance between organization and flexibility.'
        },
        {
          name: 'Extraversion',
          score: 75,
          description: 'High extraversion indicates sociability, energy, and assertiveness.'
        },
        {
          name: 'Agreeableness',
          score: 65,
          description: 'Moderate agreeableness suggests a balance between cooperation and independence.'
        },
        {
          name: 'Neuroticism',
          score: 30,
          description: 'Low neuroticism indicates emotional stability and resilience to stress.'
        }
      ]
    },
    teamRole: {
      primary: 'Innovator',
      secondary: 'Leader',
      description: 'Best suited for roles that require creative thinking and strategic leadership.',
      recommendations: [
        'Lead brainstorming sessions',
        'Develop innovative solutions',
        'Guide team strategy',
        'Mentor team members'
      ]
    }
  };

  return (
    <Container maxWidth="lg">
      <StyledPaper>
        <Typography variant="h4" gutterBottom align="center">
          Analysis Results
        </Typography>

        <Grid container spacing={4}>
          {/* MBTI Results */}
          <Grid item xs={12} md={6}>
            <ResultCard>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  MBTI Analysis
                </Typography>
                <Typography variant="h3" color="primary" align="center" gutterBottom>
                  {analysisResults.mbti.type}
                </Typography>
                <Typography variant="body1" paragraph>
                  {analysisResults.mbti.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Strengths
                </Typography>
                <List dense>
                  {analysisResults.mbti.strengths.map((strength, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={strength} />
                    </ListItem>
                  ))}
                </List>
                <Typography variant="h6" gutterBottom>
                  Areas for Development
                </Typography>
                <List dense>
                  {analysisResults.mbti.weaknesses.map((weakness, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={weakness} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </ResultCard>
          </Grid>

          {/* OCEAN Results */}
          <Grid item xs={12} md={6}>
            <ResultCard>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  OCEAN Analysis
                </Typography>
                {analysisResults.ocean.traits.map((trait, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">
                        {trait.name}
                      </Typography>
                      <Chip label={`${trait.score}%`} color="primary" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {trait.description}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </ResultCard>
          </Grid>

          {/* Team Role Recommendations */}
          <Grid item xs={12}>
            <ResultCard>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Team Role Analysis
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={`Primary: ${analysisResults.teamRole.primary}`} color="primary" />
                  <Chip label={`Secondary: ${analysisResults.teamRole.secondary}`} variant="outlined" />
                </Box>
                <Typography variant="body1" paragraph>
                  {analysisResults.teamRole.description}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Recommended Activities
                </Typography>
                <List dense>
                  {analysisResults.teamRole.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </ResultCard>
          </Grid>
        </Grid>
      </StyledPaper>
    </Container>
  );
};

export default Results; 