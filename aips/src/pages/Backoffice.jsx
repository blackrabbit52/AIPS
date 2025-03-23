import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit, Delete, Visibility, Add } from '@mui/icons-material';
import authService from '../services/auth.service';
import analysisService from '../services/analysis.service';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Backoffice = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, type: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersResponse, analysesResponse] = await Promise.all([
        authService.getAllUsers(),
        analysisService.getAllAnalyses()
      ]);
      setUsers(usersResponse.data);
      setAnalyses(analysesResponse.data);
    } catch (error) {
      setError(error.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditDialog({ open: true, user });
  };

  const handleDelete = (item, type) => {
    setDeleteDialog({ open: true, item, type });
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteDialog.type === 'user') {
        await authService.deleteUser(deleteDialog.item.id);
      } else {
        await analysisService.deleteAnalysis(deleteDialog.item.id);
      }
      loadData();
      setDeleteDialog({ open: false, item: null, type: null });
    } catch (error) {
      setError(error.message || 'Error deleting item');
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editDialog.user) {
        await authService.updateUser(editDialog.user.id, userData);
      }
      loadData();
      setEditDialog({ open: false, user: null });
    } catch (error) {
      setError(error.message || 'Error saving user');
    }
  };

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
          <Typography variant="h5" component="h1">
            Admin Panel
          </Typography>
        </Box>

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Users" />
          <Tab label="Analyses" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.roles.join(', ')}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(user)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(user, 'user')}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyses.map((analysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell>{analysis.title}</TableCell>
                      <TableCell>{analysis.user.username}</TableCell>
                      <TableCell>
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => window.location.href = `/results/${analysis.id}`}>
                          <Visibility />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(analysis, 'analysis')}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
          </>
        )}
      </Paper>

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            defaultValue={editDialog.user?.username}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            defaultValue={editDialog.user?.email}
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="Role"
            defaultValue={editDialog.user?.roles[0]}
            margin="normal"
          >
            <MenuItem value="ROLE_USER">User</MenuItem>
            <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleSaveUser} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null, type: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this {deleteDialog.type}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null, type: null })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Backoffice; 