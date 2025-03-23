import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';

const FAQManager = () => {
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: "What is AIPS?",
      answer: "AIPS is an AI-powered HR analytics platform...",
      category: "general",
      order: 1
    }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState(null);

  const categories = [
    "general",
    "analysis",
    "recommendations",
    "account",
    "pricing"
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">FAQ Management</Typography>
        <Button 
          variant="contained" 
          onClick={() => {
            setCurrentFAQ(null);
            setOpenDialog(true);
          }}
        >
          Add New FAQ
        </Button>
      </Box>

      <List>
        {faqs.map((faq, index) => (
          <Box key={faq.id} sx={{ mb: 2 }}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Box sx={{ mr: 2 }}>
                  <DragIcon />
                </Box>
                <Typography>{faq.question}</Typography>
                <Chip 
                  label={faq.category} 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
                <Box sx={{ mt: 2 }}>
                  <IconButton onClick={() => {
                    setCurrentFAQ(faq);
                    setOpenDialog(true);
                  }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        ))}
      </List>

      <FAQDialog 
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        faq={currentFAQ}
        categories={categories}
      />
    </Box>
  );
};

const FAQDialog = ({ open, onClose, faq, categories }) => {
  const [formData, setFormData] = useState(faq || {
    question: '',
    answer: '',
    category: 'general'
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {faq ? 'Edit FAQ' : 'Add New FAQ'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Question"
          value={formData.question}
          onChange={(e) => setFormData({...formData, question: e.target.value})}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Answer"
          multiline
          rows={4}
          value={formData.answer}
          onChange={(e) => setFormData({...formData, answer: e.target.value})}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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

export default FAQManager; 