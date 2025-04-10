import { toast } from "sonner"
import { API_ENDPOINTS } from "@/config/api"

export interface Movie {
  id: number | string
  title: string
  overview: string
  poster_path: string
  backdrop_path?: string
  release_date: string
  vote_average: number
  genre_ids?: number[]
  genres?: string[]
  popularity?: number
  original_title?: string
  original_language?: string
  adult?: boolean
  video?: boolean
  vote_count?: number
}

export interface Reservation {
  id: string
  movieId: string | number
  userId: string
  movieTitle: string
  posterPath: string
  date: string
  time: string
  createdAt?: string
}

const getAuthHeaders = () => {
  const user = localStorage.getItem("mMovieBookerUser")
  if (!user) {
    console.log("Aucun utilisateur trouvé dans localStorage")
    return {}
  }

  try {
    const userData = JSON.parse(user)
    console.log("Token d'authentification trouvé:", userData.access_token ? "Oui" : "Non")
    return {
      Authorization: `Bearer ${userData.access_token}`,
    }
  } catch (error) {
    console.error("Error parsing user data:", error)
    return {}
  }
}

export const getMovies = async (sortField?: string, sortDirection?: string): Promise<Movie[]> => {
  try {
    let url = API_ENDPOINTS.MOVIES_NOW_PLAYING
    const params = new URLSearchParams()

    if (sortField) {
      if (sortField === "title") {
        params.append("sort", sortDirection || "asc")
      } else if (sortField === "release_date" || sortField === "vote_average") {
        params.append("sort_by", sortField)
        params.append("sort_direction", sortDirection || "desc")
      }
    }

    const queryString = params.toString()
    if (queryString) {
      url = `${url}?${queryString}`
    }

    console.log("Fetching movies from:", url)

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })

    console.log("Réponse du serveur:", response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des films: ${response.status}`)
    }

    const data = await response.json()
    console.log("Données reçues:", data)

    if (data && data.results && Array.isArray(data.results)) {
      console.log("Films extraits de results:", data.results.length)
      return validateMovies(data.results)
    }

    if (Array.isArray(data)) {
      console.log("Films extraits du tableau principal:", data.length)
      return validateMovies(data)
    }

    const possibleMoviesProps = ["movies", "data", "films"]
    for (const prop of possibleMoviesProps) {
      if (data && data[prop] && Array.isArray(data[prop])) {
        console.log(`Films extraits de ${prop}:`, data[prop].length)
        return validateMovies(data[prop])
      }
    }

    console.error("Structure de données inattendue:", data)
    return []
  } catch (error) {
    console.error("Error fetching movies:", error)
    toast.error("Erreur lors du chargement des films")
    return []
  }
}

const validateMovies = (movies: any[]): Movie[] => {
  if (!Array.isArray(movies)) return []

  return movies
    .filter((movie) => {
      return (
        movie &&
        typeof movie === "object" &&
        movie.title &&
        typeof movie.title === "string" &&
        !movie.title.toLowerCase().includes("undefined")
      )
    })
    .map((movie) => {
      return {
        id: movie.id || `movie-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: movie.title || "Film sans titre",
        overview: movie.overview || "Pas de description disponible",
        poster_path: movie.poster_path || "",
        release_date: movie.release_date || new Date().toISOString().split("T")[0],
        vote_average: typeof movie.vote_average === "number" ? movie.vote_average : 0,
        ...movie,
      }
    })
}

