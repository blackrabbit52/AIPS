import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import authService from '../../../services/auth.service';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading roles and users...');
      const [rolesData, usersData] = await Promise.all([
        authService.getAllRoles(),
        authService.getAllUsers()
      ]);
      console.log('Roles loaded:', rolesData);
      console.log('Users loaded:', usersData);
      setRoles(rolesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateRole = async () => {
    try {
      await authService.createRole(roleFormData);
      setDialogOpen(false);
      loadData();
      showNotification('Role created successfully', 'success');
      clearRoleForm();
    } catch (error) {
      showNotification('Error creating role', 'error');
    }
  };

  const handleUpdateRole = async () => {
    try {
      await authService.updateRole(selectedRole.id, roleFormData);
      setDialogOpen(false);
      loadData();
      showNotification('Role updated successfully', 'success');
      clearRoleForm();
      setSelectedRole(null);
    } catch (error) {
      showNotification('Error updating role', 'error');
    }
  };

  const handleDeleteRole = async () => {
    try {
      await authService.deleteRole(selectedRole.id);
      setDeleteDialogOpen(false);
      loadData();
      showNotification('Role deleted successfully', 'success');
      setSelectedRole(null);
    } catch (error) {
      showNotification('Error deleting role', 'error');
    }
  };

  const handleUpdateUserRole = async () => {
    try {
      await authService.assignRoleToUser(selectedUser.id, newRole);
      setUserRoleDialogOpen(false);
      loadData();
      showNotification('User role updated successfully', 'success');
    } catch (error) {
      showNotification('Error updating user role', 'error');
    }
  };

  const openCreateDialog = () => {
    clearRoleForm();
    setSelectedRole(null);
    setDialogOpen(true);
  };

  const openEditDialog = (role) => {
    setSelectedRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const openUserRoleDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.roles[0]?.id || "");
    setUserRoleDialogOpen(true);
  };

  const clearRoleForm = () => {
    setRoleFormData({
      name: '',
      description: '',
      permissions: []
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setRoleFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (e) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: e.target.value
    }));
  };

  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Roles and Permissions Management
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Roles" />
          <Tab label="Users and Roles" />
        </Tabs>

        {activeTab === 0 && (
          <Box p={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Roles List</Typography>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                  sx={{ mr: 1 }}
                >
                  Add Role
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadData}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        {role.permissions?.map((permission) => (
                          <Chip
                            key={permission}
                            label={permission}
                            size="small"
                            sx={{ mr: 0.5 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => openEditDialog(role)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => openDeleteDialog(role)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 1 && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Users and Their Roles
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Current Roles</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.roles?.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            color="primary"
                            size="small"
                            sx={{ mr: 0.5 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => openUserRoleDialog(user)}
                        >
                          Edit Roles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Role Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {selectedRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Role Name"
            type="text"
            fullWidth
            value={roleFormData.name}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={roleFormData.description}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              value={roleFormData.permissions}
              onChange={handlePermissionChange}
              label="Permissions"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="READ">Read</MenuItem>
              <MenuItem value="WRITE">Write</MenuItem>
              <MenuItem value="DELETE">Delete</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={selectedRole ? handleUpdateRole : handleCreateRole}
            color="primary"
          >
            {selectedRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the role "{selectedRole?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteRole} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Role Dialog */}
      <Dialog open={userRoleDialogOpen} onClose={() => setUserRoleDialogOpen(false)}>
        <DialogTitle>Update User Roles</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select roles for user: {selectedUser?.username}
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={newRole}
              onChange={handleRoleChange}
              label="Roles"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUserRole} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoleManagement; 