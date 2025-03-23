import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const FooterSettings = () => {
  const [settings, setSettings] = useState({
    companyInfo: {
      name: 'AIPS Platform',
      description: 'AI-Powered HR Analytics Platform',
      address: '123 Tech Street',
      email: 'contact@aips.com',
      phone: '+1 234 567 890'
    },
    socialLinks: [
      { id: 1, platform: 'LinkedIn', url: 'https://linkedin.com/aips' },
      { id: 2, platform: 'Twitter', url: 'https://twitter.com/aips' }
    ],
    quickLinks: [
      { id: 1, label: 'About Us', url: '/about', visible: true },
      { id: 2, label: 'Contact', url: '/contact', visible: true }
    ],
    legalLinks: [
      { id: 1, label: 'Privacy Policy', url: '/privacy', required: true },
      { id: 2, label: 'Terms of Service', url: '/terms', required: true }
    ]
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Footer Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Company Information
              </Typography>
              <TextField
                fullWidth
                label="Company Name"
                value={settings.companyInfo.name}
                onChange={(e) => setSettings({
                  ...settings,
                  companyInfo: {
                    ...settings.companyInfo,
                    name: e.target.value
                  }
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={settings.companyInfo.description}
                onChange={(e) => setSettings({
                  ...settings,
                  companyInfo: {
                    ...settings.companyInfo,
                    description: e.target.value
                  }
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Address"
                value={settings.companyInfo.address}
                onChange={(e) => setSettings({
                  ...settings,
                  companyInfo: {
                    ...settings.companyInfo,
                    address: e.target.value
                  }
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                value={settings.companyInfo.email}
                onChange={(e) => setSettings({
                  ...settings,
                  companyInfo: {
                    ...settings.companyInfo,
                    email: e.target.value
                  }
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Phone"
                value={settings.companyInfo.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  companyInfo: {
                    ...settings.companyInfo,
                    phone: e.target.value
                  }
                })}
                margin="normal"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Social Links
                </Typography>
                <Button 
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setDialogType('social');
                    setCurrentItem(null);
                    setOpenDialog(true);
                  }}
                >
                  Add Social Link
                </Button>
              </Box>
              <List>
                {settings.socialLinks.map((link) => (
                  <ListItem key={link.id}>
                    <ListItemText 
                      primary={link.platform}
                      secondary={link.url}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => {
                        setDialogType('social');
                        setCurrentItem(link);
                        setOpenDialog(true);
                      }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Quick Links
                </Typography>
                <Button 
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setDialogType('quick');
                    setCurrentItem(null);
                    setOpenDialog(true);
                  }}
                >
                  Add Quick Link
                </Button>
              </Box>
              <List>
                {settings.quickLinks.map((link) => (
                  <ListItem key={link.id}>
                    <ListItemText 
                      primary={link.label}
                      secondary={link.url}
                    />
                    <ListItemSecondaryAction>
                      <Switch 
                        checked={link.visible}
                        onChange={() => {
                          const newLinks = settings.quickLinks.map(l => 
                            l.id === link.id ? {...l, visible: !l.visible} : l
                          );
                          setSettings({...settings, quickLinks: newLinks});
                        }}
                      />
                      <IconButton onClick={() => {
                        setDialogType('quick');
                        setCurrentItem(link);
                        setOpenDialog(true);
                      }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          Save Footer Settings
        </Button>
      </Box>

      <FooterLinkDialog 
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        type={dialogType}
        item={currentItem}
      />
    </Box>
  );
};

const FooterLinkDialog = ({ open, onClose, type, item }) => {
  const [formData, setFormData] = useState(item || {
    platform: '',
    label: '',
    url: '',
    visible: true
  });

  const title = type === 'social' ? 'Social Link' : 'Quick Link';
  const isEdit = !!item;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {isEdit ? `Edit ${title}` : `Add ${title}`}
      </DialogTitle>
      <DialogContent>
        {type === 'social' ? (
          <TextField
            fullWidth
            label="Platform"
            value={formData.platform}
            onChange={(e) => setFormData({...formData, platform: e.target.value})}
            margin="normal"
          />
        ) : (
          <TextField
            fullWidth
            label="Label"
            value={formData.label}
            onChange={(e) => setFormData({...formData, label: e.target.value})}
            margin="normal"
          />
        )}
        <TextField
          fullWidth
          label="URL"
          value={formData.url}
          onChange={(e) => setFormData({...formData, url: e.target.value})}
          margin="normal"
        />
        {type === 'quick' && (
          <FormControlLabel
            control={
              <Switch
                checked={formData.visible}
                onChange={(e) => setFormData({
                  ...formData,
                  visible: e.target.checked
                })}
              />
            }
            label="Visible"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => {
          // Logique de sauvegarde
          onClose();
        }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FooterSettings; 