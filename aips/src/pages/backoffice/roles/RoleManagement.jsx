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
  Snackbar
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
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  const loadRoles = async () => {
    try {
      const rolesData = await authService.getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      showNotification('Error loading roles', 'error');
      console.error('Error loading roles:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await authService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      showNotification('Error loading users', 'error');
      console.error('Error loading users:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateRole = async () => {
    try {
      await authService.createRole(roleFormData);
      setDialogOpen(false);
      loadRoles();
      showNotification('Role created successfully', 'success');
      clearRoleForm();
    } catch (error) {
      showNotification('Error creating role', 'error');
      console.error('Error creating role:', error);
    }
  };

  const handleUpdateRole = async () => {
    try {
      await authService.updateRole(selectedRole.id, roleFormData);
      setDialogOpen(false);
      loadRoles();
      showNotification('Role updated successfully', 'success');
      clearRoleForm();
      setSelectedRole(null);
    } catch (error) {
      showNotification('Error updating role', 'error');
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await authService.deleteRole(roleId);
        loadRoles();
        showNotification('Role deleted successfully', 'success');
      } catch (error) {
        showNotification('Error deleting role', 'error');
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleUpdateUserRole = async () => {
    try {
      await authService.updateUserRole(selectedUser.id, newRole);
      setUserRoleDialogOpen(false);
      loadUsers();
      showNotification('User role updated successfully', 'success');
    } catch (error) {
      showNotification('Error updating user role', 'error');
      console.error('Error updating user role:', error);
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
      description: role.description || ''
    });
    setDialogOpen(true);
  };

  const openUserRoleDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.roles[0] || "ROLE_USER");
    setUserRoleDialogOpen(true);
  };

  const clearRoleForm = () => {
    setRoleFormData({
      name: '',
      description: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setRoleFormData(prev => ({
      ...prev,
      [name]: value
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
                  onClick={loadRoles}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Number of Users</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>{role.users?.length || 0}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => openEditDialog(role)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteRole(role.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {roles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No roles found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 1 && (
          <Box p={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Users and Their Roles</Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadUsers}
              >
                Refresh
              </Button>
            </Box>

            <Grid container spacing={3}>
              {users.map((user) => (
                <Grid item xs={12} md={6} lg={4} key={user.id}>
                  <Card>
                    <CardHeader
                      title={`${user.firstName} ${user.lastName}`}
                      subheader={user.email}
                    />
                    <CardContent>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Roles:
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role, index) => (
                            <Chip 
                              key={index} 
                              label={role} 
                              color={
                                role === "ROLE_ADMIN" 
                                  ? "primary" 
                                  : role === "ROLE_SUPER_ADMIN" 
                                    ? "secondary" 
                                    : "default"
                              }
                              sx={{ mr: 1, mb: 1 }} 
                            />
                          ))
                        ) : (
                          <Chip label="No roles" variant="outlined" />
                        )}
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => openUserRoleDialog(user)}
                      >
                        Edit Roles
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {users.length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No users found
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Dialog for creating/editing roles */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {selectedRole ? "Edit Role" : "Create New Role"}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={selectedRole ? handleUpdateRole : handleCreateRole} 
            color="primary"
          >
            {selectedRole ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for updating user roles */}
      <Dialog open={userRoleDialogOpen} onClose={() => setUserRoleDialogOpen(false)}>
        <DialogTitle>
          Edit User Role
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {`${selectedUser.firstName} ${selectedUser.lastName}`}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {selectedUser.email}
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newRole}
                  onChange={handleRoleChange}
                  label="Role"
                >
                  <MenuItem value="ROLE_USER">User</MenuItem>
                  <MenuItem value="ROLE_ADMIN">Administrator</MenuItem>
                  <MenuItem value="ROLE_SUPER_ADMIN">Super Administrator</MenuItem>
                  <MenuItem value="ROLE_ANALYST">Analyst</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUserRole} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoleManagement; 