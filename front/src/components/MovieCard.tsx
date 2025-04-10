"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { getFullPosterPath } from "@/services/movieService"
import { Calendar, Star } from "lucide-react"
import type { Movie } from "@/services/movieService"

interface MovieCardProps {
  movie: Movie
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate()

  return (
    <div className="movie-card relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 h-[400px]">
      <img
        src={getFullPosterPath(movie.poster_path) || "/placeholder.svg"}
        alt={movie.title}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = "/placeholder.svg"
        }}
      />
      <div className="movie-card-overlay absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
      <div className="movie-card-content absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{movie.title}</h3>
        <div className="flex items-center space-x-2 mb-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-white">{movie.vote_average}</span>
          <span className="text-sm text-gray-300">|</span>
          <Calendar className="h-4 w-4 text-gray-300" />
          <span className="text-sm text-gray-300">{new Date(movie.release_date).getFullYear()}</span>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="bg-tmdb-teal hover:bg-tmdb-teal/90 text-tmdb-navy"
            onClick={() => navigate(`/movies/${movie.id}`)}
          >
            Détails
          </Button>
          <Button
            size="sm"
            className="bg-tmdb-green hover:bg-tmdb-green/90 text-white"
            onClick={() => navigate(`/movies/${movie.id}/reserve`)}
          >
            Réserver
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
