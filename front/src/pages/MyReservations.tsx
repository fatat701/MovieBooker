"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { getUserReservations, deleteReservation, getFullPosterPath, type Reservation } from "@/services/movieService"
import { useAuth } from "@/contexts/AuthContext"
import { Calendar, Clock, Trash2, Film, ArrowLeft } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

const MyReservations: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user) {
        navigate("/login")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log("Fetching reservations for user:", user.id)
        const data = await getUserReservations(user.id)
        console.log("Reservations fetched:", data)

        if (data.length === 0) {
          console.log("Aucune réservation trouvée pour l'utilisateur")
          setReservations([])
        } else {
          const validReservations = data.filter((reservation) => {
            return (
              reservation.movieTitle &&
              reservation.movieTitle !== "avatar" &&
              reservation.time !== "00:00" &&
              reservation.time &&
              reservation.date
            )
          })

          console.log("Réservations valides après filtrage:", validReservations)
          setReservations(validReservations)
        }
      } catch (err) {
        console.error("Error fetching reservations:", err)
        setError("Erreur lors du chargement des réservations")
        toast.error("Erreur lors du chargement des réservations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [user, navigate])

  const handleDeleteReservation = async (id: string) => {
    setDeletingId(id)
    try {
      console.log("Deleting reservation:", id)
      const success = await deleteReservation(id)
      if (success) {
        console.log("Reservation deleted successfully")
        setReservations((prevReservations) => prevReservations.filter((reservation) => reservation.id !== id))
        toast.success("Réservation supprimée avec succès")
      } else {
        toast.error("Erreur lors de la suppression de la réservation")
      }
    } catch (err) {
      console.error("Error deleting reservation:", err)
      toast.error("Erreur lors de la suppression de la réservation")
    } finally {
      setDeletingId(null)
    }
  }

  const handleSearch = (query: string) => {
    navigate(`/?search=${encodeURIComponent(query)}`)
  }

  const formatDate = (dateString: string): string => {
    try {
      if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        return new Date(dateString).toLocaleDateString()
      }

      if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateString)) {
        return dateString
      }

      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString()
      }

      return dateString || "Date non spécifiée"
    } catch (error) {
      console.error("Erreur de formatage de date:", error, dateString)
      return dateString || "Date non spécifiée"
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const data = await getUserReservations(user?.id || "")
      const validReservations = data.filter((reservation) => {
        return (
          reservation.movieTitle &&
          reservation.movieTitle !== "avatar" &&
          reservation.time !== "00:00" &&
          reservation.time &&
          reservation.date
        )
      })
      setReservations(validReservations)
      toast.success("Réservations actualisées")
    } catch (err) {
      console.error("Error refreshing reservations:", err)
      toast.error("Erreur lors de l'actualisation des réservations")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null 
  }

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>

          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tmdb-teal mr-2"></div>
            ) : (
              "Actualiser"
            )}
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-tmdb-navy mb-6">Mes Réservations</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tmdb-teal"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-500 mb-4">Aucune réservation trouvée</h2>
            <p className="text-gray-500 mb-6">
              Vous n'avez pas encore de réservations ou elles n'ont pas pu être récupérées.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-tmdb-teal hover:bg-tmdb-teal/90 text-tmdb-navy" onClick={() => navigate("/")}>
                Parcourir les films
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                Réessayer
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="p-4 flex space-x-4">
                  <div className="w-1/3">
                    <div className="rounded overflow-hidden">
                      <img
                        src={getFullPosterPath(reservation.posterPath) || "/placeholder.svg?height=200&width=150"}
                        alt={reservation.movieTitle}
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          console.log("Erreur de chargement d'image:", reservation.posterPath)
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=200&width=150"
                        }}
                      />
                    </div>
                  </div>

                  <div className="w-2/3">
                    <h3 className="font-bold text-lg mb-2 text-tmdb-navy">{reservation.movieTitle}</h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(reservation.date)}</span>
                      </div>

                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{reservation.time || "Horaire non spécifié"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 mt-auto border-t border-gray-100">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmation d'annulation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir annuler votre réservation pour "{reservation.movieTitle}"? Cette
                          action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDeleteReservation(reservation.id)}
                          disabled={deletingId === reservation.id}
                        >
                          {deletingId === reservation.id ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Suppression...
                            </div>
                          ) : (
                            "Confirmer l'annulation"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default MyReservations
