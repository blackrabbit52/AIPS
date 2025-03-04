import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  useTheme,
  Stack,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

const socialLinks = [
  { icon: <FacebookIcon />, url: 'https://facebook.com', name: 'Facebook' },
  { icon: <TwitterIcon />, url: 'https://twitter.com', name: 'Twitter' },
  { icon: <LinkedInIcon />, url: 'https://linkedin.com', name: 'LinkedIn' },
  { icon: <GitHubIcon />, url: 'https://github.com', name: 'GitHub' },
];

const footerLinks = {
  product: [
    { text: 'Features', href: '/features' },
    { text: 'Pricing', href: '/pricing' },
    { text: 'Case Studies', href: '/case-studies' },
    { text: 'API Documentation', href: '/docs' },
  ],
  company: [
    { text: 'About Us', href: '/about' },
    { text: 'Careers', href: '/careers' },
    { text: 'Blog', href: '/blog' },
    { text: 'Press Kit', href: '/press' },
  ],
  legal: [
    { text: 'Terms of Service', href: '/terms' },
    { text: 'Privacy Policy', href: '/privacy' },
    { text: 'Cookie Policy', href: '/cookies' },
    { text: 'Security', href: '/security' },
  ],
  support: [
    { text: 'Help Center', href: '/help' },
    { text: 'Contact Us', href: '/contact' },
    { text: 'Status', href: '/status' },
    { text: 'Community', href: '/community' },
  ],
};

export const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #60a5fa, #a78bfa)'
                  : 'linear-gradient(45deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AIPS Platform
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, maxWidth: 300 }}
            >
              Advanced AI-powered personality analysis platform helping businesses and individuals understand social interactions better.
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.name}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
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
            </Stack>
          </Grid>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <Grid item xs={6} sm={3} md={2} key={category}>
              <Typography
                variant="subtitle2"
                color="text.primary"
                sx={{ mb: 2, fontWeight: 600, textTransform: 'capitalize' }}
              >
                {category}
              </Typography>
              <Stack spacing={1}>
                {links.map((link) => (
                  <Link
                    key={link.text}
                    href={link.href}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textDecoration: 'none',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    {link.text}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* Bottom Section */}
        <Box
          sx={{
            mt: 8,
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} AIPS Platform. All rights reserved.
          </Typography>
          
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
          >
            <Link
              href="mailto:contact@aips-platform.com"
              variant="body2"
              color="text.secondary"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              <EmailIcon fontSize="small" />
              contact@aips-platform.com
            </Link>
            <Typography variant="body2" color="text.secondary">
              Made with ❤️ by AIPS Team
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}; 