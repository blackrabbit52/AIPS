import React from 'react';
import { Box, keyframes } from '@mui/material';

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(180deg);
  }
`;

const flow = keyframes`
  0%, 100% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  50% {
    clip-path: polygon(50% 0, 50% 0, 50% 100%, 50% 100%);
  }
`;

interface LoaderProps {
  size?: number;
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 60, color = '#1976d2' }) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: size,
          height: size * 1.5,
          position: 'relative',
          animation: `${rotate} 2s linear infinite`,
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '50%',
            backgroundColor: color,
            animation: `${flow} 2s linear infinite`,
          },
          '&::before': {
            top: 0,
            transformOrigin: 'bottom',
          },
          '&::after': {
            bottom: 0,
            transformOrigin: 'top',
          },
        }}
      />
    </Box>
  );
};

export default Loader; 