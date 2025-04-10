"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Film, Search, User, LogIn, LogOut } from "lucide-react"

interface NavbarProps {
  onSearch: (query: string) => void
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <header className="sticky top-0 z-50 bg-tmdb-navy shadow-md">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-tmdb-teal" />
            <span className="text-2xl font-bold text-white">MovieBooker</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un film..."
                className="w-full pl-10 bg-white/10 text-white placeholder:text-gray-400 border-gray-700 focus:border-tmdb-teal"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/reservations">
                  <Button variant="ghost" className="text-white hover:text-tmdb-teal hover:bg-tmdb-navy/50">
                    Mes Réservations
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-tmdb-teal" />
                  <span className="text-white">{user.name || user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => logout()}
                  className="text-white hover:text-tmdb-teal hover:bg-tmdb-navy/50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-white hover:text-tmdb-teal hover:bg-tmdb-navy/50"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Connexion
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="bg-tmdb-teal hover:bg-tmdb-teal/80 text-tmdb-navy"
                >
                  Inscription
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
