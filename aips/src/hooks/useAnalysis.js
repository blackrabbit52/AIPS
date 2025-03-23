import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useError } from '../contexts/ErrorContext';

export const useAnalysis = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();
  const { handleError } = useError();

  const submitAnalysis = useCallback(async (analysisData) => {
    setIsSubmitting(true);
    try {
      // Ici, vous ajouterez plus tard l'appel API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation
      showNotification('Analysis started successfully!', 'success');
      return true;
    } catch (error) {
      handleError('Failed to start analysis: ' + error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [showNotification, handleError]);

  return {
    isSubmitting,
    submitAnalysis
  };
}; 