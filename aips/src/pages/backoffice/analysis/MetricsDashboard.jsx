import React from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';

const MetricsDashboard = () => {
    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Metrics Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">
                            Performance Metrics
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {/* Métriques de performance */}
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">
                            Usage Statistics
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {/* Statistiques d'utilisation */}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default MetricsDashboard; 