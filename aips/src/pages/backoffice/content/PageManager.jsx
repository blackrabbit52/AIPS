import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Switch
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const PageManager = () => {
  const [pages, setPages] = useState([
    {
      id: 1,
      title: 'Home',
      slug: 'home',
      status: 'published',
      lastModified: '2024-01-20'
    },
    {
      id: 2,
      title: 'About Us',
      slug: 'about',
      status: 'published',
      lastModified: '2024-01-19'
    }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);

  const handleEdit = (page) => {
    setCurrentPage(page);
    setOpenDialog(true);
  };

  const handleSave = (pageData) => {
    setOpenDialog(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Page Management</Typography>
        <Button 
          variant="contained" 
          onClick={() => {
            setCurrentPage(null);
            setOpenDialog(true);
          }}
        >
          Create New Page
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Modified</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>{page.title}</TableCell>
                <TableCell>/{page.slug}</TableCell>
                <TableCell>
                  <Chip 
                    label={page.status} 
                    color={page.status === 'published' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{page.lastModified}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(page)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PageDialog 
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        page={currentPage}
        onSave={handleSave}
      />
    </Box>
  );
};

const PageDialog = ({ open, onClose, page, onSave }) => {
  const [formData, setFormData] = useState(page || {
    title: '',
    slug: '',
    content: '',
    status: 'draft'
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {page ? 'Edit Page' : 'Create New Page'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Page Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          margin="normal"
        />
        <TextField
          fullWidth
          label="URL Slug"
          value={formData.slug}
          onChange={(e) => setFormData({...formData, slug: e.target.value})}
          margin="normal"
        />
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Content
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(formData)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PageManager; 