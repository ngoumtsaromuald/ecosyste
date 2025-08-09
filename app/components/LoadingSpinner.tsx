'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin mb-4`} />
      {text && (
        <p className="text-gray-600 text-sm">{text}</p>
      )}
      {!text && (
        <p className="text-gray-600 text-sm">Chargement en cours...</p>
      )}
    </div>
  );
}

// Composant de skeleton pour les cartes d'entreprises
export function BusinessCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200" />
      
      {/* Contenu skeleton */}
      <div className="p-4">
        {/* Titre */}
        <div className="h-6 bg-gray-200 rounded mb-2" />
        
        {/* Catégorie */}
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        
        {/* Description */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        
        {/* Localisation */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        
        {/* Actions */}
        <div className="flex gap-2 mb-3">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-24" />
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

// Grille de skeletons pour le catalogue
export function BusinessCatalogSkeleton() {
  return (
    <div>
      {/* En-tête skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
      
      {/* Grille de cartes skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <BusinessCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}