export const getMovie = async (id: string): Promise<Movie | null> => {
  try {
    console.log(`Fetching movie with ID: ${id}`)

    const movies = await getMovies()
    console.log("Films récupérés pour la recherche:", movies.length)

    const stringId = String(id)
    const movie = movies.find((m) => String(m.id) === stringId)

    if (movie) {
      console.log("Film trouvé dans la liste:", movie)
      return movie
    }

    console.log("Film non trouvé dans la liste, tentative avec endpoint spécifique")

    try {
      const response = await fetch(`${API_ENDPOINTS.MOVIES_NOW_PLAYING}/${id}`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Film récupéré via endpoint spécifique:", data)

        if (data && data.title) {
          return {
            id: data.id || id,
            title: data.title,
            overview: data.overview || "Pas de description disponible",
            poster_path: data.poster_path || "",
            release_date: data.release_date || new Date().toISOString().split("T")[0],
            vote_average: typeof data.vote_average === "number" ? data.vote_average : 0,
            ...data,
          }
        }
      }
    } catch (err) {
      console.log("Endpoint spécifique non disponible:", err)
    }

    console.error(`Film avec ID ${id} non trouvé`)
    return null
  } catch (error) {
    console.error(`Error fetching movie ${id}:`, error)
    toast.error("Erreur lors du chargement du film")
    return null
  }
}

const normalizeReservation = (reservation: any, index: number): Reservation => {
  if (!reservation || typeof reservation !== "object") {
    console.error("Données de réservation invalides:", reservation)
    return {
      id: `invalid-${index}`,
      userId: "",
      movieId: "",
      movieTitle: "Réservation invalide",
      posterPath: "",
      date: new Date().toISOString().split("T")[0],
      time: "12:00",
    }
  }

  let normalizedTime = reservation.time || "12:00"

  if (normalizedTime === "00:00") {
    normalizedTime = "12:00"
  }

  if (!/^\d{1,2}:\d{2}$/.test(normalizedTime)) {
    console.warn("Format d'heure invalide, normalisation:", normalizedTime)
    normalizedTime = "12:00"
  }

  let normalizedDate = reservation.date || new Date().toISOString().split("T")[0]

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(normalizedDate)) {
    const [day, month, year] = normalizedDate.split("/")
    normalizedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  let normalizedTitle = reservation.movieTitle || "Film sans titre"
  if (normalizedTitle.toLowerCase() === "avatar" && reservation.originalMovieTitle) {
    normalizedTitle = reservation.originalMovieTitle
  }

  const normalizedPosterPath = reservation.posterPath || ""

  if (!normalizedPosterPath && reservation.movieId) {
    console.log("Tentative de récupération de l'affiche pour le film:", reservation.movieId)
  }

  return {
    id: reservation.id || `reservation-${index}-${Date.now()}`,
    userId: reservation.userId || "",
    movieId: reservation.movieId || "",
    movieTitle: normalizedTitle,
    posterPath: normalizedPosterPath,
    date: normalizedDate,
    time: normalizedTime,
    createdAt: reservation.createdAt || new Date().toISOString(),
  }
}

