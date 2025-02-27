import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  GitHub as GitHubIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  searchQuery: yup
    .string()
    .required('Please enter a search term'),
  analysisType: yup
    .string()
    .oneOf(['post', 'profile', 'list'], 'Invalid analysis type')
    .required('Please select an analysis type'),
  socialNetwork: yup
    .string()
    .oneOf(['facebook', 'twitter', 'github', 'instagram', 'linkedin'], 'Invalid social network')
    .required('Please select a social network')
});

const socialNetworks = [
  { id: 'facebook', icon: <FacebookIcon />, color: '#1877F2' },
  { id: 'twitter', icon: <TwitterIcon />, color: '#1DA1F2' },
  { id: 'github', icon: <GitHubIcon />, color: '#333' },
  { id: 'instagram', icon: <InstagramIcon />, color: '#E4405F' },
  { id: 'linkedin', icon: <LinkedInIcon />, color: '#0A66C2' }
];

export default function Analysis() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const formik = useFormik({
    initialValues: {
      searchQuery: '',
      analysisType: 'post',
      socialNetwork: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Make API call to analysis service
        console.log('Analyzing:', values);
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setResults({
          sentiment: 'Positive',
          confidence: 0.85,
          keywords: ['innovation', 'technology', 'development']
        });
      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Personality Analysis
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                name="searchQuery"
                label="Search for a profile, post, or list"
                variant="outlined"
                value={formik.values.searchQuery}
                onChange={formik.handleChange}
                error={formik.touched.searchQuery && Boolean(formik.errors.searchQuery)}
                helperText={formik.touched.searchQuery && formik.errors.searchQuery}
                InputProps={{
                  endAdornment: (
                    <IconButton 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                    </IconButton>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Analysis Type
              </Typography>
              <ToggleButtonGroup
                value={formik.values.analysisType}
                exclusive
                onChange={(e, value) => formik.setFieldValue('analysisType', value)}
                aria-label="analysis type"
              >
                <ToggleButton value="post">Single Post</ToggleButton>
                <ToggleButton value="profile">Full Profile</ToggleButton>
                <ToggleButton value="list">Post List</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Social Network
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialNetworks.map((network) => (
                  <Tooltip key={network.id} title={network.id}>
                    <IconButton
                      onClick={() => formik.setFieldValue('socialNetwork', network.id)}
                      sx={{
                        color: formik.values.socialNetwork === network.id ? network.color : 'inherit',
                        border: formik.values.socialNetwork === network.id ? `2px solid ${network.color}` : '2px solid transparent'
                      }}
                    >
                      {network.icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                Sentiment: {results.sentiment}
              </Typography>
              <Typography variant="body1">
                Confidence: {(results.confidence * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body1">
                Keywords: {results.keywords.join(', ')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 