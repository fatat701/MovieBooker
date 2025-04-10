
// Configuration de l'API
export const API_BASE_URL = 'http://localhost:3000/api';

// Points d'accès de l'API
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  
  // Films
  MOVIES_NOW_PLAYING: `${API_BASE_URL}/movies/now-playing`,
  MOVIES_SEARCH: `${API_BASE_URL}/movies/search`,
  
  // Réservations
  RESERVATIONS: `${API_BASE_URL}/reservations`,
  MY_RESERVATIONS: `${API_BASE_URL}/reservations/mine`,
  DELETE_RESERVATION: (id: string) => `${API_BASE_URL}/reservations/${id}`,
};