export const getUserReservations = async (userId: string): Promise<Reservation[]> => {
  try {
    console.log("Fetching user reservations from:", API_ENDPOINTS.MY_RESERVATIONS)

    
    const storedReservations = localStorage.getItem("movieBookerReservations")
    let localReservations: Reservation[] = []

    if (storedReservations) {
      try {
        const parsedReservations = JSON.parse(storedReservations)
        localReservations = parsedReservations
          .filter((r) => r.userId === userId)
          .map((reservation, index) => normalizeReservation(reservation, index))

        console.log("Réservations récupérées depuis localStorage:", localReservations)
      } catch (parseError) {
        console.error("Erreur lors du parsing des réservations locales:", parseError)
      }
    }

  
    try {
      const response = await fetch(API_ENDPOINTS.MY_RESERVATIONS, {
        headers: getAuthHeaders(),
      })

      console.log("Réponse du serveur (réservations):", response.status, response.statusText)

      if (!response.ok) {
        console.warn(`Erreur lors du chargement des réservations depuis l'API: ${response.status}`)
       
        return localReservations
      }

      const data = await response.json()
      console.log("Réservations reçues de l'API:", data)

     
      let apiReservations: any[] = []

      if (Array.isArray(data)) {
        apiReservations = data
      } else if (data && typeof data === "object") {
        const possibleReservationsProps = ["results", "reservations", "data"]

        for (const prop of possibleReservationsProps) {
          if (Array.isArray(data[prop])) {
            apiReservations = data[prop]
            break
          }
        }

        if (apiReservations.length === 0) {
          const arrayProps = Object.keys(data).filter((key) => Array.isArray(data[key]))
          if (arrayProps.length > 0) {
            apiReservations = data[arrayProps[0]]
          }
        }
      }

      const normalizedApiReservations = apiReservations.map((reservation, index) =>
        normalizeReservation(reservation, index),
      )

      console.log("Réservations normalisées de l'API:", normalizedApiReservations)

      
      const reservationsMap = new Map<string, Reservation>()

     
      normalizedApiReservations.forEach((reservation) => {
        reservationsMap.set(reservation.id, reservation)
      })

      localReservations.forEach((reservation) => {
        if (reservation.movieTitle && reservation.time !== "00:00") {
          reservationsMap.set(reservation.id, reservation)
        }
      })

      const mergedReservations = Array.from(reservationsMap.values())

      const validReservations = mergedReservations.filter((r) => {
        return r.movieTitle && r.movieTitle !== "avatar" && r.time !== "00:00"
      })

      console.log("Réservations fusionnées et filtrées:", validReservations)

      localStorage.setItem("movieBookerReservations", JSON.stringify(mergedReservations))

      return validReservations
    } catch (apiError) {
      console.error("Erreur lors de la récupération des réservations depuis l'API:", apiError)
      return localReservations
    }
  } catch (error) {
    console.error(`Error fetching reservations:`, error)
    toast.error("Erreur lors du chargement des réservations")
    return []
  }
}

export const checkTimeConflict = (time1: string, time2: string): boolean => {
  if (!time1 || !time2 || !time1.includes(":") || !time2.includes(":")) {
    console.error("Format d'heure invalide:", time1, time2)
    return false
  }

  try {
    const [hours1, minutes1] = time1.split(":").map(Number)
    const [hours2, minutes2] = time2.split(":").map(Number)

    if (isNaN(hours1) || isNaN(minutes1) || isNaN(hours2) || isNaN(minutes2)) {
      console.error("Valeurs d'heure invalides:", hours1, minutes1, hours2, minutes2)
      return false
    }

    const timeInMinutes1 = hours1 * 60 + minutes1
    const timeInMinutes2 = hours2 * 60 + minutes2

    const timeDifference = Math.abs(timeInMinutes1 - timeInMinutes2)
    console.log(`Différence de temps entre ${time1} et ${time2}: ${timeDifference} minutes`)
    return timeDifference < 120
  } catch (error) {
    console.error("Erreur lors de la vérification du conflit d'horaire:", error)
    return false
  }
}

export const checkReservationConflicts = async (
  userId: string,
  movieId: string | number,
  date: string,
  time: string,
): Promise<{ hasConflict: boolean; message: string }> => {
  try {
    console.log(`Vérification des conflits pour: userId=${userId}, movieId=${movieId}, date=${date}, time=${time}`)

    const existingReservations = await getUserReservations(userId)
    console.log("Réservations existantes:", existingReservations)

    const reservationsOnSameDate = existingReservations.filter((r) => r.date === date)
    console.log("Réservations à la même date:", reservationsOnSameDate)

    const sameMovieAndTime = reservationsOnSameDate.find(
      (r) => String(r.movieId) === String(movieId) && r.time === time,
    )

    if (sameMovieAndTime) {
      console.log("Conflit trouvé: même film, même horaire")
      return {
        hasConflict: true,
        message: "Vous avez déjà réservé ce film à cette date et heure",
      }
    }

    const conflictingTimeReservation = reservationsOnSameDate.find((r) => {
      if (String(r.movieId) === String(movieId)) return false

      const hasConflict = checkTimeConflict(r.time, time)
      if (hasConflict) {
        console.log(`Conflit d'horaire trouvé avec la réservation: ${r.movieTitle} à ${r.time}`)
      }
      return hasConflict
    })

    if (conflictingTimeReservation) {
      return {
        hasConflict: true,
        message: `Vous avez déjà une réservation pour "${conflictingTimeReservation.movieTitle}" à ${conflictingTimeReservation.time} (moins de 2 heures d'écart)`,
      }
    }

    console.log("Aucun conflit trouvé")
    return { hasConflict: false, message: "" }
  } catch (error) {
    console.error("Error checking reservation conflicts:", error)
    return { hasConflict: false, message: "" }
  }
}

