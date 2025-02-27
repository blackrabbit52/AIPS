import React from 'react';
import { Container, Typography } from '@mui/material';
import { AppBar, Toolbar, Button, Box, Grid, Paper, IconButton, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logo from '../assets/logo.png'; // Assurez-vous d'avoir un logo dans ce chemin

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: '#fff',
  boxShadow: 'none',
  borderBottom: '1px solid #eaeaea'
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#333',
  margin: theme.spacing(0, 1),
  '&:hover': {
    background: 'rgba(25, 118, 210, 0.04)'
  }
}));

const MainContent = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(8),
  minHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)'
  }
}));

const Home = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar>
          <Box component="img" src={logo} alt="AIPS Logo" sx={{ height: 40, mr: 2 }} />
          <Box sx={{ flexGrow: 1 }} />
          <NavButton component={Link} to="/">Accueil</NavButton>
          <NavButton component={Link} to="/personality-analysis">Analyse de Personnalité</NavButton>
          <NavButton component={Link} to="/dashboard">Tableau de Bord</NavButton>
          <NavButton component={Link} to="/results">Résultats</NavButton>
          <NavButton component={Link} to="/history">Historique</NavButton>
          
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem component={Link} to="/profile" onClick={handleClose}>Profil</MenuItem>
            <MenuItem component={Link} to="/login" onClick={handleClose}>Connexion</MenuItem>
            <MenuItem component={Link} to="/register" onClick={handleClose}>Inscription</MenuItem>
          </Menu>
        </Toolbar>
      </StyledAppBar>

      <Container maxWidth="lg">
        <MainContent>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              textAlign: 'center',
              mb: 4
            }}
          >
            Analyse de Personnalité AIPS
          </Typography>
          
          <Typography 
            variant="h5" 
            color="textSecondary" 
            sx={{ mb: 6, textAlign: 'center', maxWidth: 800 }}
          >
            Découvrez votre profil de personnalité basé sur les modèles MBTI et OCEAN, et obtenez des recommandations personnalisées pour votre rôle en équipe
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <Typography variant="h5" gutterBottom>Analyse MBTI & OCEAN</Typography>
                <Typography>
                  Analyse approfondie de votre personnalité basée sur vos publications sociales utilisant des modèles d'IA avancés
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <Typography variant="h5" gutterBottom>Recommandations de Rôle</Typography>
                <Typography>
                  Obtenez des suggestions personnalisées sur votre rôle idéal en équipe basées sur vos traits de personnalité dominants
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <Typography variant="h5" gutterBottom>Visualisation Interactive</Typography>
                <Typography>
                  Explorez vos résultats d'analyse à travers des visualisations détaillées et interactives
                </Typography>
              </FeatureCard>
            </Grid>
          </Grid>
        </MainContent>
      </Container>
    </>
  );
};

export default Home;

