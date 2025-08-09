'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BusinessCard } from './BusinessCard';
import { Pagination } from './Pagination';
import { LoadingSpinner } from './LoadingSpinner';
import { AlertCircle } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  description: string;
  slug: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  status: string;
  plan: string;
  featured: boolean;
  viewCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

interface BusinessListResponse {
  data: Business[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function BusinessCatalog() {
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [meta, setMeta] = useState<BusinessListResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Construire les paramètres de requête
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', limit.toString());
        
        // Ajouter les filtres de recherche
        const filters = ['search', 'category', 'city', 'region', 'featured', 'sortBy', 'sortOrder'];
        filters.forEach(filter => {
          const value = searchParams.get(filter);
          if (value) params.set(filter, value);
        });

        const response = await fetch(`/api/businesses?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data: BusinessListResponse = await response.json();
        setBusinesses(data.data);
        setMeta(data.meta);
      } catch (err) {
        console.error('Erreur lors du chargement des entreprises:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [searchParams, currentPage, limit]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entreprise trouvée</h3>
        <p className="text-gray-600 mb-4">
          Essayez de modifier vos critères de recherche ou explorez d'autres catégories.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="btn-secondary"
        >
          Voir toutes les entreprises
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête des résultats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {meta?.total} entreprise{(meta?.total || 0) > 1 ? 's' : ''} trouvée{(meta?.total || 0) > 1 ? 's' : ''}
          </h3>
          <p className="text-sm text-gray-600">
            Page {meta?.page} sur {meta?.totalPages}
          </p>
        </div>
        
        {/* Options d'affichage */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Affichage:</span>
          <select 
            value={limit}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('limit', e.target.value);
              params.set('page', '1'); // Reset à la page 1
              window.location.href = `/?${params.toString()}`;
            }}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="12">12 par page</option>
            <option value="24">24 par page</option>
            <option value="48">48 par page</option>
          </select>
        </div>
      </div>

      {/* Grille des entreprises */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          hasNext={meta.hasNext}
          hasPrev={meta.hasPrev}
        />
      )}
    </div>
  );
}