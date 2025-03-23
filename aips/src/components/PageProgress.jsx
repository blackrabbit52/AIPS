import React from 'react';
import { LinearProgress, Box } from '@mui/material';

const PageProgress = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2000,
        opacity: 1,
        transition: 'opacity 0.2s'
      }}
    >
      <LinearProgress />
    </Box>
  );
};

export default PageProgress; 