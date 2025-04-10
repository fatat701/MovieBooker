import type React from "react"
import MovieCard from "./MovieCard"
import type { Movie } from "@/services/movieService"
import { Film } from "lucide-react"

interface MovieGridProps {
  movies: Movie[]
  isLoading?: boolean
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tmdb-teal"></div>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <Film className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg text-gray-500">Aucun film trouvé</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default MovieGrid
