import React, { createContext, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const ErrorContext = createContext();

// Custom hook for error handling
export const useError = () => useContext(ErrorContext);

export const ErrorProvider = ({ children }) => {
  // Error state management
  const [error, setError] = useState(null);

  // Handle and display error
  const handleError = (message) => {
    setError(message);
    // Auto-clear error after display
    setTimeout(() => setError(null), 6000);
  };

  // Clear current error
  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ handleError, clearError }}>
      {children}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={clearError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </ErrorContext.Provider>
  );
}; 