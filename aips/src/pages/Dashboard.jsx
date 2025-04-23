import React from 'react';
import { Grid, Container } from '@mui/material';
import { Assessment, Person, Timeline } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import DataCard from '../components/common/DataCard';

const Dashboard = () => {
  const breadcrumbs = [
    { text: 'Home', link: '/' },
    { text: 'Dashboard' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader 
        title="Dashboard" 
        breadcrumbs={breadcrumbs} 
      />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <DataCard
            title="Total Analyses"
            value="24"
            icon={<Assessment />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DataCard
            title="Active Users"
            value="12"
            icon={<Person />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DataCard
            title="Recent Activities"
            value="8"
            icon={<Timeline />}
            color="success"
          />
        </Grid>
      </Grid>
      
      {/* // Remaining content */}
    </Container>
  );
};

export default Dashboard; 