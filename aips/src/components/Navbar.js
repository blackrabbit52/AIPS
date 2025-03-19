import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box
} from '@mui/material';
import authService from '../services/authService';

const Navbar = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    AIPS
                </Typography>
                
                <Box>
                    {currentUser ? (
                        <>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/dashboard')}
                            >
                                Tableau de bord
                            </Button>
                            <Button
                                color="inherit"
                                onClick={handleLogout}
                            >
                                Déconnexion
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/login')}
                            >
                                Connexion
                            </Button>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/register')}
                            >
                                Inscription
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 