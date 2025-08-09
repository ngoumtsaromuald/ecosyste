'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, X, MapPin, Star } from 'lucide-react';

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
      if (v && v !== '' && v !== false) {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* En-tête des filtres */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            Effacer tout
          </button>
        )}
      </div>

      {/* Contenu des filtres */}
      {showFilters && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche textuelle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <input
                type="text"
                placeholder="Nom d'entreprise, service..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ville
              </label>
              <input
                type="text"
                placeholder="Douala, Yaoundé..."
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt">Plus récent</option>
                <option value="name">Nom A-Z</option>
                <option value="viewCount">Plus populaire</option>
                <option value="featured">Mis en avant</option>
              </select>
            </div>
          </div>

          {/* Options supplémentaires */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-700">Entreprises mises en avant</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}