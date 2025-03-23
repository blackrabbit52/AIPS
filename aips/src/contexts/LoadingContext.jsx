import React, { createContext, useContext, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const LoadingContext = createContext();

// Custom hook for managing loading states
export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  // Global loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Start loading indicator
  const startLoading = () => setIsLoading(true);
  
  // Stop loading indicator
  const stopLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <LoadingSpinner open={isLoading} />
    </LoadingContext.Provider>
  );
}; 