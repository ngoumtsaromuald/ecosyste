'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, X, MapPin, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FilterState {
  search: string;
  category: string;
  city: string;
  region: string;
  featured: boolean;
  sortBy: string;
}

export function SearchFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    region: searchParams.get('region') || '',
    featured: searchParams.get('featured') === 'true',
    sortBy: searchParams.get('sortBy') || 'createdAt',
  });

  // Charger les catégories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.data || []))
      .catch(err => console.error('Erreur chargement catégories:', err));
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Mettre à jour l'URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== '' && v !== false && v !== null && v !== undefined) {
        params.set(k, v.toString());
      }
    });
    
    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      region: '',
      featured: false,
      sortBy: 'createdAt',
    });
    router.push('/');
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '' && v !== false && v !== 'createdAt').length;

  return (
    <Card className="shadow-md border-0">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 p-0 h-auto font-medium"
          >
            <Filter className="w-5 h-5" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <Badge className="bg-blue-600 text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Effacer tout
            </Button>
          )}
        </div>
      </CardHeader>

      {showFilters && (
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche textuelle */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Recherche
              </label>
              <Input
                type="text"
                placeholder="Nom d'entreprise, service..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full h-9 px-3 py-1 text-sm border border-input bg-background rounded-md focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ville */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Ville
              </label>
              <Input
                type="text"
                placeholder="Douala, Yaoundé..."
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            {/* Tri */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Trier par
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full h-9 px-3 py-1 text-sm border border-input bg-background rounded-md focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              >
                <option value="createdAt">Plus récent</option>
                <option value="name">Nom A-Z</option>
                <option value="viewCount">Plus populaire</option>
                <option value="featured">Mis en avant</option>
              </select>
            </div>
          </div>

          {/* Options supplémentaires */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="w-4 h-4 text-primary border-input rounded focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Entreprises mises en avant</span>
            </label>
          </div>
        </CardContent>
      )}
    </Card>
  );
}