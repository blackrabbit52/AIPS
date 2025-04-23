import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog
} from '@mui/material';
import authService from '../services/auth.service';
import analysisService from '../services/analysis.service';
import ChangePasswordDialog from '../components/dialogs/ChangePasswordDialog';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadUserAnalyses();
  }, []);

  const loadUserAnalyses = async () => {
    try {
      const response = await analysisService.getUserAnalyses();
      setAnalyses(response.data);
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Information utiliser */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Profile Information</Typography>
            <Typography>Username: {user?.username}</Typography>
            <Typography>Email: {user?.email}</Typography>
            <Button
              variant="contained"
              onClick={() => setOpenPasswordDialog(true)}
              sx={{ mt: 2 }}
            >
              Change Password
            </Button>
          </Paper>
        </Grid>

        {/* List of analyses */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            My Analyses
          </Typography>
          <Grid container spacing={2}>
            {analyses.map((analysis) => (
              <Grid item xs={12} sm={6} key={analysis.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{analysis.title}</Typography>
                    <Typography color="textSecondary">
                      Date: {new Date(analysis.createdAt).toLocaleDateString()}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/analysis/${analysis.id}`)}
                      sx={{ mt: 1 }}
                    >
                      View Results
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <ChangePasswordDialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
      />
    </Container>
  );
};

export default Profile; 