import axios from 'axios';

export const fetchMovies = async (token, page = 1, query = '') => {
  const res = await axios.get(`http://localhost:3000/movies/${query ? 'search' : 'now-playing'}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: query ? { query, page } : { page },
  });
  return res.data;
};
