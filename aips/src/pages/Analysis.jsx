import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress
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
import PageTransition from '../components/PageTransition';
import { useNotification } from '../contexts/NotificationContext';
import { useError } from '../contexts/ErrorContext';
import { useAnalysis } from '../hooks/useAnalysis';
import { useFileValidation } from '../hooks/useFileValidation';

const Analysis = () => {
  const { showNotification } = useNotification();
  const { handleError } = useError();
  const { isSubmitting, submitAnalysis } = useAnalysis();
  const validateFile = useFileValidation();
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


  const [analysisType, setAnalysisType] = useState('');
  const [file, setFile] = useState(null);
  const [parameters, setParameters] = useState({
    confidence: 95,
    iterations: 1000
  });

  const handleParameterChange = React.useCallback((event) => {
    const { name, value } = event.target;
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
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
  const handleFileChange = React.useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  }, [validateFile]);

  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault();
    const analysisData = {
      type: analysisType,
      file,
      parameters
    };
    const success = await submitAnalysis(analysisData);
    if (success) {
      // Redirection ou autre logique après succès
    }
  }, [analysisType, file, parameters, submitAnalysis]);

  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analysis
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
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
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Analysis Name"
                      variant="outlined"
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      variant="outlined"
                      multiline
                      rows={4}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      style={{ display: 'none' }}
                      id="data-file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="data-file">
                      <Button
                        variant="contained"
                        component="span"
                      >
                        Upload Data File
                      </Button>
                    </label>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Start Analysis
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </PageTransition>
  );
};

export default Analysis; 