import axios from 'axios';

export const login = async (email, password) => {
  const res = await axios.post('http://localhost:3000/auth/login', { email, password });
  return res.data;
};
