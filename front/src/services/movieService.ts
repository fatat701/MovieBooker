export interface Movie {
  id: string
  title: string
  overview: string
  poster_path: string
  release_date: string
  vote_average: number
  genres: string[]
}

export const getMovies = async (page = 1, sort?: "asc" | "desc"): Promise<Movie[]> => {
  // Replace with actual API call or data fetching logic
  // This is a placeholder implementation
  const TMDB_API_KEY = "3e52e2f5350e06e5cb20053948f5196d"
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`

  try {
    const response = await fetch(url)
    if (response.ok) {
      const tmdbData = await response.json()
      return tmdbData.results.map((movie: any) => ({
        id: movie.id.toString(),
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genres: [],
      }))
    } else {
      console.error("Failed to fetch movies from TMDB")
      return []
    }
  } catch (error) {
    console.error("Error fetching movies:", error)
    return []
  }
}

export const searchMovies = async (query: string, page = 1): Promise<Movie[]> => {
  // Replace with actual API call or data fetching logic
  // This is a placeholder implementation
  const TMDB_API_KEY = "3e52e2f5350e06e5cb20053948f5196d"
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=fr-FR&query=${query}&page=${page}`

  try {
    const response = await fetch(url)
    if (response.ok) {
      const tmdbData = await response.json()
      return tmdbData.results.map((movie: any) => ({
        id: movie.id.toString(),
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genres: [],
      }))
    } else {
      console.error("Failed to fetch movies from TMDB")
      return []
    }
  } catch (error) {
    console.error("Error fetching movies:", error)
    return []
  }
}

export const getFullPosterPath = (posterPath: string | null): string | null => {
  if (!posterPath) {
    return null
  }
  return `https://image.tmdb.org/t/p/w500${posterPath}`
}
