import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Alert
} from '@mui/material';

const AlgorithmSettings = () => {
  const [settings, setSettings] = useState({
    weightPerformance: 70,
    weightSkills: 60,
    weightExperience: 50,
    enableMachineLearning: true,
    enableRealTimeUpdates: true,
    confidenceThreshold: 75
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Logique de sauvegarde
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Recommendation Algorithm Settings
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weighting Factors
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Performance Weight</Typography>
                <Slider
                  value={settings.weightPerformance}
                  onChange={(e, value) => 
                    setSettings({...settings, weightPerformance: value})}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Skills Weight</Typography>
                <Slider
                  value={settings.weightSkills}
                  onChange={(e, value) => 
                    setSettings({...settings, weightSkills: value})}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Experience Weight</Typography>
                <Slider
                  value={settings.weightExperience}
                  onChange={(e, value) => 
                    setSettings({...settings, weightExperience: value})}
                  valueLabelDisplay="auto"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Algorithm Features
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableMachineLearning}
                    onChange={(e) => setSettings({
                      ...settings, 
                      enableMachineLearning: e.target.checked
                    })}
                  />
                }
                label="Enable Machine Learning"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableRealTimeUpdates}
                    onChange={(e) => setSettings({
                      ...settings, 
                      enableRealTimeUpdates: e.target.checked
                    })}
                  />
                }
                label="Enable Real-time Updates"
              />

              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>
                  Confidence Threshold
                </Typography>
                <Slider
                  value={settings.confidenceThreshold}
                  onChange={(e, value) => 
                    setSettings({...settings, confidenceThreshold: value})}
                  valueLabelDisplay="auto"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default AlgorithmSettings; 