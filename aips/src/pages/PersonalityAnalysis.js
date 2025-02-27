import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(4)
}));

const PersonalityAnalysis = () => {
  const [tabValue, setTabValue] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [profileLink, setProfileLink] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError('');
    try {
      // TODO: Implement API call for analysis
      console.log('Analysis in progress...');
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        <Typography variant="h4" gutterBottom align="center">
          Personality Analysis
        </Typography>
        
        <Typography variant="body1" paragraph align="center" color="textSecondary">
          Discover your personality profile based on your text or social profile
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Text Analysis" />
            <Tab label="Social Profile Analysis" />
          </Tabs>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {tabValue === 0 ? (
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              label="Enter your text here"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your posts or write text that reflects your personality..."
              sx={{ mb: 3 }}
            />
          ) : (
            <TextField
              fullWidth
              variant="outlined"
              label="Social Profile Link"
              value={profileLink}
              onChange={(e) => setProfileLink(e.target.value)}
              placeholder="https://..."
              sx={{ mb: 3 }}
            />
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={isAnalyzing}
              sx={{ minWidth: 200 }}
            >
              {isAnalyzing ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Analysis in progress...
                </>
              ) : (
                'Start Analysis'
              )}
            </Button>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default PersonalityAnalysis; 