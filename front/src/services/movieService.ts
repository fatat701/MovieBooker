export interface Movie {
  id: string
  title: string
  overview: string
  poster_path: string
  release_date: string
  vote_average: number
  genres: string[]
}

export interface Reservation {
  id: number
  userId: string
  movieId: string
  movieTitle: string
  startTime: string
  createdAt: string
}

export const getMovies = async (page = 1, sort?: "asc" | "desc"): Promise<Movie[]> => {
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

export const getMovie = async (id: string): Promise<Movie | null> => {
  const TMDB_API_KEY = "3e52e2f5350e06e5cb20053948f5196d"
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=fr-FR`

  try {
    const response = await fetch(url)
    if (response.ok) {
      const movie = await response.json()
      return {
        id: movie.id.toString(),
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genres: movie.genres ? movie.genres.map((g: any) => g.name) : [],
      }
    } else {
      console.error("Failed to fetch movie from TMDB")
      return null
    }
  } catch (error) {
    console.error("Error fetching movie:", error)
    return null
  }
}

export const searchMovies = async (query: string, page = 1): Promise<Movie[]> => {
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

export const getUserReservations = async (userId: string): Promise<Reservation[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedReservations = localStorage.getItem(`reservations_${userId}`)
      const reservations = storedReservations ? JSON.parse(storedReservations) : []
      resolve(reservations)
    }, 500)
  })
}

export const createReservation = async (
  userId: string,
  movieId: string,
  date: string,
  time: string,
): Promise<boolean> => {
  try {
    const movie = await getMovie(movieId)
    if (!movie) return false

    const reservation: Reservation = {
      id: Date.now(), 
      userId,
      movieId,
      movieTitle: movie.title,
      startTime: `${date}T${time}:00`,
      createdAt: new Date().toISOString(),
    }

    const storedReservations = localStorage.getItem(`reservations_${userId}`)
    const reservations = storedReservations ? JSON.parse(storedReservations) : []

    reservations.push(reservation)

    localStorage.setItem(`reservations_${userId}`, JSON.stringify(reservations))

    return true
  } catch (error) {
    console.error("Error creating reservation:", error)
    return false
  }
}

export const deleteReservation = async (reservationId: string): Promise<boolean> => {
  try {
  
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("reservations_"))

    for (const key of keys) {
      const storedReservations = localStorage.getItem(key)
      if (!storedReservations) continue

      const reservations = JSON.parse(storedReservations)
      const updatedReservations = reservations.filter((r: Reservation) => r.id.toString() !== reservationId)

      if (updatedReservations.length < reservations.length) {
        localStorage.setItem(key, JSON.stringify(updatedReservations))
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Error deleting reservation:", error)
    return false
  }
}
