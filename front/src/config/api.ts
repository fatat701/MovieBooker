export const API_BASE_URL = "http://localhost:3000"

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,

  MOVIES_NOW_PLAYING: `${API_BASE_URL}/api/movies/now-playing`,
  MOVIES_SEARCH: `${API_BASE_URL}/api/movies/search`,

  RESERVATIONS: `${API_BASE_URL}/api/reservations`,
  MY_RESERVATIONS: `${API_BASE_URL}/api/reservations/mine`,
  DELETE_RESERVATION: (id: string) => `${API_BASE_URL}/api/reservations/${id}`,
}
