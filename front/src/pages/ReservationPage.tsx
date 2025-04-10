"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Clock, ArrowLeft } from "lucide-react"
import {
  getMovie,
  createReservation,
  getFullPosterPath,
  getUserReservations,
  checkReservationConflicts,
  type Movie,
  type Reservation,
} from "@/services/movieService"
import { useAuth } from "@/contexts/AuthContext"
import { format, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"

const showTimes = ["10:00", "12:30", "15:00", "17:30", "20:00", "22:30"]

const ReservationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isReserving, setIsReserving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userReservations, setUserReservations] = useState<Reservation[]>([])
  const [disabledTimes, setDisabledTimes] = useState<{ time: string; reason: string }[]>([])

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        setError(null)
        console.log("Fetching movie for reservation, ID:", id)

        const data = await getMovie(id)

        if (data) {
          console.log("Movie found for reservation:", data)
          setMovie(data)
        } else {
          console.error("Movie not found for reservation")
          setError("Film non trouvé")
          toast.error("Film non trouvé")
        }
      } catch (err) {
        console.error("Error fetching movie for reservation:", err)
        setError("Erreur lors du chargement du film")
        toast.error("Erreur lors du chargement du film")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchUserReservations = async () => {
      if (!user) return

      try {
        const reservations = await getUserReservations(user.id)
        console.log("Réservations utilisateur récupérées:", reservations)
        setUserReservations(reservations)
      } catch (err) {
        console.error("Error fetching user reservations:", err)
      }
    }

    fetchMovie()
    fetchUserReservations()
  }, [id, user])

  
  useEffect(() => {
    if (!selectedDate || !user || !movie) return

    const formattedDate = format(selectedDate, "yyyy-MM-dd")
    console.log("Vérification des conflits pour la date:", formattedDate)
    console.log("Réservations existantes:", userReservations)

    const disabledTimesList: { time: string; reason: string }[] = []

    
    showTimes.forEach((time) => {
      
      userReservations.forEach((reservation) => {
        if (reservation.date !== formattedDate) return

    
        if (String(reservation.movieId) === String(movie.id) && reservation.time === time) {
          console.log(`Conflit trouvé: même film (${movie.id}), même horaire (${time})`)
          disabledTimesList.push({
            time,
            reason: "Vous avez déjà réservé ce film à cet horaire",
          })
          return
        }

    
        if (String(reservation.movieId) !== String(movie.id)) {
          const [hours1, minutes1] = time.split(":").map(Number)
          const [hours2, minutes2] = reservation.time.split(":").map(Number)

          const timeInMinutes1 = hours1 * 60 + minutes1
          const timeInMinutes2 = hours2 * 60 + minutes2

          const timeDifference = Math.abs(timeInMinutes1 - timeInMinutes2)
          console.log(`Différence de temps entre ${time} et ${reservation.time}: ${timeDifference} minutes`)

          if (timeDifference < 120) {
            console.log(`Conflit trouvé: autre film (${reservation.movieId}), horaire proche (${reservation.time})`)
            disabledTimesList.push({
              time,
              reason: `Conflit avec votre réservation pour "${reservation.movieTitle}" à ${reservation.time}`,
            })
          }
        }
      })
    })

    console.log("Horaires désactivés:", disabledTimesList)
    setDisabledTimes(disabledTimesList)
  }, [selectedDate, userReservations, movie])

  const handleSearch = (query: string) => {
    navigate(`/?search=${encodeURIComponent(query)}`)
  }

  const handleReservation = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour réserver une séance")
      navigate("/login", { state: { from: `/movies/${id}/reserve` } })
      return
    }

    if (!movie || !selectedDate || !selectedTime) {
      toast.error("Veuillez sélectionner une date et un horaire")
      return
    }

    
    const isDisabled = disabledTimes.find((item) => item.time === selectedTime)
    if (isDisabled) {
      toast.error(isDisabled.reason)
      return
    }

    setIsReserving(true)
    setError(null)

    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")

      console.log("Tentative de réservation avec les données:", {
        userId: user.id,
        movieId: movie.id,
        date: formattedDate,
        time: selectedTime,
        movieTitle: movie.title,
        posterPath: movie.poster_path,
      })

      
      const { hasConflict, message } = await checkReservationConflicts(user.id, movie.id, formattedDate, selectedTime)

      if (hasConflict) {
        console.error("Conflit détecté lors de la vérification finale:", message)
        throw new Error(message)
      }

      const result = await createReservation(user.id, movie.id, formattedDate, selectedTime)

      if (result) {
        console.log("Réservation créée avec succès:", result)
        setSuccess(true)
        toast.success("Réservation créée avec succès!")
        setTimeout(() => {
          navigate("/reservations")
        }, 2000)
      } else {
        setError("Échec de la réservation")
        toast.error("Échec de la réservation")
      }
    } catch (err) {
      console.error("Reservation failed:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la réservation")
      toast.error(err instanceof Error ? err.message : "Erreur lors de la réservation")
    } finally {
      setIsReserving(false)
    }
  }

  const isTimeDisabled = (time: string): boolean => {
    return disabledTimes.some((item) => item.time === time)
  }

  const getTimeDisabledReason = (time: string): string => {
    const disabledTime = disabledTimes.find((item) => item.time === time)
    return disabledTime ? disabledTime.reason : ""
  }

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-tmdb-navy mb-6">Réserver pour "{movie?.title || "Film"}"</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="rounded-lg overflow-hidden shadow-md">
                <img
                  src={getFullPosterPath(movie?.poster_path || "") || "/placeholder.svg"}
                  alt={movie?.title || "Film"}
                  className="w-full"
                  onError={(e) => {
                    console.log("Erreur de chargement d'image:", movie?.poster_path)
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=500&width=300"
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                {error && (
                  <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 text-sm">
                      Réservation créée avec succès! Redirection vers vos réservations...
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <Label className="text-lg font-medium mb-2 block">Choisir une date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date)
                          setSelectedTime(null) // Réinitialise l'horaire si la date change
                        }}
                        disabled={(date) => date < new Date() || date > addDays(new Date(), 14)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="mb-6">
                  <Label className="text-lg font-medium mb-2 block">Choisir un horaire</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {showTimes.map((time) => {
                      const disabled = isTimeDisabled(time)
                      return (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={`
                            ${selectedTime === time ? "bg-tmdb-teal text-white" : ""}
                            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                          `}
                          onClick={() => !disabled && setSelectedTime(time)}
                          disabled={disabled}
                          title={disabled ? getTimeDisabledReason(time) : ""}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {time}
                        </Button>
                      )
                    })}
                  </div>
                  {disabledTimes.length > 0 && (
                    <p className="text-amber-600 text-sm mt-2">
                      Les horaires grisés sont indisponibles car vous avez déjà une réservation pour ce film ou un autre
                      film dans les 2 heures précédentes ou suivantes.
                    </p>
                  )}
                </div>

                {!user && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-6">
                    <p className="text-amber-700 text-sm">
                      Vous devez être connecté pour réserver une séance.{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-tmdb-teal"
                        onClick={() => navigate("/login", { state: { from: `/movies/${id}/reserve` } })}
                      >
                        Se connecter
                      </Button>
                    </p>
                  </div>
                )}

                <Button
                  className="w-full bg-tmdb-teal hover:bg-tmdb-teal/90 text-tmdb-navy"
                  disabled={!selectedDate || !selectedTime || !user || isReserving || success}
                  onClick={handleReservation}
                >
                  {isReserving ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Réservation en cours...
                    </div>
                  ) : (
                    "Confirmer la réservation"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default ReservationPage
