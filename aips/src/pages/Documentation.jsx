import React from 'react';
import { Container, Typography, Paper, Box, Tabs, Tab, Divider, useTheme } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Documentation = () => {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const codeExamples = {
    authentication: `
// Authentication Example
const response = await fetch('https://api.aips.com/v1/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    apiKey: 'your_api_key'
  })
});
    `,
    analysis: `
// Personality Analysis Example
const response = await fetch('https://api.aips.com/v1/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_token',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Text to analyze'
  })
});
    `
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        API Documentation
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Everything you need to integrate AIPS into your application
      </Typography>

      <Paper sx={{ mt: 4 }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Authentication" />
          <Tab label="Analysis API" />
          <Tab label="Webhooks" />
        </Tabs>
        <Divider />
        
        <Box sx={{ p: 3 }}>
          {value === 0 && (
            <>
              <Typography variant="h5" gutterBottom>
                Authentication
              </Typography>
              <Typography paragraph>
                To use the AIPS API, you'll need to authenticate your requests using an API key.
              </Typography>
              <SyntaxHighlighter language="javascript" style={tomorrow}>
                {codeExamples.authentication}
              </SyntaxHighlighter>
            </>
          )}
          
          {value === 1 && (
            <>
              <Typography variant="h5" gutterBottom>
                Analysis API
              </Typography>
              <Typography paragraph>
                Send text or social media data for personality analysis.
              </Typography>
              <SyntaxHighlighter language="javascript" style={tomorrow}>
                {codeExamples.analysis}
              </SyntaxHighlighter>
            </>
          )}
          
          {value === 2 && (
            <>
              <Typography variant="h5" gutterBottom>
                Webhooks
              </Typography>
              <Typography paragraph>
                Configure webhooks to receive real-time updates about analysis results.
              </Typography>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Documentation; 