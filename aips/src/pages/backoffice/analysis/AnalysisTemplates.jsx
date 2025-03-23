import React, { useState } from 'react';
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
  Chip
} from '@mui/material';

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

  const handleSave = (template) => {
    // Logique de sauvegarde
    setOpenDialog(false);
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