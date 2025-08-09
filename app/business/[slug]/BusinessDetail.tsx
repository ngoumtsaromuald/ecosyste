'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Star, 
  Eye, 
  Share2, 
  Heart,
  Crown,
  Calendar,
  Navigation,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';

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
  openingHours?: any;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

interface BusinessDetailProps {
  business: Business;
}

export function BusinessDetail({ business }: BusinessDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);

  const handlePhoneClick = () => {
    fetch(`/api/businesses/${business.id}/click`, { method: 'POST' })
      .catch(err => console.error('Erreur compteur clic:', err));
  };

  const handleWebsiteClick = () => {
    fetch(`/api/businesses/${business.id}/click`, { method: 'POST' })
      .catch(err => console.error('Erreur compteur clic:', err));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: business.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers!');
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) return imagePath;
    return `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${business.name} ${business.category.name} business in Cameroon, professional, modern`)}&image_size=landscape_16_9`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour au catalogue
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galerie d'images */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-96">
                <Image
                  src={business.images[currentImageIndex] ? getImageUrl(business.images[currentImageIndex]) : getImageUrl('default')}
                  alt={business.name}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {business.featured && (
                    <span className="bg-yellow-500 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      Mis en avant
                    </span>
                  )}
                  {business.plan === 'PREMIUM' && (
                    <span className="bg-purple-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Premium
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white bg-opacity-90 text-gray-700 hover:bg-opacity-100'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Miniatures */}
              {business.images.length > 1 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2 overflow-x-auto">
                    {business.images.slice(0, 6).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                          index === currentImageIndex 
                            ? 'border-blue-500' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Image
                          src={getImageUrl(image)}
                          alt={`${business.name} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                    {business.images.length > 6 && (
                      <button
                        onClick={() => setShowAllImages(true)}
                        className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        +{business.images.length - 6}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Informations principales */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                    <Link 
                      href={`/category/${business.category.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {business.category.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    {business.viewCount} vues
                  </div>
                </div>

                {/* Note et avis */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= 4 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-medium text-gray-900 ml-2">4.0</span>
                    <span className="text-gray-600">(12 avis)</span>
                  </div>
                </div>

                {/* Description */}
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{business.description}</p>
                </div>
              </div>

              {/* Actions principales */}
              <div className="flex flex-wrap gap-3">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    onClick={handlePhoneClick}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Appeler maintenant
                  </a>
                )}
                
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWebsiteClick}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    Site web
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                  Itinéraire
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations de contact */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h3>
              
              <div className="space-y-4">
                {business.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{business.phone}</div>
                      <div className="text-sm text-gray-600">Téléphone</div>
                    </div>
                  </div>
                )}
                
                {business.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{business.email}</div>
                      <div className="text-sm text-gray-600">Email</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">{business.address}</div>
                    <div className="text-sm text-gray-600">{business.city}, {business.region}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horaires d'ouverture */}
            {business.openingHours && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horaires d'ouverture
                </h3>
                
                <div className="space-y-2">
                  {Object.entries(business.openingHours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-gray-700 capitalize">{day}</span>
                      <span className="text-gray-900 font-medium">
                        {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Membre depuis {formatDate(business.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {business.viewCount} vues au total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}