'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Globe, Star, Eye, Crown } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
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
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-sm">
              <Crown className="w-3 h-3 mr-1" />
              Mis en avant
            </Badge>
          )}
          {business.plan === 'PREMIUM' && (
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-sm">
              Premium
            </Badge>
          )}
        </div>

        {/* Distance */}
        {business.distance && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-black/70 text-white border-0 backdrop-blur-sm">
              {formatDistance(business.distance)}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-0">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <Link 
              href={`/business/${business.slug}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
            >
              {business.name}
            </Link>
            <Badge variant="outline" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              {business.viewCount || 0}
            </Badge>
          </div>
          
          {business.category && (
            <Badge variant="secondary" className="w-fit">
              <Link 
                href={`/category/${business.category.slug}`}
                className="text-sm hover:underline"
              >
                {business.category.name}
              </Link>
            </Badge>
          )}
        </CardHeader>

        <div className="px-6 pb-4 space-y-3">
          {/* Description */}
          {business.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {business.description}
            </p>
          )}

          {/* Localisation */}
          {(business.city || business.region) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {[business.city, business.region].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2">
            {business.phone && (
              <Button
                asChild
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <a
                  href={`tel:${business.phone}`}
                  onClick={handlePhoneClick}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Appeler
                </a>
              </Button>
            )}
            
            {business.website && (
              <Button
                asChild
                size="sm"
                variant="outline"
              >
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWebsiteClick}
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Site web
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Note et avis (placeholder) */}
        <div className="px-6 pb-6 pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
              <span className="text-sm text-muted-foreground">4.0 (12 avis)</span>
            </div>
            
            <Button asChild variant="ghost" size="sm">
              <Link href={`/business/${business.slug}`}>
                Voir détails →
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}