import React from 'react';
import { AppBar, Toolbar, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logo from '../assets/logo.png';

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

const Navigation = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <StyledAppBar position="fixed">
      <Toolbar>
        <Box component="img" src={logo} alt="AIPS Logo" sx={{ height: 40, mr: 2 }} />
        <Box sx={{ flexGrow: 1 }} />
        <NavButton component={Link} to="/">Home</NavButton>
        <NavButton component={Link} to="/personality-analysis">Personality Analysis</NavButton>
        <NavButton component={Link} to="/dashboard">Dashboard</NavButton>
        <NavButton component={Link} to="/results">Results</NavButton>
        <NavButton component={Link} to="/history">History</NavButton>
        
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
          <MenuItem component={Link} to="/profile" onClick={handleClose}>Profile</MenuItem>
          <MenuItem component={Link} to="/login" onClick={handleClose}>Login</MenuItem>
          <MenuItem component={Link} to="/register" onClick={handleClose}>Register</MenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navigation; 