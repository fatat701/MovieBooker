
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, SortAsc, SortDesc } from 'lucide-react';

interface SortControlsProps {
  onSort: (sortField: 'title' | 'release_date' | 'vote_average', direction: 'asc' | 'desc') => void;
}

const SortControls: React.FC<SortControlsProps> = ({ onSort }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700">Trier par:</span>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => onSort('title', 'asc')}
      >
        <SortAsc className="h-4 w-4" />
        Titre
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => onSort('release_date', 'desc')}
      >
        <SortDesc className="h-4 w-4" />
        Date
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => onSort('vote_average', 'desc')}
      >
        <ArrowUpDown className="h-4 w-4" />
        Note
      </Button>
    </div>
  );
};

export default SortControls;
