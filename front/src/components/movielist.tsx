"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { getMovies, searchMovies, getFullPosterPath, type Movie } from "@/services/movieService"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Film, Calendar, SortAsc, SortDesc } from "lucide-react"

interface MovieListProps {
  searchQuery?: string
}

const MovieList: React.FC<MovieListProps> = ({ searchQuery }) => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Get page and sort from URL if available
    const pageParam = searchParams.get("page")
    const sortParam = searchParams.get("sort") as "asc" | "desc" | null

    if (pageParam) {
      setCurrentPage(Number.parseInt(pageParam))
    }

    if (sortParam) {
      setSortOrder(sortParam)
    }

    fetchMovies(pageParam ? Number.parseInt(pageParam) : 1, sortParam || undefined)
  }, [searchQuery, searchParams])

  const fetchMovies = async (page: number, sort?: "asc" | "desc") => {
    setIsLoading(true)
    try {
      let data: Movie[]
      let totalPagesCount = 1
      let totalResultsCount = 0

      if (searchQuery) {
        data = await searchMovies(searchQuery, page)
      } else {
        // Essayer de récupérer les films avec pagination
        const TMDB_API_KEY = "3e52e2f5350e06e5cb20053948f5196d"
        const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`

        try {
          const response = await fetch(url)
          if (response.ok) {
            const tmdbData = await response.json()
            data = tmdbData.results.map((movie: any) => ({
              id: movie.id.toString(),
              title: movie.title,
              overview: movie.overview,
              poster_path: movie.poster_path,
              release_date: movie.release_date,
              vote_average: movie.vote_average,
              genres: [],
            }))
            totalPagesCount = tmdbData.total_pages
            totalResultsCount = tmdbData.total_results
          } else {
            data = await getMovies(page, sort)
          }
        } catch (error) {
          data = await getMovies(page, sort)
        }
      }

      setMovies(data)

      // Set pagination info
      setTotalPages(totalPagesCount || Math.ceil(data.length / 10) || 1)
      setTotalResults(totalResultsCount || data.length)
    } catch (error) {
      console.error("Error fetching movies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return

    setCurrentPage(newPage)

    // Update URL with new page
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())

    // Keep sort parameter if it exists
    if (sortOrder) {
      params.set("sort", sortOrder)
    }

    navigate(`?${params.toString()}`)

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSortChange = (value: string) => {
    let sort: "asc" | "desc" | undefined = undefined

    if (value === "asc" || value === "desc") {
      sort = value
    }

    setSortOrder(sort)

    // Update URL with new sort order
    const params = new URLSearchParams(searchParams)

    if (sort) {
      params.set("sort", sort)
    } else {
      params.delete("sort")
    }

    // Keep page parameter
    if (currentPage > 1) {
      params.set("page", currentPage.toString())
    }

    navigate(`?${params.toString()}`)

    // Fetch movies with new sort order
    fetchMovies(currentPage, sort)
  }

  // Appliquer le tri côté client si nécessaire
  const sortedMovies = [...movies]
  if (sortOrder === "asc") {
    sortedMovies.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortOrder === "desc") {
    sortedMovies.sort((a, b) => b.title.localeCompare(a.title))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tmdb-teal"></div>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <Film className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-500 mb-2">
          {searchQuery ? "Aucun film trouvé pour cette recherche" : "Aucun film disponible"}
        </h2>
        {searchQuery && (
          <Button className="mt-4" onClick={() => navigate("/")}>
            Voir tous les films
          </Button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          {totalResults} films trouvés {searchQuery ? `pour "${searchQuery}"` : ""}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Trier par:</span>
          <Select value={sortOrder || "default"} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par titre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Par défaut</SelectItem>
              <SelectItem value="asc">
                <div className="flex items-center">
                  <SortAsc className="mr-2 h-4 w-4" />
                  Titre (A-Z)
                </div>
              </SelectItem>
              <SelectItem value="desc">
                <div className="flex items-center">
                  <SortDesc className="mr-2 h-4 w-4" />
                  Titre (Z-A)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedMovies.map((movie) => (
          <Card
            key={movie.id}
            className="overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer"
            onClick={() => navigate(`/movies/${movie.id}`)}
          >
            <div className="aspect-[2/3] relative">
              <img
                src={getFullPosterPath(movie.poster_path) || "/placeholder.svg"}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg"
                }}
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                {movie.vote_average?.toFixed(1) || "N/A"}
              </div>
            </div>
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{movie.title}</h3>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(15, totalPages) }, (_, i) => {
              // Logique pour afficher les pages
              let pageToShow

              if (totalPages <= 15) {
                // Si moins de 15 pages, afficher toutes les pages
                pageToShow = i + 1
              } else if (currentPage <= 7) {
                // Si on est au début, afficher les 15 premières pages
                pageToShow = i + 1
              } else if (currentPage >= totalPages - 7) {
                // Si on est à la fin, afficher les 15 dernières pages
                pageToShow = totalPages - 14 + i
              } else {
                // Sinon, afficher 7 pages avant et 7 pages après la page courante
                pageToShow = currentPage - 7 + i
              }

              // Ne pas afficher la page si elle est hors limites
              if (pageToShow <= 0 || pageToShow > totalPages) {
                return null
              }

              // Afficher des points de suspension pour indiquer qu'il y a plus de pages
              if (
                (pageToShow === 2 && currentPage > 7 && totalPages > 15) ||
                (pageToShow === totalPages - 1 && currentPage < totalPages - 7 && totalPages > 15)
              ) {
                return (
                  <span key={`ellipsis-${pageToShow}`} className="px-2">
                    ...
                  </span>
                )
              }

              // Afficher le bouton de page
              return (
                <Button
                  key={pageToShow}
                  variant={currentPage === pageToShow ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageToShow)}
                  className={currentPage === pageToShow ? "bg-tmdb-teal text-white" : ""}
                >
                  {pageToShow}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MovieList
