import { useLocation, Link } from 'react-router-dom';
import { Breadcrumbs, Typography, Container, Link as MuiLink } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Mapping des routes pour un affichage plus convivial
  const routeNames = {
    'analysis': 'Analysis',
    'backoffice': 'Backoffice',
    'profile': 'Profile',
    'settings': 'Settings',
    'about': 'About Us'
  };

  return (
    <Container sx={{ mt: 2, mb: 2 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
        <MuiLink 
          component={Link} 
          to="/" 
          color="inherit" 
          sx={{ 
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          Home
        </MuiLink>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return last ? (
            <Typography color="text.primary" key={to}>
              {routeNames[value] || value}
            </Typography>
          ) : (
            <MuiLink
              component={Link}
              to={to}
              key={to}
              color="inherit"
              sx={{ 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {routeNames[value] || value}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    </Container>
  );
};

export default Breadcrumb; 