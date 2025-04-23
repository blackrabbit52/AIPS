import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888';

// // Number of entries to analyse (sample)
// // Create the axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Service authentification
export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/user'),
};

// Services analyse
export const analysisService = {
  analyzeText: (text) => api.post('/api/analysis/analyze/post', { text }),
  analyzePosts: (posts) => api.post('/api/analysis/analyze/posts', { posts }),
  analyzeSocialMedia: (socialNetwork, username) =>
    api.post('/api/analysis/analyze/social-media', { social_network: socialNetwork, username }),
  getTaskStatus: (taskId) => api.get(`/api/analysis/task/${taskId}`),
};

// Services  recommandation
export const recommendationService = {
  getTeamRole: (personalityTraits) =>
    api.post('/api/recommend/team-role', { personality_traits: personalityTraits }),
  getRoles: () => api.get('/api/recommend/roles'),
}; 