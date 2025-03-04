import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tab,
  Tabs,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';

const Analysis = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [textInput, setTextInput] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('twitter');
  const [username, setUsername] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) {
      setError('Please enter text to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/v1/analysis/analyze_text/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(`Analysis started successfully. Task ID: ${data.task_id}`);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMediaAnalysis = async () => {
    if (!username) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/v1/analysis/analyze_social_media/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          platform: socialPlatform,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(`Analysis started successfully. Task ID: ${data.task_id}`);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Personality Analysis
      </Typography>

      <Card elevation={1}>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab
              icon={<AnalyticsIcon />}
              label="Text Analysis"
              iconPosition="start"
            />
            <Tab
              icon={<PersonIcon />}
              label="Social Media Analysis"
              iconPosition="start"
            />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {activeTab === 0 && (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                label="Text to analyze"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                variant="contained"
                onClick={handleTextAnalysis}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
              >
                Analyze Text
              </Button>
            </Box>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Platform</InputLabel>
                  <Select
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value)}
                    label="Platform"
                  >
                    <MenuItem value="twitter">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TwitterIcon sx={{ mr: 1 }} /> Twitter
                      </Box>
                    </MenuItem>
                    <MenuItem value="linkedin">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinkedInIcon sx={{ mr: 1 }} /> LinkedIn
                      </Box>
                    </MenuItem>
                    <MenuItem value="facebook">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FacebookIcon sx={{ mr: 1 }} /> Facebook
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleSocialMediaAnalysis}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
                >
                  Analyze Profile
                </Button>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Analysis; 