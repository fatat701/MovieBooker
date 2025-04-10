"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { getMovie, getFullPosterPath, type Movie } from "@/services/movieService"
import { Calendar, Star, ArrowLeft, Ticket } from "lucide-react"

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        setError(null)
        console.log("Fetching movie with ID:", id)

        const data = await getMovie(id)

        if (data) {
          console.log("Movie found:", data)
          setMovie(data)
        } else {
          console.error("Movie not found")
          setError("Film non trouvé")
        }
      } catch (err) {
        console.error("Error fetching movie:", err)
        setError("Erreur lors du chargement du film")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovie()
  }, [id])

  const handleSearch = (query: string) => {
    navigate(`/?search=${encodeURIComponent(query)}`)
  }

  if (isLoading) {
    return (
      <>
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tmdb-teal"></div>
          </div>
        </div>
      </>
    )
  }

  if (error || !movie) {
    return (
      <>
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Film non trouvé</h2>
            <Button className="mt-4 bg-tmdb-teal hover:bg-tmdb-teal/90" onClick={() => navigate("/")}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </>
    )
  }

  const genres = Array.isArray(movie.genres) ? movie.genres : []

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <main>
        <div className="relative h-[50vh] w-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${getFullPosterPath(movie.poster_path)})`,
              filter: "blur(8px)",
              opacity: 0.3,
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
          <div className="container mx-auto px-4 h-full">
            <div className="flex h-full items-end pb-6">
              <Button variant="ghost" className="absolute top-4 left-4" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img
                  src={getFullPosterPath(movie.poster_path) || "/placeholder.svg"}
                  alt={movie.title}
                  className="w-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold text-tmdb-navy mb-2">{movie.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-5 w-5" />
                  <span>{new Date(movie.release_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>{movie.vote_average} / 10</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span key={genre} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2 text-tmdb-navy">Synopsis</h2>
                <p className="text-gray-700 leading-relaxed">{movie.overview}</p>
              </div>

              <Button
                size="lg"
                className="bg-tmdb-teal hover:bg-tmdb-teal/90 text-tmdb-navy"
                onClick={() => navigate(`/movies/${movie.id}/reserve`)}
              >
                <Ticket className="mr-2 h-5 w-5" />
                Réserver maintenant
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default MovieDetail
