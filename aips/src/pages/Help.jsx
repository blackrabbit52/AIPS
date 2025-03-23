import React from 'react';
import { Container, Typography, Grid, Card, CardContent, TextField, Box, Accordion, AccordionSummary, AccordionDetails, InputAdornment } from '@mui/material';
import { Search as SearchIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

const Help = () => {
  const faqs = [
    {
      question: "How do I start using AIPS?",
      answer: "Sign up for an account, choose your plan, and you can immediately start using our analysis tools."
    },
    {
      question: "What type of data can I analyze?",
      answer: "You can analyze text content, social media profiles, and structured data through our API."
    },
    {
      question: "How accurate are the analysis results?",
      answer: "Our AI models achieve over 90% accuracy in personality trait identification, validated through extensive testing."
    },
    {
      question: "Can I export my analysis results?",
      answer: "Yes, you can export results in multiple formats including PDF, CSV, and JSON."
    }
  ];

  const categories = [
    {
      title: "Getting Started",
      description: "Basic guides and tutorials"
    },
    {
      title: "Account Management",
      description: "Managing your AIPS account"
    },
    {
      title: "Analysis Tools",
      description: "Using our analysis features"
    },
    {
      title: "API Documentation",
      description: "Technical integration guides"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Help Center
      </Typography>

      <Box sx={{ my: 4 }}>
        <TextField
          fullWidth
          placeholder="Search for help..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 6 }}>
        Popular Categories
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {categories.map((category, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {category.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom>
        Frequently Asked Questions
      </Typography>
      {faqs.map((faq, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default Help; 