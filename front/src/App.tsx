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
   
      <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />

 
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/movies/:id" element={<MovieDetail />} />

      
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
