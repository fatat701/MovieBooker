import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMyReservations} from '../services/reservationService';
import { deleteReservation} from '../services/reservationService';

export default function Reservations() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);

  const load = () => fetchMyReservations(token).then(setReservations);

  useEffect(() => {
    load();
  }, [token]);

  const handleDelete = async (id) => {
    await deleteReservation(token, id);
    load();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Mes Réservations</h2>
      <ul className="space-y-2">
        {reservations.map(r => (
          <li key={r.id} className="border p-3 rounded flex justify-between">
            <div>
              🎬 <strong>{r.movieTitle}</strong><br />
              🕒 {new Date(r.startTime).toLocaleString()}
            </div>
            <button onClick={() => handleDelete(r.id)} className="text-red-500">Annuler</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
