import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Typography,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import authService from '../../services/auth.service';

const ROLES = {
  USER_ROLE: { label: 'User', color: 'default' },
  ANALYST_ROLE: { label: 'Analyst', color: 'info' },
  ADMIN_ROLE: { label: 'Admin', color: 'warning' },
  SUPER_USER_ROLE: { label: 'Super User', color: 'error' }
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    try {
      const response = await authService.getAllUsers();
      setUsers(response);
    } catch (err) {
      setError('Failed to load users');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authService.updateUserRole(userId, newRole);
      setSuccess('Role updated successfully');
      loadUsers();
    } catch (err) {
      setError('Failed to update role');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        User Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={ROLES[role]?.label || role}
                      color={ROLES[role]?.color || 'default'}
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                    <Select
                      value=""
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Add Role</MenuItem>
                      {Object.entries(ROLES).map(([role, { label }]) => (
                        <MenuItem 
                          key={role} 
                          value={role}
                          disabled={user.roles.includes(role)}
                        >
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton 
                    color="error"
                    onClick={() => {/* Implement delete user */}}
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
  );
};

export default UserManagement; 