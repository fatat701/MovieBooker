"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Clock, CheckCircle, ArrowLeft } from "lucide-react"
import { getMovie, createReservation, getFullPosterPath, type Movie } from "@/services/movieService"
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

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        setError(null)
        const data = await getMovie(id)

        if (data) {
          setMovie(data)
        } else {
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

    setIsReserving(true)
    setError(null)

    try {
      const result = await createReservation(user.id, movie.id, format(selectedDate, "yyyy-MM-dd"), selectedTime)

      if (result) {
        setSuccess(true)
        setTimeout(() => {
          navigate("/reservations")
        }, 2000)
      } else {
        setError("Échec de la réservation")
      }
    } catch (err) {
      console.error("Reservation failed:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la réservation")
    } finally {
      setIsReserving(false)
    }
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

  if (success) {
    return (
      <>
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-tmdb-navy mb-2">Réservation confirmée!</h2>
            <p className="text-gray-600 mb-6">Votre réservation pour "{movie.title}" a été confirmée.</p>
            <Button
              className="bg-tmdb-teal hover:bg-tmdb-teal/90 text-tmdb-navy"
              onClick={() => navigate("/reservations")}
            >
              Voir mes réservations
            </Button>
          </div>
        </div>
      </>
    )
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
          <h1 className="text-3xl font-bold text-tmdb-navy mb-6">Réserver pour "{movie.title}"</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="rounded-lg overflow-hidden shadow-md">
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
              <div className="bg-white rounded-lg shadow-md p-6">
                {error && (
                  <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
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
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date > addDays(new Date(), 14)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="mb-6">
                  <Label className="text-lg font-medium mb-2 block">Choisir un horaire</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {showTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className={selectedTime === time ? "bg-tmdb-teal text-white" : ""}
                        onClick={() => setSelectedTime(time)}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {time}
                      </Button>
                    ))}
                  </div>
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
                  disabled={!selectedDate || !selectedTime || !user || isReserving}
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
