"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { getFullPosterPath } from "@/services/movieService"
import { Calendar, Star, Info, Ticket } from "lucide-react"
import type { Movie } from "@/services/movieService"
import { useAuth } from "@/contexts/AuthContext"

interface MovieCardProps {
  movie: Movie
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleReserveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("Bouton réserver cliqué pour le film:", movie.id)

    if (user) {
      console.log("Redirection vers la page de réservation")
      navigate(`/movies/${movie.id}/reserve`)
    } else {
      console.log("Redirection vers la page de connexion")
      navigate("/login", { state: { from: `/movies/${movie.id}/reserve` } })
    }
  }

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("Bouton détails cliqué pour le film:", movie.id)
    navigate(`/movies/${movie.id}`)
  }

  const handleCardClick = () => {
    console.log("Carte de film cliquée:", movie.id)
    navigate(`/movies/${movie.id}`)
  }

  const title = movie?.title || "Film sans titre"
  const voteAverage = movie?.vote_average || 0
  const releaseDate = movie?.release_date ? new Date(movie.release_date) : new Date()
  const posterPath = movie?.poster_path || ""

  return (
    <div
      className="movie-card relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 h-[400px] cursor-pointer"
      onClick={handleCardClick}
    >
      <img
        src={getFullPosterPath(posterPath) || "/placeholder.svg"}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.log("Erreur de chargement d'image:", posterPath)
          const target = e.target as HTMLImageElement
          target.src = "/placeholder.svg?height=400&width=300"
        }}
      />


      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80"></div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{title}</h3>
        <div className="flex items-center space-x-2 mb-3">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-white">{voteAverage}</span>
          <span className="text-sm text-gray-300">|</span>
          <Calendar className="h-4 w-4 text-gray-300" />
          <span className="text-sm text-gray-300">{releaseDate.getFullYear()}</span>
        </div>

      
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="bg-tmdb-teal hover:bg-tmdb-teal/90 text-white w-full flex items-center justify-center"
            onClick={handleDetailsClick}
          >
            <Info className="h-4 w-4 mr-1" />
            Détails
          </Button>
          <Button
            size="sm"
            className="bg-tmdb-green hover:bg-tmdb-green/90 text-white w-full flex items-center justify-center"
            onClick={handleReserveClick}
          >
            <Ticket className="h-4 w-4 mr-1" />
            Réserver
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