export const createReservation = async (
  userId: string,
  movieId: string | number,
  date: string,
  time: string,
): Promise<Reservation | null> => {
  try {
    console.log(`Création de réservation: userId=${userId}, movieId=${movieId}, date=${date}, time=${time}`)

    if (time === "00:00") {
      throw new Error("L'heure de réservation ne peut pas être 00:00")
    }

    const movie = await getMovie(String(movieId))
    if (!movie) {
      throw new Error("Film non trouvé")
    }

    const { hasConflict, message } = await checkReservationConflicts(userId, movieId, date, time)
    if (hasConflict) {
      console.error("Conflit de réservation détecté:", message)
      throw new Error(message)
    }

    const reservationData = {
      userId,
      movieId: String(movieId),
      date,
      time,
      movieTitle: movie.title,
      posterPath: movie.poster_path,
      originalMovieTitle: movie.title,
    }

    console.log("Creating reservation with data:", reservationData)
    console.log("Endpoint:", API_ENDPOINTS.RESERVATIONS)

    const localReservation: Reservation = {
      id: `local-${Date.now()}`,
      userId,
      movieId,
      date,
      time,
      movieTitle: movie.title,
      posterPath: movie.poster_path,
      createdAt: new Date().toISOString(),
    }

    const storedReservations = localStorage.getItem("movieBookerReservations")
    const reservations = storedReservations ? JSON.parse(storedReservations) : []

    reservations.push(localReservation)

    localStorage.setItem("movieBookerReservations", JSON.stringify(reservations))
    console.log("Réservation créée localement:", localReservation)

    try {
      const response = await fetch(API_ENDPOINTS.RESERVATIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(reservationData),
      })

      console.log("Réponse du serveur (création réservation):", response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Erreur API:", errorData)
        toast.success("Réservation créée avec succès (mode hors ligne)")
        return localReservation
      }

      const data = await response.json()
      console.log("Réservation créée via API:", data)
      toast.success("Réservation créée avec succès")

      const apiReservation: Reservation = normalizeReservation(
        {
          ...data,
          id: data.id || `api-${Date.now()}`,
          movieTitle: data.movieTitle || movie.title,
          posterPath: data.posterPath || movie.poster_path,
          date: data.date || date,
          time: data.time || time,
          originalMovieTitle: movie.title,
        },
        0,
      )

      const updatedReservations = reservations.map((r) => {
        if (r.id === localReservation.id) {
          return {
            ...apiReservation,
            movieTitle: r.movieTitle || apiReservation.movieTitle,
            posterPath: r.posterPath || apiReservation.posterPath,
          }
        }
        return r
      })

      localStorage.setItem("movieBookerReservations", JSON.stringify(updatedReservations))
      console.log("Réservation locale mise à jour avec les données de l'API")

      return apiReservation
    } catch (apiError) {
      console.error("Erreur lors de la création de réservation via API:", apiError)
      toast.success("Réservation créée avec succès (mode hors ligne)")
      return localReservation
    }
  } catch (error) {
    console.error("Error creating reservation:", error)
    toast.error(error instanceof Error ? error.message : "Erreur lors de la création de la réservation")
    throw error
  }
}

