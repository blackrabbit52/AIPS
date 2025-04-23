export const handleApiError = (error) => {
  if (error.response) {
// Server response error
    return error.response.data.message || 'Server error';
  } else if (error.request) {
// No response from the server
    return 'Network error';
  } else {
// Request configuration error
    return 'Request error';
  }
}; 