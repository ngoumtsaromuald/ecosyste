'use client';

import { Search, MapPin, Star } from 'lucide-react';
import { useState } from 'react';

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Rediriger vers la recherche avec les paramètres
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (location) params.set('city', location);
    window.location.href = `/?${params.toString()}`;
  };

  return (
    <section className="gradient-bg text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Trouvez les meilleures entreprises du Cameroun
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Découvrez, comparez et contactez facilement les services locaux près de chez vous
          </p>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg p-2 shadow-lg max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Que recherchez-vous ?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ville ou région"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Rechercher
              </button>
            </div>
          </form>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Entreprises référencées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Catégories de services</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold mr-2">4.8</span>
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-blue-100">Note moyenne</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}