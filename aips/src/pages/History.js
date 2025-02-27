import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(4)
}));

const History = () => {
  const navigate = useNavigate();

  // Mock data for example
  const analysisHistory = [
    {
      id: 1,
      date: '2024-02-27',
      type: 'Text Analysis',
      mbtiType: 'ENTP',
      primaryRole: 'Innovator',
      status: 'Completed'
    },
    {
      id: 2,
      date: '2024-02-26',
      type: 'Social Profile',
      mbtiType: 'INTJ',
      primaryRole: 'Strategist',
      status: 'Completed'
    },
    {
      id: 3,
      date: '2024-02-25',
      type: 'Text Analysis',
      mbtiType: 'ENFP',
      primaryRole: 'Communicator',
      status: 'Completed'
    }
  ];

  const handleViewResult = (id) => {
    navigate(`/results/${id}`);
  };

  return (
    <Container maxWidth="lg">
      <StyledPaper>
        <Typography variant="h4" gutterBottom align="center">
          Analysis History
        </Typography>
        
        <Typography variant="body1" paragraph align="center" color="textSecondary">
          View and compare your past personality analyses
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Analysis Type</TableCell>
                <TableCell>MBTI Type</TableCell>
                <TableCell>Primary Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analysisHistory.map((analysis) => (
                <TableRow key={analysis.id}>
                  <TableCell>{analysis.date}</TableCell>
                  <TableCell>{analysis.type}</TableCell>
                  <TableCell>
                    <Chip label={analysis.mbtiType} color="primary" size="small" />
                  </TableCell>
                  <TableCell>{analysis.primaryRole}</TableCell>
                  <TableCell>
                    <Chip 
                      label={analysis.status} 
                      color={analysis.status === 'Completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Results">
                      <IconButton
                        size="small"
                        onClick={() => handleViewResult(analysis.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>
    </Container>
  );
};

export default History; 