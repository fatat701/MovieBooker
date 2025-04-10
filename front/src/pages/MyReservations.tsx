"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { getUserReservations, deleteReservation, type Reservation } from "@/services/movieService"
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

const MyReservations: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user) {
        navigate("/login")
        return
      }

      setIsLoading(true)
      const data = await getUserReservations(user.id)
      setReservations(data)
      setIsLoading(false)
    }

    fetchReservations()
  }, [user, navigate])

  const handleDeleteReservation = async (id: string) => {
    setDeletingId(id)
    try {
      const success = await deleteReservation(id)
      if (success) {
        setReservations((prevReservations) =>
          prevReservations.filter((reservation) => reservation.id.toString() !== id),
        )
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleSearch = (query: string) => {
    navigate(`/?search=${encodeURIComponent(query)}`)
  }

  if (!user) {
    return null // This should be handled by the useEffect redirect
  }

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Button>

        <h1 className="text-3xl font-bold text-tmdb-navy mb-6">Mes Réservations</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tmdb-teal"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-500 mb-4">Aucune réservation trouvée</h2>
            <Button className="bg-tmdb-teal hover:bg-tmdb-teal/90 text-tmdb-navy" onClick={() => navigate("/")}>
              Parcourir les films
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="p-4 flex space-x-4">
                  <div className="w-full">
                    <h3 className="font-bold text-lg mb-2 text-tmdb-navy">{reservation.movieTitle}</h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(reservation.startTime).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(reservation.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
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
                          onClick={() => handleDeleteReservation(reservation.id.toString())}
                          disabled={deletingId === reservation.id.toString()}
                        >
                          {deletingId === reservation.id.toString() ? (
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
