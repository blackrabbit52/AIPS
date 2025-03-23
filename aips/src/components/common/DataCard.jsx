import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const DataCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h5" color={`${color}.main`}>
                {value}
              </Typography>
            </Box>
            {icon && (
              <Box color={`${color}.main`}>
                {icon}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DataCard; 