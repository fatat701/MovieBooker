"use client"

import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { useAuth } from "@/contexts/AuthContext"

import Home from "./pages/Home"
import MovieDetail from "./pages/MovieDetail"
import ReservationPage from "./pages/ReservationPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import MyReservations from "./pages/MyReservations"
import NotFound from "./pages/NotFound"

const queryClient = new QueryClient()

// Composant de protection des routes qui vérifie si l'utilisateur est connecté
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  return children
}

const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Rediriger vers la page de connexion si l'utilisateur n'est pas connecté */}
      <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />

      {/* Pages accessibles à tous */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/movies/:id" element={<MovieDetail />} />

      {/* Pages protégées qui nécessitent une connexion */}
      <Route
        path="/movies/:id/reserve"
        element={
          <ProtectedRoute>
            <ReservationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <ProtectedRoute>
            <MyReservations />
          </ProtectedRoute>
        }
      />

      {/* Page 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

export default App
