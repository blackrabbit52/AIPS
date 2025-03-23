import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, CardActionArea, Chip, Box } from '@mui/material';

const Blog = () => {
  const posts = [
    {
      title: "Understanding Personality Analysis in Modern Business",
      date: "March 15, 2024",
      category: "Business",
      image: "/images/blog-1.jpg",
      excerpt: "How modern businesses are leveraging personality analysis for better decision-making"
    },
    {
      title: "The Role of AI in Personality Assessment",
      date: "March 10, 2024",
      category: "Technology",
      image: "/images/blog-2.jpg",
      excerpt: "Exploring how artificial intelligence is revolutionizing personality assessment"
    },
    {
      title: "Best Practices for Team Building",
      date: "March 5, 2024",
      category: "HR",
      image: "/images/blog-3.jpg",
      excerpt: "Learn how to build effective teams using personality insights"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        AIPS Blog
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Insights and updates from our team
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {posts.map((post, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="200"
                  image={post.image}
                  alt={post.title}
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Chip label={post.category} size="small" color="primary" />
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {post.date}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.excerpt}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Blog; 