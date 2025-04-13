import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  LinearProgress,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import AnalysisService from '../../../services/analysis.service';
import { useNotification } from '../../../contexts/NotificationContext';
import { useError } from '../../../contexts/ErrorContext';

// Helper function to safely convert any value to string
const safeToString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '[Object]';
    }
  }
  return String(value);
};

const AnalysisTemplates = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Performance Analysis',
      description: 'Comprehensive performance evaluation template',
      type: 'performance',
      metrics: ['efficiency', 'productivity', 'quality']
    },
    // ... autres templates
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  
  // États pour la gestion des modèles
  const [loading, setLoading] = useState(false);
  const [modelsAvailable, setModelsAvailable] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [dataLimit, setDataLimit] = useState(100);
  const [totalDownloaded, setTotalDownloaded] = useState(0);
  const [selectedModels, setSelectedModels] = useState({
    MBTI: true,
    OCEAN: true
  });
  const { showNotification } = useNotification();
  const { handleError } = useError();
  
  // État pour suivre l'étape actuelle du processus
  const [activeStep, setActiveStep] = useState(0);
  
  // Définition des étapes du processus
  const steps = [
    "Downloading Datasets",
    "Processing Data",
    "Training Models",
    "Finalizing"
  ];

  // Vérifier l'état des modèles au chargement
  useEffect(() => {
    checkModelsStatus();
  }, []);

  // Vérifier l'état de la tâche en cours
  useEffect(() => {
    let statusInterval;
    if (taskId) {
      statusInterval = setInterval(checkTaskStatus, 3000); // Vérifier toutes les 3 secondes
    }
    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [taskId]);

  const checkModelsStatus = async () => {
    try {
      const response = await AnalysisService.checkModelsStatus();
      setModelsAvailable(response.data.models_available);
    } catch (err) {
      console.error("Error checking models status:", err);
      setModelsAvailable(false);
      // Use a string message rather than passing the error object directly
      const errorMessage = err?.response?.data?.message || err?.message || "Unknown error";
      handleError(errorMessage);
    }
  };

  const checkTaskStatus = async () => {
    if (!taskId) return;
    
    try {
      const response = await AnalysisService.checkTaskStatus(taskId);
      setTaskStatus(response.data);
      
      // Extraire les informations de progression
      if (response.data.result && response.data.result.progress) {
        setTaskProgress(response.data.result.progress);
      }
      
      if (response.data.result && response.data.result.total_downloaded) {
        setTotalDownloaded(response.data.result.total_downloaded);
      }
      
      // Déterminer l'étape actuelle en fonction du statut ou des messages
      if (response.data.result && response.data.result.current_step) {
        setActiveStep(response.data.result.current_step);
      } else if (response.data.status === 'PENDING') {
        setActiveStep(0); // Téléchargement des datasets
      } else if (response.data.status === 'STARTED') {
        // Essayez de déduire l'étape à partir du message ou de la progression
        if (response.data.result && response.data.result.message) {
          const message = safeToString(response.data.result.message).toLowerCase();
          if (message.includes('download')) setActiveStep(0);
          else if (message.includes('process')) setActiveStep(1);
          else if (message.includes('train')) setActiveStep(2);
          else if (response.data.progress > 90) setActiveStep(3);
        } else if (taskProgress < 30) {
          setActiveStep(0);
        } else if (taskProgress < 60) {
          setActiveStep(1);
        } else if (taskProgress < 90) {
          setActiveStep(2);
        } else {
          setActiveStep(3);
        }
      } else if (response.data.status === 'SUCCESS') {
        setActiveStep(steps.length - 1); // Dernière étape
      }
      
      // Vérifier si la tâche est terminée
      if (response.data.status === 'SUCCESS') {
        showNotification("Models trained successfully", "success");
        setTaskId(null);
        checkModelsStatus();
      } else if (response.data.status === 'FAILURE') {
        showNotification("Model training failed", "error");
        setTaskId(null);
      }
    } catch (err) {
      console.error("Error checking task status:", err);
    }
  };

  const handleTrainModels = async () => {
    // Filtrer les modèles sélectionnés
    const modelsToTrain = Object.keys(selectedModels).filter(key => selectedModels[key]);
    
    if (modelsToTrain.length === 0) {
      showNotification("Please select at least one model to train", "warning");
      return;
    }
    
    setLoading(true);
    try {
      const response = await AnalysisService.fetchAndTrainModels(
        modelsToTrain,
        dataLimit > 0 ? dataLimit : null,
        true,
        true
      );
      setTaskId(response.data.task_id);
      showNotification(`Model download and training started (Limit: ${dataLimit} samples)`, "success");
    } catch (err) {
      console.error("Training error:", err);
      // Extract error message safely
      const errorMessage = err?.response?.data?.message || err?.message || "Error starting training process";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelectionChange = (model) => {
    setSelectedModels(prev => ({
      ...prev,
      [model]: !prev[model]
    }));
  };

  const handleSave = (template) => {
    // Logique de sauvegarde
    setOpenDialog(false);
  };

  // Safely render task message
  const renderTaskMessage = () => {
    if (!taskStatus || !taskStatus.result || !taskStatus.result.message) {
      return '';
    }
    
    return ` - ${safeToString(taskStatus.result.message)}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Analysis Templates</Typography>
        <Button 
          variant="contained" 
          onClick={() => {
            setCurrentTemplate(null);
            setOpenDialog(true);
          }}
        >
          Create Template
        </Button>
      </Box>
      
      {/* Section Gestion des Modèles */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Analysis Models Management</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Status
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    color={modelsAvailable ? "success" : "error"}
                    label={modelsAvailable ? "Models Available" : "Models Not Available"}
                    sx={{ mr: 1 }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={checkModelsStatus}
                    sx={{ ml: 1 }}
                  >
                    Check
                  </Button>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Training Configuration
                </Typography>
                
                <FormGroup sx={{ mb: 2 }}>
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        checked={selectedModels.MBTI} 
                        onChange={() => handleModelSelectionChange('MBTI')}
                      />
                    } 
                    label="MBTI Model" 
                  />
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        checked={selectedModels.OCEAN} 
                        onChange={() => handleModelSelectionChange('OCEAN')}
                      />
                    } 
                    label="OCEAN Model (Big Five)" 
                  />
                </FormGroup>
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Sample Limit"
                    type="number"
                    value={dataLimit}
                    onChange={(e) => setDataLimit(parseInt(e.target.value) || 100)}
                    helperText="Maximum number of samples to use for training"
                    InputProps={{ inputProps: { min: 10 } }}
                    sx={{ mb: 2 }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleTrainModels}
                    disabled={loading || taskId !== null}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} /> : "Download and Train Models"}
                  </Button>
                </Box>
                
                {taskId && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Progress: {taskProgress}% 
                      {totalDownloaded > 0 && ` (${totalDownloaded} samples${dataLimit ? ` of ${dataLimit} max` : ''} loaded)`}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={taskProgress} 
                      sx={{ height: 10, borderRadius: 1, mb: 3 }}
                    />
                    
                    {/* Stepper pour visualiser les étapes */}
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
                      {steps.map((label) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Current Task: {safeToString(taskStatus?.status) || "Pending"}
                      {renderTaskMessage()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Information</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Model training downloads datasets from Kaggle and trains the models.
                </Alert>
                
                <Typography variant="body2" paragraph>
                  <strong>Sample Limit:</strong> Using a sample limit reduces training time and resources needed. The system will:
                </Typography>
                <ul>
                  <li><Typography variant="body2">Check if files already exist before downloading</Typography></li>
                  <li><Typography variant="body2">Limit the number of samples to the specified amount</Typography></li>
                  <li><Typography variant="body2">Handle special file formats (including IPIP-FFM-data-8Nov2018 for OCEAN)</Typography></li>
                </ul>
                
                <Typography variant="body2" paragraph>
                  <strong>Available Models:</strong>
                </Typography>
                <ul>
                  <li><Typography variant="body2">MBTI: Myers-Briggs Type Indicator personality classification</Typography></li>
                  <li><Typography variant="body2">OCEAN (Big Five): Evaluation of Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism personality traits</Typography></li>
                </ul>
                
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Once trained, the models will be available for text and social media analysis.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" sx={{ mb: 3 }}>Analysis Templates</Typography>
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} key={template.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{template.name}</Typography>
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {template.metrics.map((metric) => (
                    <Chip 
                      key={metric} 
                      label={metric} 
                      sx={{ mr: 1 }} 
                    />
                  ))}
                </Box>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setCurrentTemplate(template);
                    setOpenDialog(true);
                  }}
                >
                  Edit
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TemplateDialog 
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        template={currentTemplate}
        onSave={handleSave}
      />
    </Box>
  );
};

const TemplateDialog = ({ open, onClose, template, onSave }) => {
  // ... logique du dialogue
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Edit Template' : 'Create Template'}
      </DialogTitle>
      <DialogContent>
        {/* Formulaire du template */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(template)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnalysisTemplates; 