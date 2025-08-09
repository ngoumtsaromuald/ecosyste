'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Camera, 
  Save, 
  Eye,
  Star,
  Upload,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import Image from 'next/image';

interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface BusinessData {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  images: string[];
  hours: BusinessHours[];
  featured: boolean;
  status: 'active' | 'pending' | 'suspended';
}

const categories = [
  'Restaurant',
  'Hôtel',
  'Commerce',
  'Service',
  'Santé',
  'Éducation',
  'Transport',
  'Technologie',
  'Autre'
];

const cities = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Garoua',
  'Maroua',
  'Bamenda',
  'Ngaoundéré',
  'Bertoua',
  'Kribi',
  'Limbe'
];

const daysOfWeek = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche'
];

export default function BusinessManagementPage() {
  const [business, setBusiness] = useState<BusinessData>({
    id: '1',
    name: 'Mon Entreprise',
    description: 'Description de mon entreprise...',
    category: 'Restaurant',
    address: '123 Rue de la Paix',
    city: 'Douala',
    phone: '+237 6XX XXX XXX',
    email: 'contact@monentreprise.cm',
    website: 'https://monentreprise.cm',
    images: [],
    hours: daysOfWeek.map(day => ({
      day,
      open: '08:00',
      close: '18:00',
      closed: day === 'Dimanche'
    })),
    featured: false,
    status: 'active'
  });

  const [isLoading, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleInputChange = (field: keyof BusinessData, value: any) => {
    setBusiness(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (dayIndex: number, field: keyof BusinessHours, value: any) => {
    setBusiness(prev => ({
      ...prev,
      hours: prev.hours.map((hour, index) => 
        index === dayIndex ? { ...hour, [field]: value } : hour
      )
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Simuler l'upload d'images
      const newImages = Array.from(files).map((file, index) => 
        `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=business%20${business.category.toLowerCase()}%20interior&image_size=landscape_4_3`
      );
      setBusiness(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 6) // Max 6 images
      }));
    }
  };

  const removeImage = (index: number) => {
    setBusiness(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Fiche entreprise mise à jour avec succès!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (previewMode) {
    return (
      <div className="space-y-6">
        {/* Header de prévisualisation */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prévisualisation</h1>
            <p className="text-sm text-gray-500">Voici comment votre fiche apparaîtra aux visiteurs</p>
          </div>
          <button
            onClick={() => setPreviewMode(false)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="-ml-1 mr-2 h-4 w-4" />
            Fermer la prévisualisation
          </button>
        </div>

        {/* Prévisualisation de la fiche */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Images */}
          {business.images.length > 0 && (
            <div className="relative h-64">
              <Image
                src={business.images[0]}
                alt={business.name}
                fill
                className="object-cover"
              />
              {business.featured && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Mis en avant
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
                <p className="text-sm text-blue-600 font-medium">{business.category}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                business.status === 'active' ? 'bg-green-100 text-green-800' :
                business.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {business.status === 'active' ? 'Actif' :
                 business.status === 'pending' ? 'En attente' : 'Suspendu'}
              </span>
            </div>

            <p className="mt-4 text-gray-600">{business.description}</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{business.address}, {business.city}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-2" />
                <span>{business.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-2" />
                <span>{business.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Globe className="w-5 h-5 mr-2" />
                <span>{business.website}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ma fiche entreprise</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les informations de votre entreprise sur RomAPI
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setPreviewMode(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Eye className="-ml-1 mr-2 h-4 w-4" />
            Prévisualiser
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="-ml-1 mr-2 h-4 w-4" />
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Message de notification */}
      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Formulaire */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Informations générales</h2>
        </div>
        
        <div className="px-6 py-6 space-y-6">
          {/* Nom et catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                value={business.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom de votre entreprise"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                value={business.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={business.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Décrivez votre entreprise, vos services, ce qui vous rend unique..."
            />
          </div>

          {/* Adresse et ville */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                value={business.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Adresse complète"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <select
                value={business.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                value={business.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="+237 6XX XXX XXX"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={business.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@entreprise.cm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web
              </label>
              <input
                type="url"
                value={business.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://monsite.cm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Images</h2>
          <p className="text-sm text-gray-500">Ajoutez jusqu'à 6 images de votre entreprise</p>
        </div>
        
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {business.images.map((image, index) => (
              <div key={index} className="relative group">
                <Image
                  src={image}
                  alt={`Image ${index + 1}`}
                  width={200}
                  height={150}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {business.images.length < 6 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500">Ajouter une image</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Horaires d'ouverture */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Horaires d'ouverture</h2>
        </div>
        
        <div className="px-6 py-6 space-y-4">
          {business.hours.map((hour, index) => (
            <div key={hour.day} className="flex items-center space-x-4">
              <div className="w-20">
                <span className="text-sm font-medium text-gray-700">{hour.day}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!hour.closed}
                  onChange={(e) => handleHoursChange(index, 'closed', !e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Ouvert</span>
              </div>
              
              {!hour.closed && (
                <>
                  <input
                    type="time"
                    value={hour.open}
                    onChange={(e) => handleHoursChange(index, 'open', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">à</span>
                  <input
                    type="time"
                    value={hour.close}
                    onChange={(e) => handleHoursChange(index, 'close', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </>
              )}
              
              {hour.closed && (
                <span className="text-sm text-gray-500 italic">Fermé</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}