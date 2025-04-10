"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Film } from "lucide-react"
import { toast } from "sonner"

const Login: React.FC = () => {
  const { login, isLoading, error, user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (user) {
      const from = location.state?.from || "/"
      navigate(from)
    }
  }, [user, navigate, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email || !password) {
      setFormError("Tous les champs sont obligatoires")
      return
    }

    const success = await login(email, password)

    if (success) {
      toast.success("Connexion réussie !")
      const from = location.state?.from || "/"
      navigate(from)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex items-center mb-8">
        <Film className="h-10 w-10 text-tmdb-teal mr-2" />
        <h1 className="text-3xl font-bold text-tmdb-navy">MovieBooker</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>Entrez vos identifiants pour accéder à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          {(formError || error) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError || error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Button variant="link" className="p-0 h-auto text-xs">
                  Mot de passe oublié?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-tmdb-teal hover:bg-tmdb-teal/90" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Pas encore de compte?{" "}
            <Link to="/register" className="text-tmdb-teal hover:underline">
              S'inscrire
            </Link>
          </p>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-sm text-gray-500">© 2025 MovieBooker. Tous droits réservés.</p>
    </div>
  )
}

export default Login
