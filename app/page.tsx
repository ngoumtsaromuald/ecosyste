import { Suspense } from 'react';
import { BusinessCatalog } from './components/BusinessCatalog';
import { SearchFilters } from './components/SearchFilters';
import { HeroSection } from './components/HeroSection';
import { LoadingSpinner } from './components/LoadingSpinner';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Section Hero */}
      <HeroSection />
      
      {/* Section Catalogue */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Découvrez les entreprises du Cameroun
          </h2>
          <p className="text-gray-600 text-lg">
            Trouvez facilement les services et entreprises près de chez vous
          </p>
        </div>

        {/* Filtres de recherche */}
        <div className="mb-8">
          <Suspense fallback={<div className="h-20 bg-gray-100 rounded-lg animate-pulse" />}>
            <SearchFilters />
          </Suspense>
        </div>

        {/* Catalogue des entreprises */}
        <Suspense fallback={<LoadingSpinner />}>
          <BusinessCatalog />
        </Suspense>
      </div>
    </main>
  );
}