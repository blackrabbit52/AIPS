import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const footerLinks = [
  { text: 'About Us', path: '/about' },
  { text: 'Privacy Policy', path: '/privacy' },
  { text: 'Terms of Service', path: '/terms' },
  { text: 'Contact', path: '/contact' },
];

const socialLinks = [
  { icon: <FacebookIcon />, url: 'https://facebook.com', name: 'Facebook' },
  { icon: <TwitterIcon />, url: 'https://twitter.com', name: 'Twitter' },
  { icon: <LinkedInIcon />, url: 'https://linkedin.com', name: 'LinkedIn' },
  { icon: <GitHubIcon />, url: 'https://github.com', name: 'GitHub' },
];

export const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              AIPS Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Advanced Intelligent Personality System
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Empowering insights through AI-driven social media analysis
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.map((link) => (
                <MuiLink
                  key={link.text}
                  component={Link}
                  to={link.path}
                  color="text.secondary"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.text}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Connect With Us
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Follow us on social media for updates and news
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.name}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 5, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} AIPS Platform. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Built with advanced AI technology for accurate personality analysis
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}; 