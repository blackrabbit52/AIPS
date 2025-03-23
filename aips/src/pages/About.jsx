import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Box,
  Paper,
  Divider,
  useTheme,
  Fade
} from '@mui/material';

const About = () => {
  const theme = useTheme();

  const team = [
    {
      name: "John Doe",
      role: "CEO & Founder",
      image: "/path/to/image1.jpg", // Replace with actual images
      description: "Expert in AI and Data Analysis with 15 years of experience"
    },
    {
      name: "Jane Smith",
      role: "Lead Developer",
      image: "/path/to/image2.jpg",
      description: "Full-stack developer specialized in data visualization"
    },
    // Add more team members as needed
  ];

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "AIPS was established with a vision to revolutionize data analysis"
    },
    {
      year: "2021",
      title: "First Major Release",
      description: "Launch of our core analysis platform"
    },
    {
      year: "2022",
      title: "International Expansion",
      description: "Expanded operations to multiple countries"
    },
    {
      year: "2023",
      title: "AI Integration",
      description: "Introduced advanced AI capabilities"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About AIPS
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Advanced Intelligent Processing Systems
        </Typography>
      </Box>

      {/* Mission and Vision */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Our Mission
              </Typography>
              <Typography>
                AIPS is committed to providing advanced data analysis solutions,
                enabling businesses to make informed decisions based on accurate
                and reliable data.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Our Vision
              </Typography>
              <Typography>
                To become the global leader in data analysis, continuously
                innovating and delivering solutions that transform how
                businesses utilize their data.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Timeline without @mui/lab */}
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Our History
      </Typography>
      <Box sx={{ mb: 8 }}>
        {[
          { year: '2020', text: 'AIPS Foundation' },
          { year: '2021', text: 'Launch of our first analysis platform' },
          { year: '2024', text: 'Advanced AI Integration' }
        ].map((item, index) => (
          <Paper
            key={item.year}
            sx={{
              p: 3,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Typography variant="h6" color="primary">
              {item.year}
            </Typography>
            <Typography>
              {item.text}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Team Section */}
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Our Team
      </Typography>
      <Grid container spacing={4}>
        {[
          { name: 'blackrabbit52 On github', role: 'Founder & CEO', avatar: 'JAYNIE' },
          { name: 'John Doe', role: 'CTO', avatar: 'JD' },
          { name: 'Jane Smith', role: 'Lead Developer', avatar: 'JS' }
        ].map((member) => (
          <Grid item xs={12} sm={6} md={4} key={member.name}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
                  {member.avatar}
                </Avatar>
                <Typography variant="h6">{member.name}</Typography>
                <Typography color="text.secondary">{member.role}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default About; 