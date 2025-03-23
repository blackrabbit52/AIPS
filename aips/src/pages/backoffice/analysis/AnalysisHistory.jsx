import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

const AnalysisHistory = () => {
  const [analyses, setAnalyses] = useState([
    {
      id: 1,
      type: 'Performance Analysis',
      user: 'John Doe',
      date: '2024-01-20',
      status: 'completed',
      score: 85
    },
    // ... other analyses
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // Monthly analysis data
  const monthlyData = [
    { name: 'Jan', analyses: 65 },
    { name: 'Feb', analyses: 75 },
    { name: 'Mar', analyses: 85 },
    // ... other data
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Analysis History
      </Typography>

      {/* Main Analysis Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Analysis Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Results</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analyses.map((analysis) => (
              <TableRow key={analysis.id}>
                <TableCell>{analysis.date}</TableCell>
                <TableCell>{analysis.type}</TableCell>
                <TableCell>
                  <Chip 
                    label={analysis.status}
                    color={analysis.status === 'completed' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>{analysis.score}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Monthly Analysis Trends */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Analysis Trends
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Number of Analyses</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthlyData.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.analyses}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Detailed Analysis Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyses.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell>{analysis.type}</TableCell>
                    <TableCell>{analysis.user}</TableCell>
                    <TableCell>{analysis.date}</TableCell>
                    <TableCell>
                      <Chip 
                        label={analysis.status}
                        color={analysis.status === 'completed' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{analysis.score}%</TableCell>
                    <TableCell>
                      <IconButton onClick={() => {
                        setSelectedAnalysis(analysis);
                        setOpenDialog(true);
                      }}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton>
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Quick Statistics */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  Total Analyses: 1,234
                </Typography>
                <Typography variant="body1">
                  Average Score: 82%
                </Typography>
                <Typography variant="body1">
                  Completed: 1,180
                </Typography>
                <Typography variant="body1">
                  In Progress: 54
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Top Analysis Types */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Analysis Types
              </Typography>
              <Box sx={{ mt: 2 }}>
                {['Performance', 'Skills', 'Team', 'Project'].map((type) => (
                  <Box 
                    key={type} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mb: 1 
                    }}
                  >
                    <Typography>{type}</Typography>
                    <Typography>
                      {Math.floor(Math.random() * 500)} analyses
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AnalysisDetailsDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        analysis={selectedAnalysis}
      />
    </Container>
  );
};

const AnalysisDetailsDialog = ({ open, onClose, analysis }) => {
  if (!analysis) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Analysis Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Basic Information</Typography>
            <Box sx={{ mt: 1 }}>
              <Typography>Type: {analysis.type}</Typography>
              <Typography>User: {analysis.user}</Typography>
              <Typography>Date: {analysis.date}</Typography>
              <Typography>Status: {analysis.status}</Typography>
              <Typography>Score: {analysis.score}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Metrics</Typography>
            {/* Add detailed metrics here */}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<DownloadIcon />}>
          Download Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnalysisHistory; 