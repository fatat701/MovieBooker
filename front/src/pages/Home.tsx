"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Navbar from "@/components/Navbar"
import MovieGrid from "@/components/MovieGrid"
import SortControls from "@/components/SortControls"
import { getMovies, searchMovies, type Movie } from "@/services/movieService"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

const Home: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const queryParam = searchParams.get("search")
    if (queryParam) {
      setSearchQuery(queryParam)
      handleSearch(queryParam)
    } else {
      fetchMovies()
    }
  }, [searchParams])

  const fetchMovies = async (sortField?: string, sortDirection?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getMovies(sortField, sortDirection)
      console.log("Movies fetched:", data)

      const validMovies = data.filter(
        (movie) => movie.title && typeof movie.title === "string" && !movie.title.toLowerCase().includes("undefined"),
      )

      setMovies(validMovies)
      setFilteredMovies(validMovies)
    } catch (err) {
      console.error("Error in Home component:", err)
      setError("Impossible de charger les films")
      toast.error("Impossible de charger les films")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setIsLoading(true)
    setError(null)

    try {
      if (query.trim() === "") {
        setFilteredMovies(movies)
        return
      }

      console.log("Searching for:", query)
      const results = await searchMovies(query)
      console.log("Search results:", results)

      const validResults = results.filter(
        (movie) => movie.title && typeof movie.title === "string" && !movie.title.toLowerCase().includes("undefined"),
      )

      if (validResults && validResults.length > 0) {
        setFilteredMovies(validResults)
      } else {
        const localResults = movies.filter(
          (movie) =>
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            (movie.overview && movie.overview.toLowerCase().includes(query.toLowerCase())),
        )

        if (localResults.length > 0) {
          setFilteredMovies(localResults)
          toast.info("Résultats trouvés localement")
        } else {
          setFilteredMovies([])
          toast.info("Aucun film trouvé pour cette recherche")
        }
      }
    } catch (err) {
      console.error("Error searching movies:", err)
      setError("Erreur lors de la recherche")
      toast.error("Erreur lors de la recherche")

      const localResults = movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(query.toLowerCase()) ||
          (movie.overview && movie.overview.toLowerCase().includes(query.toLowerCase())),
      )

      if (localResults.length > 0) {
        setFilteredMovies(localResults)
        toast.info("Résultats trouvés localement")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (sortField: "title" | "release_date" | "vote_average", direction: "asc" | "desc") => {
    console.log(`Sorting by ${sortField} in ${direction} order`)

    fetchMovies(sortField, direction).catch(() => {
      const sorted = [...filteredMovies].sort((a, b) => {
        if (sortField === "title") {
          return direction === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
        } else if (sortField === "release_date") {
          return direction === "asc"
            ? new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
            : new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        } else {
          return direction === "asc" ? a.vote_average - b.vote_average : b.vote_average - a.vote_average
        }
      })

      setFilteredMovies(sorted)
      toast.success(`Tri effectué par ${getFieldName(sortField)}`)
    })
  }

  const getFieldName = (field: string): string => {
    switch (field) {
      case "title":
        return "titre"
      case "release_date":
        return "date de sortie"
      case "vote_average":
        return "note"
      default:
        return field
    }
  }

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-tmdb-navy">
              {searchQuery ? `Résultats pour "${searchQuery}"` : "Films à l'affiche"}
            </h1>

            <SortControls onSort={handleSort} />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <MovieGrid movies={filteredMovies} isLoading={isLoading} />
        </section>
      </main>
    </>
  )
}

export default Home
