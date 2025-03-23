import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  CardMedia,
  CardActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material';

const BlogManager = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Getting Started with AIPS',
      excerpt: 'Learn how to maximize your HR analytics...',
      image: '/path/to/image.jpg',
      status: 'published',
      date: '2024-01-20'
    }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);

  const handleEdit = (post) => {
    setCurrentPost(post);
    setOpenDialog(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Blog Management</Typography>
        <Button 
          variant="contained" 
          onClick={() => {
            setCurrentPost(null);
            setOpenDialog(true);
          }}
        >
          Create New Post
        </Button>
      </Box>

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} md={4} key={post.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={post.image}
                alt={post.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                <Typography color="textSecondary">
                  {post.excerpt}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={post.status} 
                    color={post.status === 'published' ? 'success' : 'default'}
                    size="small"
                  />
                  <Typography variant="caption" sx={{ ml: 2 }}>
                    {post.date}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleEdit(post)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <BlogPostDialog 
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        post={currentPost}
      />
    </Box>
  );
};

const BlogPostDialog = ({ open, onClose, post }) => {
  const [formData, setFormData] = useState(post || {
    title: '',
    excerpt: '',
    content: '',
    status: 'draft'
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {post ? 'Edit Blog Post' : 'Create New Blog Post'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Post Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Excerpt"
          multiline
          rows={2}
          value={formData.excerpt}
          onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
          margin="normal"
        />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
          >
            Upload Featured Image
          </Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Content
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={() => setFormData({...formData, status: 'draft'})}
        >
          Save as Draft
        </Button>
        <Button 
          variant="contained"
          onClick={() => setFormData({...formData, status: 'published'})}
        >
          Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlogManager; 