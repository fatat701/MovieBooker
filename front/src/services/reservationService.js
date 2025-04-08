export const createReservation = async (token, data) => {
  const res = await axios.post('http://localhost:3000/reservations', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
export const deleteReservation = async (token, id) => {
  await axios.delete(`http://localhost:3000/reservations/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
