import React from 'react';
import { Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const PageHeader = ({ title, breadcrumbs }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        {breadcrumbs && (
          <Breadcrumbs>
            {breadcrumbs.map((item, index) => (
              item.link ? (
                <Link
                  key={index}
                  component={RouterLink}
                  to={item.link}
                  color="inherit"
                >
                  {item.text}
                </Link>
              ) : (
                <Typography key={index} color="text.primary">
                  {item.text}
                </Typography>
              )
            ))}
          </Breadcrumbs>
        )}
      </motion.div>
    </Box>
  );
};

export default PageHeader; 