export const deleteReservation = async (reservationId: string): Promise<boolean> => {
  try {
    const storedReservations = localStorage.getItem("movieBookerReservations")
    if (storedReservations) {
      const reservations = JSON.parse(storedReservations)
      const updatedReservations = reservations.filter((r) => r.id !== reservationId)
      localStorage.setItem("movieBookerReservations", JSON.stringify(updatedReservations))
      console.log("Réservation supprimée du localStorage:", reservationId)
    }

    if (reservationId.startsWith("local-")) {
      toast.success("Réservation supprimée avec succès")
      return true
    }

    console.log(`Deleting reservation with ID: ${reservationId}`)
    const response = await fetch(API_ENDPOINTS.DELETE_RESERVATION(reservationId), {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    console.log("Réponse du serveur (suppression réservation):", response.status, response.statusText)

    if (!response.ok) {
      toast.success("Réservation supprimée avec succès (mode hors ligne)")
      return true
    }

    toast.success("Réservation supprimée avec succès")
    return true
  } catch (error) {
    console.error(`Error deleting reservation ${reservationId}:`, error)
    toast.error("Erreur lors de la suppression de la réservation")
    return true
  }
}

export const getFullPosterPath = (posterPath: string): string => {
  if (!posterPath) {
    console.log("Pas de chemin d'affiche fourni")
    return "/placeholder.svg?height=400&width=300"
  }

  if (posterPath.startsWith("http")) {
    console.log("Chemin d'affiche complet:", posterPath)
    return posterPath
  }

  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
  const fullPath = `${TMDB_IMAGE_BASE_URL}${posterPath}`
  console.log("Chemin d'affiche construit:", fullPath)
  return fullPath
}

export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query || query.trim() === "") {
    console.log("Requête de recherche vide")
    return []
  }

  try {
    console.log(`Searching movies with query: "${query}"`)
    const encodedQuery = encodeURIComponent(query.trim())

    const url = `${API_ENDPOINTS.MOVIES_SEARCH}?query=${encodedQuery}`
    console.log("URL de recherche:", url)

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })

    console.log("Réponse du serveur (recherche):", response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`Erreur lors de la recherche de films: ${response.status}`)
    }

    const data = await response.json()
    console.log("Données de recherche reçues:", data)

    if (data && data.results && Array.isArray(data.results)) {
      console.log("Résultats de recherche extraits de results:", data.results.length)
      return validateMovies(data.results)
    }

    if (Array.isArray(data)) {
      console.log("Résultats de recherche extraits du tableau principal:", data.length)
      return validateMovies(data)
    }

    const possibleResultsProps = ["movies", "data", "films", "search_results"]
    for (const prop of possibleResultsProps) {
      if (data && data[prop] && Array.isArray(data[prop])) {
        console.log(`Résultats de recherche extraits de ${prop}:`, data[prop].length)
        return validateMovies(data[prop])
      }
    }

    console.error("Structure de données inattendue pour la recherche:", data)

    console.log("Recherche dans tous les films disponibles")
    const allMovies = await getMovies()
    const filteredMovies = allMovies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        (movie.overview && movie.overview.toLowerCase().includes(query.toLowerCase())),
    )
    console.log("Résultats de recherche locale:", filteredMovies.length)
    return validateMovies(filteredMovies)
  } catch (error) {
    console.error("Error searching movies:", error)
    toast.error("Erreur lors de la recherche de films")

    try {
      console.log("Tentative de recherche locale")
      const allMovies = await getMovies()
      const filteredMovies = allMovies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(query.toLowerCase()) ||
          (movie.overview && movie.overview.toLowerCase().includes(query.toLowerCase())),
      )
      console.log("Résultats de recherche locale:", filteredMovies.length)
      return validateMovies(filteredMovies)
    } catch (localError) {
      console.error("Erreur lors de la recherche locale:", localError)
      return []
    }
  }
}
