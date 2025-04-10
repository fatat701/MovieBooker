"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, SortAsc, SortDesc } from "lucide-react"
import { toast } from "sonner"

interface SortControlsProps {
  onSort: (sortField: "title" | "release_date" | "vote_average", direction: "asc" | "desc") => void
}

const SortControls: React.FC<SortControlsProps> = ({ onSort }) => {
  const handleSort = (field: "title" | "release_date" | "vote_average", direction: "asc" | "desc") => {
    console.log(`Tri par ${field} en ordre ${direction}`)
    try {
      onSort(field, direction)
    } catch (error) {
      console.error("Erreur lors du tri:", error)
      toast.error("Erreur lors du tri des films")
    }
  }

  const getFieldName = (field: string): string => {
    switch (field) {
      case "title":
        return "titre"
      case "release_date":
        return "date de sortie"
      case "vote_average":
        return "note"
      default:
        return field
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700">Trier par:</span>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => handleSort("title", "asc")}
      >
        <SortAsc className="h-4 w-4" />
        Titre
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => handleSort("release_date", "desc")}
      >
        <SortDesc className="h-4 w-4" />
        Date
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => handleSort("vote_average", "desc")}
      >
        <ArrowUpDown className="h-4 w-4" />
        Note
      </Button>
    </div>
  )
}

export default SortControls
