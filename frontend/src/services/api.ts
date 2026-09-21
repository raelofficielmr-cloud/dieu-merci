import axios from 'axios';

const API_URL = 'https://dieu-merci-backend.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajoute le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dieumerci_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gère les erreurs 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dieumerci_token');
      localStorage.removeItem('dieumerci_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;