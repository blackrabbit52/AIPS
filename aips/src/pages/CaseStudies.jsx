import React from 'react';
import { Container, Typography, Card, CardContent, CardMedia, Grid, Box, Chip } from '@mui/material';

const CaseStudies = () => {
  const studies = [
    {
      title: "Enterprise HR Transformation",
      company: "Global Tech Corp",
      image: "/images/case-study-1.jpg", // Add actual image path
      category: "HR Analytics",
      description: "How AIPS helped improve hiring decisions with 85% accuracy in personality matching",
      results: [
        "40% reduction in turnover",
        "90% hiring success rate",
        "60% faster recruitment process"
      ]
    },
    {
      title: "Customer Service Enhancement",
      company: "ServicePro Solutions",
      image: "/images/case-study-2.jpg", // Add actual image path
      category: "Customer Analytics",
      description: "Improving customer service team performance through personality insights",
      results: [
        "35% increase in customer satisfaction",
        "25% faster resolution time",
        "50% better team matching"
      ]
    },
    {
      title: "Sales Team Optimization",
      company: "SalesForce Pro",
      image: "/images/case-study-3.jpg", // Add actual image path
      category: "Sales Analytics",
      description: "Leveraging personality analysis for better sales team performance",
      results: [
        "45% increase in sales",
        "30% better client relationships",
        "20% higher team satisfaction"
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Case Studies
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Real success stories from our clients
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {studies.map((study, index) => (
          <Grid item xs={12} key={index}>
            <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
              <CardMedia
                component="img"
                sx={{ width: { xs: '100%', md: 300 } }}
                image={study.image}
                alt={study.title}
              />
              <CardContent sx={{ flex: 1 }}>
                <Chip label={study.category} color="primary" sx={{ mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  {study.title}
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {study.company}
                </Typography>
                <Typography variant="body1" paragraph>
                  {study.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Key Results:
                  </Typography>
                  {study.results.map((result, idx) => (
                    <Typography key={idx} component="li">
                      {result}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CaseStudies; 