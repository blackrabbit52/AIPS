import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const NavigationSettings = () => {
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      label: 'Home',
      path: '/',
      visible: true,
      requireAuth: false
    },
    {
      id: 2,
      label: 'Analysis',
      path: '/analysis',
      visible: true,
      requireAuth: true
    }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Navigation Settings</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => {
            setCurrentItem(null);
            setOpenDialog(true);
          }}
        >
          Add Menu Item
        </Button>
      </Box>

      <Card>
        <CardContent>
          <List>
            {menuItems.map((item, index) => (
              <ListItem
                key={item.id}
                sx={{ 
                  border: '1px solid #eee',
                  mb: 1,
                  borderRadius: 1
                }}
              >
                <ListItemIcon>
                  <DragIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  secondary={item.path}
                />
                <ListItemSecondaryAction>
                  <Switch 
                    checked={item.visible}
                    onChange={() => {
                      const newItems = [...menuItems];
                      newItems[index].visible = !newItems[index].visible;
                      setMenuItems(newItems);
                    }}
                  />
                  <IconButton 
                    onClick={() => {
                      setCurrentItem(item);
                      setOpenDialog(true);
                    }}
                  >
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

      <MenuItemDialog 
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        item={currentItem}
      />
    </Box>
  );
};

const MenuItemDialog = ({ open, onClose, item }) => {
  const [formData, setFormData] = useState(item || {
    label: '',
    path: '',
    visible: true,
    requireAuth: false
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {item ? 'Edit Menu Item' : 'Add Menu Item'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Label"
          value={formData.label}
          onChange={(e) => setFormData({...formData, label: e.target.value})}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Path"
          value={formData.path}
          onChange={(e) => setFormData({...formData, path: e.target.value})}
          margin="normal"
        />
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
        <FormControlLabel
          control={
            <Switch
              checked={formData.requireAuth}
              onChange={(e) => setFormData({
                ...formData, 
                requireAuth: e.target.checked
              })}
            />
          }
          label="Require Authentication"
        />
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

export default NavigationSettings; 