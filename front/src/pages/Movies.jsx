import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMovies } from '../services/movieService';
import ReservationForm from '../components/ReservationForm';

export default function Movies() {
  const { token } = useAuth();
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMovies(token, page).then(data => setMovies(data.results));
  }, [token, page]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Films en salle</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.map(movie => (
          <div key={movie.id} className="border p-2 rounded">
            <h3 className="font-bold">{movie.title}</h3>
            <p>ID : {movie.id}</p>
            <p>Note : {movie.vote_average}</p>
            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} />
          </div>
        ))}
      </div>
      <div className="my-4">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>← Précédent</button>
        <span className="mx-4">Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Suivant →</button>
      </div>
      <ReservationForm />
    </div>
  );
}
