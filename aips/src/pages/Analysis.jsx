import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  LinearProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
  Task as TaskIcon,
  CloudDownload as CloudDownloadIcon,
  BuildCircle as BuildCircleIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import PageTransition from '../components/PageTransition';
import { useNotification } from '../contexts/NotificationContext';
import { useError } from '../contexts/ErrorContext';
import { useAnalysis } from '../hooks/useAnalysis';
import { useFileValidation } from '../hooks/useFileValidation';
import AnalysisService from '../services/analysis.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Analysis = () => {
  const { showNotification } = useNotification();
  const { handleError } = useError();
  const { isSubmitting, submitAnalysis } = useAnalysis();
  const validateFile = useFileValidation();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [modelsAvailable, setModelsAvailable] = useState(null);
  const [isModelChecking, setIsModelChecking] = useState(false);
  const { user } = useAuth();

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

  // State for model training monitoring
  const [isModelTraining, setIsModelTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingTaskId, setTrainingTaskId] = useState(null);
  const [trainingModelType, setTrainingModelType] = useState("");

  const navigate = useNavigate();

  // Check if ML models are available on component mount
  useEffect(() => {
    checkModelsStatus();
    checkModelTrainingStatus(); // Also check if models are being trained
    const modelsStatusInterval = setInterval(() => {
      checkModelsStatus();
      checkModelTrainingStatus();
    }, 30000); // Check every 30 seconds
    return () => clearInterval(modelsStatusInterval);
  }, []);

  // Poll task status when a task is running
  useEffect(() => {
    let statusInterval;
    if (currentTaskId) {
      statusInterval = setInterval(checkTaskStatus, 5000); // Check every 5 seconds
    }
    return () => {
      clearInterval(statusInterval);
    };
  }, [currentTaskId]);

  // Poll task status when a training task is running
  useEffect(() => {
    let trainingStatusInterval;
    if (trainingTaskId) {
      trainingStatusInterval = setInterval(() => {
        checkTrainingTaskStatus(trainingTaskId);
      }, 5000); // Check every 5 seconds
    }
    return () => {
      if (trainingStatusInterval) clearInterval(trainingStatusInterval);
    };
  }, [trainingTaskId]);

  const checkModelsStatus = async () => {
    setIsModelChecking(true);
    try {
      const response = await AnalysisService.checkModelsStatus();
      setModelsAvailable(response.data.models_available);
      if (response.data.models_available) {
        showNotification("Analysis models are available and ready to use", "success");
      } else {
        showNotification("ML models are not available. Please initialize them in the backoffice.", "warning");
        setError("ML models are not available. Please contact an administrator to initialize them.");
      }
    } catch (err) {
      console.error("Error checking models status:", err);
      setModelsAvailable(false);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          "Analysis service is not available. Please try again later or contact an administrator.";
      setError(errorMessage);
      showNotification("Analysis service is not available", "error");
    } finally {
      setIsModelChecking(false);
    }
  };

  const checkTaskStatus = async () => {
    if (!currentTaskId) return;
    
    try {
      const response = await AnalysisService.checkTaskStatus(currentTaskId);
      setTaskStatus(response.data);
      
      // Check if task is completed
      if (response.data.status === 'SUCCESS') {
        if (response.data.result?.status === 'error') {
          setError(`Task completed with error: ${response.data.result.message}`);
        } else {
          setSuccess("Task completed successfully!");
          showNotification("Analysis task completed successfully!", "success");
          
          // If this was a model training task, check models availability again
          if (response.data.result?.model_training) {
            checkModelsStatus();
          }
        }
        setCurrentTaskId(null); // Reset task ID when completed
      } else if (response.data.status === 'FAILURE') {
        setError("Task failed. Please try again.");
        setCurrentTaskId(null);
      }
    } catch (err) {
      console.error("Error checking task status:", err);
    }
  };

  const checkModelTrainingStatus = async () => {
    try {
      const response = await AnalysisService.checkTrainingStatus();
      if (response.data && response.data.is_training) {
        setIsModelTraining(true);
        setTrainingProgress(response.data.progress || 0);
        setTrainingTaskId(response.data.task_id);
        setTrainingModelType(response.data.model_type || "ML models");
      } else {
        setIsModelTraining(false);
        setTrainingProgress(0);
        setTrainingTaskId(null);
      }
    } catch (err) {
      console.error("Error checking model training status:", err);
    }
  };

  const checkTrainingTaskStatus = async (taskId) => {
    try {
      const response = await AnalysisService.checkTaskStatus(taskId);
      
      if (response.data.result && response.data.result.progress) {
        setTrainingProgress(response.data.result.progress);
      }
      
      // Check if task is completed
      if (response.data.status === 'SUCCESS') {
        showNotification("Models have been successfully trained!", "success");
        setIsModelTraining(false);
        setTrainingTaskId(null);
        // Check models availability again
        checkModelsStatus();
      } else if (response.data.status === 'FAILURE') {
        showNotification("Model training failed. Please contact an administrator.", "error");
        setIsModelTraining(false);
        setTrainingTaskId(null);
      }
    } catch (err) {
      console.error("Error checking training task status:", err);
    }
  };

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

    if (!modelsAvailable) {
      setError('ML models are not available. Please initialize them first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await AnalysisService.analyzeText(textInput);
      setCurrentTaskId(response.data.task_id);
      setSuccess(`Analysis started successfully. Task ID: ${response.data.task_id}`);
    } catch (err) {
      setError('Server connection error');
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMediaAnalysis = async () => {
    if (!username) {
      setError('Please enter a username');
      return;
    }

    if (!modelsAvailable) {
      setError('ML models are not available. Please initialize them first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await AnalysisService.analyzeSocialMedia({
        username,
        platform: socialPlatform,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });
      
      setCurrentTaskId(response.data.task_id);
      setSuccess(`Analysis started successfully. Task ID: ${response.data.task_id}`);
    } catch (err) {
      setError('Server connection error');
      handleError(err);
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

  // Function to render the task status info
  const renderTaskStatus = () => {
    if (!currentTaskId) return null;

    return (
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Task Status
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TaskIcon sx={{ mr: 1 }} />
          <Typography variant="body1">
            Task ID: {currentTaskId}
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Chip
            label={taskStatus?.status || "PENDING"}
            color={
              taskStatus?.status === 'SUCCESS' ? 'success' :
              taskStatus?.status === 'FAILURE' ? 'error' :
              taskStatus?.status === 'STARTED' ? 'primary' : 'default'
            }
            icon={taskStatus?.status === 'SUCCESS' ? <CheckIcon /> : <CircularProgress size={16} />}
          />
        </Box>
        {taskStatus?.result && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(taskStatus.result, null, 2)}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Fonction pour rediriger vers la page de contact avec les informations de l'utilisateur
  const navigateToContact = () => {
    navigate('/contact', { 
      state: { 
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        subject: "Problème avec les modèles d'analyse" 
      }
    });
  };

  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analysis
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Details
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Analysis Name"
                      variant="outlined"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      style={{ display: 'none' }}
                      id="data-file"
                      onChange={handleFileChange}
                    />
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                      <label htmlFor="data-file" style={{ width: '100%' }}>
                        <Button
                          variant="outlined"
                          component="span"
                          fullWidth
                          sx={{ height: '56px' }}
                          startIcon={<CloudDownloadIcon />}
                        >
                          Upload Data File
                        </Button>
                      </label>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      variant="outlined"
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
                Personality Analysis
              </Typography>
              
              {/* Models status panel */}
              <Card elevation={1} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ML Models Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {isModelChecking ? (
                      <CircularProgress size={24} sx={{ mr: 2 }} />
                    ) : (
                      <Chip
                        label={modelsAvailable === null 
                          ? "Checking Service Status..." 
                          : modelsAvailable 
                            ? "Models Available" 
                            : "Models Not Available"}
                        color={modelsAvailable === null 
                          ? "default" 
                          : modelsAvailable 
                            ? "success" 
                            : "error"}
                        sx={{ mr: 2 }}
                      />
                    )}
                    <Button
                      variant="outlined" 
                      onClick={checkModelsStatus}
                      sx={{ mr: 2 }}
                    >
                      Check Status
                    </Button>
                  </Box>
                  
                  {/* Model Training Progress */}
                  {isModelTraining && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {trainingModelType} training in progress: {trainingProgress}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={trainingProgress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Please wait while models are being trained. This process may take some time.
                      </Typography>
                    </Box>
                  )}

                  {!modelsAvailable && !isModelChecking && (
                    <Alert 
                      severity="warning" 
                      sx={{ mt: 2 }}
                      action={
                        <Button 
                          color="inherit" 
                          size="small" 
                          onClick={navigateToContact}
                        >
                          Contact
                        </Button>
                      }
                    >
                      Analysis models are not currently available. 
                      {isModelTraining 
                        ? " Models are being trained and will be available soon." 
                        : " Please contact our team to resolve this issue."
                      }
                    </Alert>
                  )}
                </CardContent>
              </Card>

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
                        disabled={loading || !modelsAvailable}
                        startIcon={loading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
                      >
                        Analyze Text
                      </Button>
                      {!modelsAvailable && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                          Analysis is disabled because the ML models are not available.
                        </Typography>
                      )}
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
                          disabled={loading || !modelsAvailable}
                          startIcon={loading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
                        >
                          Analyze Profile
                        </Button>
                        {!modelsAvailable && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                            Analysis is disabled because the ML models are not available.
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  )}

                  {/* Task status section */}
                  {renderTaskStatus()}
                </CardContent>
              </Card>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Start Analysis
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </PageTransition>
  );
};

export default Analysis; 