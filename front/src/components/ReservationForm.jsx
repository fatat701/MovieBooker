import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createReservation } from '../services/reservationService';

export default function ReservationForm() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    movieId: '',
    movieTitle: '',
    startTime: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReservation(token, form);
      alert('Réservation confirmée');
      setForm({ movieId: '', movieTitle: '', startTime: '' }); // Reset form
    } catch (err) {
      alert("Erreur lors de la réservation");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded space-y-4">
      <h2 className="text-xl font-bold mb-2">🎟️ Réserver un film</h2>

      <input
        className="w-full border p-2 rounded"
        placeholder="Movie ID"
        value={form.movieId}
        onChange={(e) => setForm({ ...form, movieId: e.target.value })}
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Titre du film"
        value={form.movieTitle}
        onChange={(e) => setForm({ ...form, movieTitle: e.target.value })}
      />
      <input
        type="datetime-local"
        className="w-full border p-2 rounded"
        value={form.startTime}
        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
      />
      <button className="bg-purple-600 text-white py-2 px-4 rounded w-full hover:bg-purple-700">
        Réserver
      </button>
    </form>
  );
}
