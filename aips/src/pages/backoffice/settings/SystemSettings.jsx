import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Storage as StorageIcon,
  Science as ScienceIcon,
  CloudDownload as CloudDownloadIcon,
  BuildCircle as BuildCircleIcon,
  Check as CheckIcon,
  Task as TaskIcon,
  DataObject as DataObjectIcon,
  BubbleChart as BubbleChartIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import AnalysisService from '../../../services/analysis.service';
import { useNotification } from '../../../contexts/NotificationContext';
import { useError } from '../../../contexts/ErrorContext';

const SystemSettings = () => {
  const { showNotification } = useNotification();
  const { handleError } = useError();
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    // Email Settings
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'notifications@aips.com',
    emailFromName: 'AIPS Platform',
    
    // Security Settings
    maxLoginAttempts: 5,
    passwordExpiration: 90,
    sessionTimeout: 30,
    requireMFA: true,
    
    // Performance Settings
    maxConcurrentAnalyses: 10,
    cacheTimeout: 3600,
    debugMode: false,
    
    // Notification Settings
    enableEmailNotifications: true,
    enablePushNotifications: true,
    notificationFrequency: 'realtime'
  });

  // ML Settings states
  const [modelsAvailable, setModelsAvailable] = useState(null);
  const [isModelChecking, setIsModelChecking] = useState(false);
  const [isModelTraining, setIsModelTraining] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [selectedModelType, setSelectedModelType] = useState('MBTI');
  const [selectedDatasetIds, setSelectedDatasetIds] = useState([]);
  const [dataLimit, setDataLimit] = useState(100);

  const [saved, setSaved] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStartTime, setTrainingStartTime] = useState(null);
  const [estimatedTotalTime, setEstimatedTotalTime] = useState(null); // in seconds
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [remainingTime, setRemainingTime] = useState(null); // in seconds
  const [openTrainingModal, setOpenTrainingModal] = useState(false);

  // Format time display (convert seconds to hh:mm:ss)
  const formatTime = (seconds) => {
    if (!seconds) return '--:--:--';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Add a timer effect for tracking elapsed time
  useEffect(() => {
    let timer;
    if (isModelTraining && trainingStartTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - trainingStartTime) / 1000);
        setElapsedTime(elapsed);
        
        // Calculate remaining time based on progress and elapsed time
        if (trainingProgress > 5) {
          const estimatedTotal = (elapsed / trainingProgress) * 100;
          setEstimatedTotalTime(estimatedTotal);
          setRemainingTime(Math.max(0, estimatedTotal - elapsed));
        }
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [isModelTraining, trainingStartTime, trainingProgress]);

  // Load ML resources on component mount
  useEffect(() => {
    checkModelsStatus();
    fetchDatasets();
    fetchModels();
    checkModelTrainingStatus();
    
    const trainingStatusInterval = setInterval(checkModelTrainingStatus, 10000); // Check every 10 seconds
    return () => clearInterval(trainingStatusInterval);
  }, []);

  // Poll task status when a task is running
  useEffect(() => {
    let statusInterval;
    if (currentTaskId) {
      statusInterval = setInterval(checkTaskStatus, 5000); // Check every 5 seconds
    }
    
    let trainingStatusInterval;
    if (openTrainingModal) {
      trainingStatusInterval = setInterval(checkModelTrainingStatus, 3000); // Check more frequently when modal is open
    }
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(trainingStatusInterval);
    };
  }, [currentTaskId, openTrainingModal]);

  const fetchDatasets = async () => {
    setIsLoadingDatasets(true);
    try {
      const response = await AnalysisService.getAllDatasets();
      setDatasets(response.data);
    } catch (err) {
      console.error("Error loading datasets:", err);
      setDatasets([]);
      showNotification("Failed to load datasets. Analysis service might be unavailable.", "error");
    } finally {
      setIsLoadingDatasets(false);
    }
  };

  const fetchModels = async () => {
    setIsLoadingModels(true);
    try {
      const response = await AnalysisService.getAllModels();
      setModels(response.data);
    } catch (err) {
      console.error("Error loading models:", err);
      setModels([]);
      showNotification("Failed to load models. Analysis service might be unavailable.", "error");
    } finally {
      setIsLoadingModels(false);
    }
  };

  const checkModelsStatus = async () => {
    setIsModelChecking(true);
    try {
      const response = await AnalysisService.checkModelsStatus();
      setModelsAvailable(response.data.models_available);
      if (response.data.models_available) {
        showNotification("Analysis models are available and ready to use", "success");
      } else {
        showNotification("ML models are not available. Please initialize them using the buttons below.", "warning");
      }
    } catch (err) {
      console.error("Error checking models status:", err);
      setModelsAvailable(false);
      const errorMessage = err?.response?.data?.message || 
                         err?.message || 
                         "Analysis service is not available";
      showNotification(`Cannot connect to analysis service: ${errorMessage}`, "error");
    } finally {
      setIsModelChecking(false);
    }
  };

  const handleInitializeModels = async () => {
    setIsModelTraining(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await AnalysisService.fetchAndTrainModels(undefined, dataLimit);
      setCurrentTaskId(response.data.task_id);
      setSuccess(`Model initialization started with ${dataLimit > 0 ? dataLimit + ' samples' : 'all data'}. Task ID: ${response.data.task_id}`);
      showNotification(`Model training started with ${dataLimit > 0 ? dataLimit + ' samples' : 'all data'}. This process may take some time.`, "info");
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to start model initialization";
      setError(errorMessage);
      showNotification(`Error initializing models: ${errorMessage}`, "error");
      console.error("Error initializing models:", err);
    } finally {
      setIsModelTraining(false);
    }
  };

  const handleFetchDatasets = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await AnalysisService.fetchKaggleDatasets();
      setCurrentTaskId(response.data.task_id);
      setSuccess(`Dataset download started. Task ID: ${response.data.task_id}`);
      showNotification("Dataset download started.", "info");
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to start dataset download";
      setError(errorMessage);
      console.error("Error fetching datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModel = async () => {
    if (selectedDatasetIds.length === 0) {
      setError("Please select at least one dataset");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await AnalysisService.trainModel({
        dataset_ids: selectedDatasetIds,
        model_type: selectedModelType,
        data_limit: dataLimit > 0 ? dataLimit : null
      });
      setCurrentTaskId(response.data.task_id);
      setSuccess(`Model training started with ${dataLimit > 0 ? dataLimit + ' samples' : 'all data'}. Task ID: ${response.data.task_id}`);
      showNotification(`Model training started with ${dataLimit > 0 ? dataLimit + ' samples' : 'all data'}.`, "info");
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to start model training";
      setError(errorMessage);
      console.error("Error training model:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateModel = async (modelId) => {
    try {
      await AnalysisService.activateModel(modelId);
      showNotification("Model activated successfully", "success");
      fetchModels(); // Refresh the models list
    } catch (err) {
      console.error("Error activating model:", err);
      showNotification(
        err?.response?.data?.message || 
        err?.message || 
        "Failed to activate model. Analysis service might be unavailable.",
        "error"
      );
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
          showNotification("Task completed successfully!", "success");
          
          // Refresh data based on task type
          if (response.data.result?.dataset_download) {
            fetchDatasets();
          }
          if (response.data.result?.model_training) {
            fetchModels();
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
      // Si l'erreur persiste trop longtemps, arrêter de vérifier
      if (err.message.includes('Network Error') || err.message.includes('Connection Refused')) {
        setError("Cannot connect to analysis service. Please check if the service is running.");
        setCurrentTaskId(null);
      }
    }
  };

  const handleSave = () => {
    // Logique de sauvegarde
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleDatasetSelectionChange = (datasetId) => {
    setSelectedDatasetIds(prev => {
      if (prev.includes(datasetId)) {
        return prev.filter(id => id !== datasetId);
      } else {
        return [...prev, datasetId];
      }
    });
  };

  const checkModelTrainingStatus = async () => {
    try {
      // Désactivé temporairement - endpoint non disponible
      // Sera activé après reconstruction du service
      /*
      const response = await AnalysisService.checkTrainingStatus();
      if (response.data && response.data.is_training) {
        setIsModelTraining(true);
        setTrainingProgress(response.data.progress || 0);
        if (response.data.task_id && !currentTaskId) {
          setCurrentTaskId(response.data.task_id);
        }
      } else {
        setIsModelTraining(false);
        setTrainingProgress(0);
      }
      */
      
      // Solution temporaire: vérifier l'état via l'API task_status si un ID de tâche existe
      if (currentTaskId) {
        const response = await AnalysisService.checkTaskStatus(currentTaskId);
        if (response.data && response.data.status === 'STARTED') {
          // If training just started, record the start time
          if (!isModelTraining || !trainingStartTime) {
            setTrainingStartTime(Date.now());
          }
          
          setIsModelTraining(true);
          
          // Calculate estimated total time based on dataset size and model type
          const dataset_size = response.data.result?.dataset_size || 1000;
          const model_type = response.data.result?.model_type || 'MBTI';
          if (!estimatedTotalTime) {
            // Rough estimation: ~10 seconds per 100 samples for MBTI, 15 seconds for OCEAN
            const samplesPerSecond = model_type === 'MBTI' ? 10 : 7.5;
            const estimatedSeconds = Math.max(300, (dataset_size / samplesPerSecond));
            setEstimatedTotalTime(estimatedSeconds);
          }
          
          // Estimation simple basée sur le temps écoulé
          const startTime = new Date(response.data.date_created || Date.now());
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          const estimatedProgress = Math.min(Math.floor(elapsedSeconds / 6), 95); // Environ 10 minutes pour 100%
          setTrainingProgress(estimatedProgress);
        } else if (response.data && response.data.status === 'SUCCESS') {
          setIsModelTraining(false);
          setTrainingProgress(100);
          setRemainingTime(0);
        } else {
          setIsModelTraining(false);
          setTrainingProgress(0);
        }
      }
    } catch (err) {
      // Ignorer les erreurs 404 spécifiques à l'endpoint training_status
      if (err.response && err.response.status === 404 && 
          err.response.config.url.includes('training_status')) {
        console.log("Training status endpoint not yet available");
      } else {
        console.error("Error checking model training status:", err);
      }
    }
  };

  const openTrainingStatusModal = () => {
    setOpenTrainingModal(true);
    checkModelTrainingStatus();
  };

  const closeTrainingStatusModal = () => {
    setOpenTrainingModal(false);
  };

  // Training Status Dialog
  const renderTrainingStatusDialog = () => {
    return (
      <Dialog 
        open={openTrainingModal} 
        onClose={closeTrainingStatusModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Model Training Status
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status: {isModelTraining ? "Training in Progress" : "No Active Training"}
            </Typography>
            
            {isModelTraining ? (
              <>
                <Box sx={{ mt: 4, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle1">
                      Progress: {trainingProgress}%
                    </Typography>
                    <Typography variant="subtitle1">
                      ETA: {formatTime(remainingTime)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant={trainingProgress > 0 ? "determinate" : "indeterminate"} 
                    value={trainingProgress} 
                    sx={{ height: 15, borderRadius: 5, mb: 1 }}
                    color="primary"
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'text.secondary' }}>
                    <span>Elapsed: {formatTime(elapsedTime)}</span>
                    <span>Est. Total: {formatTime(estimatedTotalTime)}</span>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1">
                    <strong>Task ID:</strong> {currentTaskId || "Unknown"}
                  </Typography>
                  {taskStatus && (
                    <>
                      <Typography variant="body1">
                        <strong>Status:</strong> {taskStatus.status}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Started:</strong> {taskStatus.date_done ? new Date(taskStatus.date_done).toLocaleString() : "In progress"}
                      </Typography>
                      {taskStatus.result && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Result:</Typography>
                          <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {JSON.stringify(taskStatus.result, null, 2)}
                            </pre>
                          </Paper>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
                
                <Alert severity="info" sx={{ mt: 4 }}>
                  Model training can take several minutes. This modal will update automatically to show progress.
                </Alert>
              </>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                No active model training. You can start a training process from the ML Models tab.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={checkModelTrainingStatus} color="primary" startIcon={<RefreshIcon />}>
            Refresh Status
          </Button>
          <Button onClick={closeTrainingStatusModal}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          System Settings
        </Typography>
        <Button
          variant="contained"
          color={isModelTraining ? "primary" : "inherit"}
          startIcon={<VisibilityIcon />}
          onClick={openTrainingStatusModal}
          sx={{ 
            position: 'relative',
            overflow: 'hidden',
            ...(isModelTraining && {
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: `${trainingProgress}%`,
                height: '4px',
                backgroundColor: 'success.main',
                transition: 'width 0.5s ease-in-out'
              }
            })
          }}
        >
          {isModelTraining ? 
            `Training: ${trainingProgress}% (${formatTime(remainingTime)} left)` : 
            "View Model Training Status"
          }
        </Button>
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab icon={<SettingsIcon />} label="General Settings" />
        <Tab icon={<StorageIcon />} label="ML Datasets" />
        <Tab icon={<ScienceIcon />} label="ML Models" />
      </Tabs>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully
        </Alert>
      )}

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

      {/* General Settings Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Email Configuration
                </Typography>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtpHost: e.target.value
                  })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="SMTP Port"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtpPort: e.target.value
                  })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="SMTP User"
                  value={settings.smtpUser}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtpUser: e.target.value
                  })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email From Name"
                  value={settings.emailFromName}
                  onChange={(e) => setSettings({
                    ...settings,
                    emailFromName: e.target.value
                  })}
                  margin="normal"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                <TextField
                  fullWidth
                  label="Max Login Attempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxLoginAttempts: e.target.value
                  })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Password Expiration (days)"
                  type="number"
                  value={settings.passwordExpiration}
                  onChange={(e) => setSettings({
                    ...settings,
                    passwordExpiration: e.target.value
                  })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    sessionTimeout: e.target.value
                  })}
                  margin="normal"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.requireMFA}
                      onChange={(e) => setSettings({
                        ...settings,
                        requireMFA: e.target.checked
                      })}
                    />
                  }
                  label="Require MFA"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Settings
                </Typography>
                <Typography gutterBottom>
                  Max Concurrent Analyses
                </Typography>
                <Slider
                  value={settings.maxConcurrentAnalyses}
                  min={1}
                  max={20}
                  onChange={(e, value) => setSettings({
                    ...settings,
                    maxConcurrentAnalyses: value
                  })}
                  marks
                  valueLabelDisplay="auto"
                />
                <TextField
                  fullWidth
                  label="Cache Timeout (seconds)"
                  type="number"
                  value={settings.cacheTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    cacheTimeout: e.target.value
                  })}
                  margin="normal"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.debugMode}
                      onChange={(e) => setSettings({
                        ...settings,
                        debugMode: e.target.checked
                      })}
                    />
                  }
                  label="Debug Mode"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableEmailNotifications}
                      onChange={(e) => setSettings({
                        ...settings,
                        enableEmailNotifications: e.target.checked
                      })}
                    />
                  }
                  label="Enable Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enablePushNotifications}
                      onChange={(e) => setSettings({
                        ...settings,
                        enablePushNotifications: e.target.checked
                      })}
                    />
                  }
                  label="Enable Push Notifications"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Notification Frequency</InputLabel>
                  <Select
                    value={settings.notificationFrequency}
                    onChange={(e) => setSettings({
                      ...settings,
                      notificationFrequency: e.target.value
                    })}
                  >
                    <MenuItem value="realtime">Real-time</MenuItem>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSave}>
                Save Settings
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* ML Datasets Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Machine Learning Datasets
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={loading ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                    onClick={handleFetchDatasets}
                    disabled={loading}
                  >
                    Download New Datasets
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                {isLoadingDatasets ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : modelsAvailable === false && datasets.length === 0 ? (
                  <Alert severity="warning" sx={{ my: 3 }}>
                    <Typography variant="body1">
                      Cannot connect to analysis service. Please make sure the service is running.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={checkModelsStatus}
                      sx={{ mt: 1 }}
                    >
                      Retry Connection
                    </Button>
                  </Alert>
                ) : datasets.length > 0 ? (
                  <List>
                    {datasets.map((dataset) => (
                      <Paper key={dataset.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                        <ListItem>
                          <ListItemIcon>
                            <DataObjectIcon color={dataset.type === 'MBTI' ? 'primary' : 'secondary'} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={dataset.name} 
                            secondary={
                              <React.Fragment>
                                <Typography variant="body2" component="span">
                                  Type: {dataset.type} | Source: {dataset.source}
                                </Typography>
                                <br />
                                <Typography variant="body2" component="span">
                                  Downloaded: {new Date(dataset.download_date).toLocaleDateString()}
                                </Typography>
                              </React.Fragment>
                            } 
                          />
                          <Chip 
                            label={dataset.type} 
                            color={dataset.type === 'MBTI' ? 'primary' : 'secondary'} 
                            size="small" 
                            sx={{ ml: 1 }} 
                          />
                        </ListItem>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
                    No datasets available. Click "Download New Datasets" to fetch datasets from Kaggle.
                  </Typography>
                )}
                
                {renderTaskStatus()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ML Models Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Machine Learning Models
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isModelChecking ? (
                      <CircularProgress size={24} sx={{ mr: 2 }} />
                    ) : (
                      <Chip
                        label={modelsAvailable === null 
                          ? "Service Status Unknown" 
                          : modelsAvailable 
                            ? "Models & Service Available" 
                            : "Service Unavailable or Models Not Trained"}
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
                      disabled={isModelChecking}
                      startIcon={<BuildCircleIcon />}
                      size="small"
                      sx={{ mr: 1 }}
                      color={modelsAvailable ? "success" : "primary"}
                    >
                      Check Status
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleInitializeModels}
                      disabled={isModelTraining}
                      startIcon={isModelTraining ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                      color={modelsAvailable ? "primary" : "warning"}
                    >
                      {modelsAvailable ? "Retrain Models" : "Initialize Models"}
                    </Button>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                {isModelTraining && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Training Progress: {trainingProgress}%
                    </Typography>
                    <LinearProgress 
                      variant={trainingProgress > 0 ? "determinate" : "indeterminate"} 
                      value={trainingProgress} 
                      sx={{ height: 10, borderRadius: 5, mb: 2 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      This process may take several minutes. You can continue using the platform while models are being trained.
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Training Configuration
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Data Samples Limit"
                        type="number"
                        value={dataLimit}
                        onChange={(e) => setDataLimit(parseInt(e.target.value) || 0)}
                        helperText={dataLimit > 0 ? `Use only ${dataLimit} samples (faster training)` : "Use all available data (0 = no limit)"}
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                          {dataLimit === 0 ? 
                            "Using all available data (slower but more accurate)" : 
                            `Using ${dataLimit} samples (faster but less accurate)`
                          }
                        </Typography>
                        <Slider
                          value={dataLimit}
                          onChange={(e, newValue) => setDataLimit(newValue)}
                          min={0}
                          max={1000}
                          step={100}
                          marks={[
                            { value: 0, label: 'All' },
                            { value: 100, label: '100' },
                            { value: 500, label: '500' },
                            { value: 1000, label: '1000' }
                          ]}
                          sx={{ maxWidth: 300 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  Train Specific Model
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Model Type</InputLabel>
                      <Select
                        value={selectedModelType}
                        onChange={(e) => setSelectedModelType(e.target.value)}
                        label="Model Type"
                      >
                        <MenuItem value="MBTI">MBTI</MenuItem>
                        <MenuItem value="OCEAN">OCEAN</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Button 
                      variant="contained" 
                      onClick={handleTrainModel}
                      disabled={loading || datasets.length === 0}
                      startIcon={loading ? <CircularProgress size={20} /> : <ScienceIcon />}
                    >
                      Train Model
                    </Button>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle1" gutterBottom>
                  Select Datasets for Training:
                </Typography>
                {isLoadingDatasets ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List>
                    {datasets
                      .filter(dataset => dataset.type === selectedModelType)
                      .map((dataset) => (
                        <ListItem key={dataset.id} sx={{ py: 0 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={selectedDatasetIds.includes(dataset.id)}
                                onChange={() => handleDatasetSelectionChange(dataset.id)}
                              />
                            }
                            label={dataset.name}
                          />
                        </ListItem>
                      ))}
                  </List>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Available Models
                </Typography>
                {isLoadingModels ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : modelsAvailable === false && models.length === 0 ? (
                  <Alert severity="warning" sx={{ my: 3 }}>
                    <Typography variant="body1">
                      Cannot connect to analysis service. Please make sure the service is running.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={checkModelsStatus}
                      sx={{ mt: 1 }}
                    >
                      Retry Connection
                    </Button>
                  </Alert>
                ) : models.length > 0 ? (
                  <List>
                    {models.map((model) => (
                      <Paper key={model.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                        <ListItem>
                          <ListItemIcon>
                            <BubbleChartIcon color={model.model_type === 'MBTI' ? 'primary' : 'secondary'} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`${model.name} (v${model.version})`} 
                            secondary={
                              <React.Fragment>
                                <Typography variant="body2" component="span">
                                  Type: {model.model_type} | Trained: {new Date(model.training_date).toLocaleDateString()}
                                </Typography>
                                <br />
                                <Typography variant="body2" component="span">
                                  Metrics: {JSON.stringify(model.metrics)}
                                </Typography>
                              </React.Fragment>
                            } 
                          />
                          <Chip 
                            label={model.is_active ? "Active" : "Inactive"} 
                            color={model.is_active ? "success" : "default"} 
                            size="small" 
                            sx={{ ml: 1 }} 
                          />
                          {!model.is_active && (
                            <Button 
                              variant="outlined" 
                              size="small" 
                              sx={{ ml: 1 }}
                              onClick={() => handleActivateModel(model.id)}
                            >
                              Activate
                            </Button>
                          )}
                        </ListItem>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
                    No models available. Train models using the options above.
                  </Typography>
                )}
                
                {renderTaskStatus()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Training Status Dialog */}
      {renderTrainingStatusDialog()}
    </Box>
  );
};

export default SystemSettings; 