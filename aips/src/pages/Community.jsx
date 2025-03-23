import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button, Box, Chip, Avatar, Divider } from '@mui/material';
import { Forum, Group, Event, Article } from '@mui/icons-material';

const Community = () => {
  const upcomingEvents = [
    {
      title: "AIPS User Conference 2024",
      date: "June 15-16, 2024",
      location: "Virtual Event",
      description: "Annual conference for AIPS users and developers"
    },
    {
      title: "AI in HR Workshop",
      date: "April 5, 2024",
      location: "Online",
      description: "Learn how to leverage AI for HR decisions"
    }
  ];

  const discussions = [
    {
      title: "Best practices for team analysis",
      author: "John Smith",
      replies: 23,
      views: 156,
      tags: ["HR", "Teams", "Best Practices"]
    },
    {
      title: "Integration with Slack",
      author: "Sarah Johnson",
      replies: 15,
      views: 98,
      tags: ["Integration", "Technical"]
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      type: "Documentation",
      icon: <Article />,
      description: "Complete guide for new users"
    },
    {
      title: "Developer Resources",
      type: "Technical",
      icon: <Forum />,
      description: "API documentation and code samples"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        AIPS Community
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Connect, learn, and grow with fellow AIPS users
      </Typography>

      <Grid container spacing={4}>
        {/* Events Section */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Upcoming Events
          </Typography>
          <Grid container spacing={3}>
            {upcomingEvents.map((event, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {event.date} • {event.location}
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                      {event.description}
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 2 }}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Discussions Section */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Recent Discussions
          </Typography>
          {discussions.map((discussion, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {discussion.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                    {discussion.author[0]}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {discussion.author} • {discussion.replies} replies • {discussion.views} views
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {discussion.tags.map((tag, idx) => (
                    <Chip key={idx} label={tag} size="small" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Resources Section */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Community Resources
          </Typography>
          <Grid container spacing={3}>
            {resources.map((resource, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {resource.icon}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {resource.title}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary">
                      {resource.description}
                    </Typography>
                    <Button variant="text" sx={{ mt: 2 }}>
                      Access Resource
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Community; 