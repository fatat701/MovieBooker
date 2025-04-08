import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-800 text-white px-4 py-2 flex justify-between">
      <div className="space-x-4">
        <Link to="/movies">🎬 Films</Link>
        <Link to="/reservations/mine">📅 Mes Réservations</Link>
      </div>
      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="text-red-400"
      >
        Logout
      </button>
    </nav>
  );
}
