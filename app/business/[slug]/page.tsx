import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BusinessDetail } from './BusinessDetail';

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

interface PageProps {
  params: {
    slug: string;
  };
}

// Fonction pour récupérer les données de l'entreprise
async function getBusiness(slug: string): Promise<Business | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/businesses/slug/${slug}`, {
      next: { revalidate: 300 }, // Revalidation toutes les 5 minutes
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Erreur ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    return null;
  }
}

// Génération des métadonnées SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const business = await getBusiness(params.slug);
  
  if (!business) {
    return {
      title: 'Entreprise non trouvée - RomAPI',
      description: 'L\'entreprise que vous recherchez n\'existe pas ou n\'est plus disponible.',
    };
  }

  const title = business.seoTitle || `${business.name} - ${business.category.name} à ${business.city}`;
  const description = business.seoDescription || business.description;
  const keywords = business.seoKeywords || [business.name, business.category.name, business.city, business.region, 'Cameroun'];

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'fr_CM',
      images: business.images.length > 0 ? [{
        url: business.images[0],
        width: 1200,
        height: 630,
        alt: business.name,
      }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: business.images.length > 0 ? [business.images[0]] : [],
    },
    alternates: {
      canonical: `/business/${business.slug}`,
    },
    other: {
      'business:contact_data:street_address': business.address,
      'business:contact_data:locality': business.city,
      'business:contact_data:region': business.region,
      'business:contact_data:country_name': 'Cameroun',
      'business:contact_data:phone_number': business.phone,
      'business:contact_data:website': business.website,
    },
  };
}

// Génération des données structurées JSON-LD
function generateJsonLd(business: Business) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    url: business.website,
    telephone: business.phone,
    email: business.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.region,
      addressCountry: 'CM',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    },
    image: business.images,
    priceRange: business.plan === 'PREMIUM' ? '$$$' : '$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.0',
      reviewCount: '12',
    },
    openingHours: business.openingHours ? Object.entries(business.openingHours).map(([day, hours]: [string, any]) => 
      `${day} ${hours.open}-${hours.close}`
    ) : [],
  };
}

export default async function BusinessPage({ params }: PageProps) {
  const business = await getBusiness(params.slug);
  
  if (!business) {
    notFound();
  }

  const jsonLd = generateJsonLd(business);

  return (
    <>
      {/* Données structurées JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Composant de détail de l'entreprise */}
      <BusinessDetail business={business} />
    </>
  );
}

// Génération statique des pages les plus populaires (optionnel)
export async function generateStaticParams() {
  try {
    // Récupérer les entreprises les plus populaires pour la génération statique
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/businesses?limit=50&sortBy=viewCount&sortOrder=desc`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return data.data.map((business: Business) => ({
      slug: business.slug,
    }));
  } catch (error) {
    console.error('Erreur lors de la génération des paramètres statiques:', error);
    return [];
  }
}