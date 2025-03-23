import { useCallback } from 'react';
import { useError } from '../contexts/ErrorContext';

export const useFileValidation = () => {
  const { handleError } = useError();

  const validateFile = useCallback((file) => {
    if (!file) return false;

    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      handleError('Invalid file type. Please upload a CSV or XLSX file.');
      return false;
    }

    if (file.size > maxSize) {
      handleError('File size too large. Maximum size is 10MB.');
      return false;
    }

    return true;
  }, [handleError]);

  return validateFile;
}; 