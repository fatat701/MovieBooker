export const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  
  MOVIES_NOW_PLAYING: `${API_BASE_URL}/movies/now-playing`,
  MOVIES_SEARCH: `${API_BASE_URL}/movies/search`,
  
  RESERVATIONS: `${API_BASE_URL}/reservations`,
  MY_RESERVATIONS: `${API_BASE_URL}/reservations/mine`,
  DELETE_RESERVATION: (id: string) => `${API_BASE_URL}/reservations/${id}`,
};
