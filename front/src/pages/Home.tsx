"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Navbar from "@/components/Navbar"
import MovieGrid from "@/components/MovieGrid"
import { getMovies, searchMovies, type Movie } from "@/services/movieService"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, SortAsc, SortDesc } from "lucide-react"

const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Get search query from URL
    const query = searchParams.get("search") || ""
    setSearchQuery(query)

    // Get page and sort from URL if available
    const pageParam = searchParams.get("page")
    const sortParam = searchParams.get("sort") as "asc" | "desc" | null

    if (pageParam) {
      setCurrentPage(Number.parseInt(pageParam))
    }

    if (sortParam) {
      setSortOrder(sortParam)
    }

    fetchMovies(query, pageParam ? Number.parseInt(pageParam) : 1, sortParam || undefined)
  }, [searchParams])

  const fetchMovies = async (query: string, page: number, sort?: "asc" | "desc") => {
    setIsLoading(true)
    try {
      let data: Movie[]
      let totalPagesCount = 1
      let totalResultsCount = 0

      if (query) {
        data = await searchMovies(query, page)
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

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    navigate(`/?search=${encodeURIComponent(query)}`)
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

    // Keep search parameter if it exists
    if (searchQuery) {
      params.set("search", searchQuery)
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

    // Keep search parameter if it exists
    if (searchQuery) {
      params.set("search", searchQuery)
    }

    navigate(`?${params.toString()}`)

    // Fetch movies with new sort order
    fetchMovies(searchQuery, currentPage, sort)
  }

  // Appliquer le tri côté client si nécessaire
  const sortedMovies = [...movies]
  if (sortOrder === "asc") {
    sortedMovies.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortOrder === "desc") {
    sortedMovies.sort((a, b) => b.title.localeCompare(a.title))
  }

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <main className="container mx-auto px-4 py-8">
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

        <MovieGrid movies={sortedMovies} isLoading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageToShow
                if (totalPages <= 5) {
                  pageToShow = i + 1
                } else if (currentPage <= 3) {
                  pageToShow = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageToShow = totalPages - 4 + i
                } else {
                  pageToShow = currentPage - 2 + i
                }

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
      </main>
    </>
  )
}

export default Home
