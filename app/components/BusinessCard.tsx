'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Globe, Star, Eye, Crown } from 'lucide-react';
import { useCallback, useMemo } from 'react';

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

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  // Add defensive checks for business data
  if (!business || !business.name) {
    return null;
  }

  const handlePhoneClick = useCallback(() => {
    // Incrémenter le compteur de clics (optionnel)
    fetch(`/api/businesses/${business.id}/click`, { method: 'POST' })
      .catch(err => console.error('Erreur compteur clic:', err));
  }, [business.id]);

  const handleWebsiteClick = useCallback(() => {
    // Incrémenter le compteur de clics (optionnel)
    fetch(`/api/businesses/${business.id}/click`, { method: 'POST' })
      .catch(err => console.error('Erreur compteur clic:', err));
  }, [business.id]);

  const formatDistance = useCallback((distance?: number) => {
    if (!distance) return null;
    return distance < 1 
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  }, []);

  const imageUrl = useMemo(() => {
    if (business.images?.[0] && business.images[0].startsWith('http')) {
      return business.images[0];
    }
    const categoryName = business.category?.name || 'business';
    return `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${business.name} ${categoryName} business in Cameroon, professional, modern`)}&image_size=landscape_4_3`;
  }, [business.images, business.name, business.category?.name]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden card-hover group">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        <Image
          src={imageUrl}
          alt={business.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          onError={(e) => {
            console.warn('Image failed to load:', imageUrl);
          }}
          priority={false}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {business.featured && (
            <span className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Mis en avant
            </span>
          )}
          {business.plan === 'PREMIUM' && (
            <span className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Premium
            </span>
          )}
        </div>

        {/* Distance */}
        {business.distance && (
          <div className="absolute top-3 right-3">
            <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
              {formatDistance(business.distance)}
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* En-tête */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <Link 
              href={`/business/${business.slug}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
            >
              {business.name}
            </Link>
            <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
              <Eye className="w-4 h-4" />
              {business.viewCount || 0}
            </div>
          </div>
          
          {business.category && (
            <Link 
              href={`/category/${business.category.slug}`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {business.category.name}
            </Link>
          )}
        </div>

        {/* Description */}
        {business.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {business.description}
          </p>
        )}

        {/* Localisation */}
        {(business.city || business.region) && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {[business.city, business.region].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              onClick={handlePhoneClick}
              className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              Appeler
            </a>
          )}
          
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWebsiteClick}
              className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Globe className="w-4 h-4" />
              Site web
            </a>
          )}
        </div>

        {/* Note et avis (placeholder) */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= 4 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">4.0 (12 avis)</span>
          </div>
          
          <Link
            href={`/business/${business.slug}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir détails →
          </Link>
        </div>
      </div>
    </div>
  );
}