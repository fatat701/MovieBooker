"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { API_ENDPOINTS } from "@/config/api"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  access_token: string
}

interface AuthContextProps {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("mMovieBookerUser")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        console.log("Utilisateur chargé depuis localStorage:", userData)
        setUser(userData)
      } catch (err) {
        console.error("Error parsing stored user:", err)
        localStorage.removeItem("mMovieBookerUser")
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Tentative de connexion à:", API_ENDPOINTS.LOGIN)
      console.log("Avec les identifiants:", { email, password: "***" })

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("Réponse du serveur:", response.status, response.statusText)

      const data = await response.json()
      console.log("Données reçues:", data)

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la connexion")
      }

      const userData = {
        id: data.id || data.userId || "1",
        name: data.name || data.username || "Utilisateur",
        email: email,
        access_token: data.access_token || data.token,
      }

      console.log("Données utilisateur formatées:", userData)

      if (!userData.access_token) {
        throw new Error("Token d'authentification manquant dans la réponse")
      }

      setUser(userData)
      localStorage.setItem("mMovieBookerUser", JSON.stringify(userData))
      toast.success("Connexion réussie !")
      return true
    } catch (err) {
      console.error("Erreur de connexion:", err)
      setError(err.message || "Erreur lors de la connexion")
      toast.error(err.message || "Erreur lors de la connexion")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Tentative d'inscription à:", API_ENDPOINTS.REGISTER)
      console.log("Avec les données:", { name, email, password: "***" })

      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      console.log("Réponse du serveur:", response.status, response.statusText)

      const data = await response.json()
      console.log("Données reçues:", data)

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription")
      }

      // Si l'API renvoie directement un token après inscription
      if (data.access_token || data.token) {
        const userData = {
          id: data.id || data.userId || "1",
          name: name,
          email: email,
          access_token: data.access_token || data.token,
        }

        console.log("Données utilisateur formatées:", userData)

        setUser(userData)
        localStorage.setItem("mMovieBookerUser", JSON.stringify(userData))
        toast.success("Inscription réussie !")
        return true
      } else {
        // Sinon, faire un login automatique
        console.log("Pas de token dans la réponse, tentative de connexion automatique...")
        return await login(email, password)
      }
    } catch (err) {
      console.error("Erreur d'inscription:", err)
      setError(err.message || "Erreur lors de l'inscription")
      toast.error(err.message || "Erreur lors de l'inscription")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("mMovieBookerUser")
    toast.success("Déconnexion réussie")
    // Rediriger vers la page d'accueil après déconnexion
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
