import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import analysisService from '../services/analysis.service';

const Results = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await analysisService.getAnalysisById(id);
        setAnalysis(response.data);
      } catch (err) {
        setError('Error loading analysis results');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const data = [
    { name: 'Jan', value: 400, category: 'A' },
    { name: 'Feb', value: 300, category: 'B' },
    { name: 'Mar', value: 600, category: 'C' },
    { name: 'Apr', value: 800, category: 'D' },
    { name: 'May', value: 500, category: 'E' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analysis Results #{id}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Date: {new Date().toLocaleDateString()}
        </Typography>
        <Typography color="text.secondary">
          Type: {analysis?.type || 'Data Analysis'}
        </Typography>
      </Paper>

      {/* Main Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average
              </Typography>
              <Typography variant="h4">
                {data.reduce((acc, curr) => acc + curr.value, 0) / data.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Maximum
              </Typography>
              <Typography variant="h4">
                {Math.max(...data.map(item => item.value))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Minimum
              </Typography>
              <Typography variant="h4">
                {Math.min(...data.map(item => item.value))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Tables */}
      <Grid container spacing={3}>
        {/* Time Evolution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Time Evolution
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.category}>
                      <TableCell>{row.category}</TableCell>
                      <TableCell align="right">{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Details Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Details
            </Typography>
            <Typography paragraph>
              This analysis shows trends and patterns in the collected data.
              The results indicate {analysis?.summary || 'significant variations in the observed measurements'}.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Results; 