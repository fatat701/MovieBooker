import type React from "react"
import { type Movie, getFullPosterPath } from "@/services/movieService"

interface MoviesListProps {
  movies: Movie[]
}

const MoviesList: React.FC<MoviesListProps> = ({ movies }) => {
  if (!movies || movies.length === 0) {
    return <div>Aucun film trouvé.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {movies.map((movie) => (
        <div key={movie.id} className="movie-card bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={getFullPosterPath(movie.poster_path) || "/placeholder.svg"}
            alt={movie.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg"
            }}
          />
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 truncate">{movie.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{movie.overview}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MoviesList
