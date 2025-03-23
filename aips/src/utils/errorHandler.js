export const handleApiError = (error) => {
  if (error.response) {
    // Erreur de réponse du serveur
    return error.response.data.message || 'Server error';
  } else if (error.request) {
    // Pas de réponse du serveur
    return 'Network error';
  } else {
    // Erreur de configuration de la requête
    return 'Request error';
  }
}; 