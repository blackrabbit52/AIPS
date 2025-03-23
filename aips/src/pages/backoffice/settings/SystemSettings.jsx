import React, { useState } from 'react';
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
  Slider
} from '@mui/material';

const SystemSettings = () => {
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

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Logique de sauvegarde
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        System Settings
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully
        </Alert>
      )}

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
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default SystemSettings; 