# Feature 007: Marketing & SEO

## Description
Implémentation d'une stratégie marketing complète et d'optimisation SEO pour améliorer la visibilité de la plateforme ECOSYSTE et attirer plus d'entreprises et d'utilisateurs.

## Objectifs
- Optimiser le référencement naturel (SEO)
- Implémenter le marketing de contenu
- Mettre en place des campagnes publicitaires ciblées
- Développer une stratégie de médias sociaux
- Créer un système d'analytics et de tracking

## Tâches Techniques

### Backend (NestJS)

#### 1. Service SEO et Métadonnées
```typescript
// services/seo.service.ts
@Injectable()
export class SeoService {
  async generateBusinessSeoData(businessId: string): Promise<SeoData> {
    const business = await this.businessService.findById(businessId);
    
    return {
      title: `${business.name} - ${business.category} à ${business.city}`,
      description: `Découvrez ${business.name}, ${business.category} situé à ${business.address}, ${business.city}. ${business.description?.substring(0, 150)}...`,
      keywords: [
        business.name.toLowerCase(),
        business.category.toLowerCase(),
        business.city.toLowerCase(),
        'cameroun',
        'entreprise',
        'business'
      ],
      canonicalUrl: `https://ecosyste.cm/business/${business.slug}`,
      ogImage: business.images?.[0] || '/default-business.jpg',
      structuredData: this.generateBusinessStructuredData(business)
    };
  }

  private generateBusinessStructuredData(business: any): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: business.name,
      description: business.description,
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address,
        addressLocality: business.city,
        addressCountry: 'CM'
      },
      telephone: business.phone,
      url: `https://ecosyste.cm/business/${business.slug}`,
      image: business.images,
      priceRange: business.priceRange,
      aggregateRating: business.rating ? {
        '@type': 'AggregateRating',
        ratingValue: business.rating,
        reviewCount: business.reviewCount
      } : undefined
    };
  }

  async generateSitemap(): Promise<string> {
    const businesses = await this.businessService.findAllActive();
    const categories = await this.categoryService.findAll();
    
    const urls = [
      { loc: 'https://ecosyste.cm', priority: '1.0', changefreq: 'daily' },
      { loc: 'https://ecosyste.cm/businesses', priority: '0.9', changefreq: 'daily' },
      ...categories.map(cat => ({
        loc: `https://ecosyste.cm/category/${cat.slug}`,
        priority: '0.8',
        changefreq: 'weekly'
      })),
      ...businesses.map(business => ({
        loc: `https://ecosyste.cm/business/${business.slug}`,
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: business.updatedAt.toISOString()
      }))
    ];

    return this.buildXmlSitemap(urls);
  }
}
```

#### 2. Service d'Analytics
```typescript
// services/analytics.service.ts
@Injectable()
export class AnalyticsService {
  async trackPageView(data: PageViewData): Promise<void> {
    await this.analyticsRepository.create({
      type: 'page_view',
      url: data.url,
      referrer: data.referrer,
      userAgent: data.userAgent,
      ipAddress: this.hashIp(data.ipAddress),
      sessionId: data.sessionId,
      timestamp: new Date()
    });
  }

  async trackBusinessView(businessId: string, sessionId: string): Promise<void> {
    await this.analyticsRepository.create({
      type: 'business_view',
      businessId,
      sessionId,
      timestamp: new Date()
    });

    // Incrémenter le compteur de vues
    await this.businessService.incrementViewCount(businessId);
  }

  async trackSearch(query: string, results: number, sessionId: string): Promise<void> {
    await this.analyticsRepository.create({
      type: 'search',
      searchQuery: query,
      resultCount: results,
      sessionId,
      timestamp: new Date()
    });
  }

  async getTopSearches(period: 'day' | 'week' | 'month' = 'week'): Promise<SearchStats[]> {
    const startDate = this.getStartDate(period);
    
    return await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.searchQuery', 'query')
      .addSelect('COUNT(*)', 'count')
      .where('analytics.type = :type', { type: 'search' })
      .andWhere('analytics.timestamp >= :startDate', { startDate })
      .groupBy('analytics.searchQuery')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [todayViews, yesterdayViews, weekViews] = await Promise.all([
      this.getPageViewsCount(today),
      this.getPageViewsCount(yesterday),
      this.getPageViewsCount(lastWeek)
    ]);

    return {
      todayViews,
      yesterdayViews,
      weekViews,
      growthRate: ((todayViews - yesterdayViews) / yesterdayViews) * 100
    };
  }
}
```

#### 3. Contrôleur Marketing
```typescript
// controllers/marketing.controller.ts
@Controller('marketing')
export class MarketingController {
  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async getSitemap(): Promise<string> {
    return await this.seoService.generateSitemap();
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  getRobotsTxt(): string {
    return `User-agent: *
Allow: /
Sitemap: https://ecosyste.cm/sitemap.xml

User-agent: Googlebot
Allow: /

Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/`;
  }

  @Post('analytics/track')
  async trackEvent(@Body() data: AnalyticsEvent): Promise<void> {
    await this.analyticsService.trackEvent(data);
  }

  @Get('analytics/stats')
  @UseGuards(AdminGuard)
  async getAnalyticsStats(): Promise<any> {
    return await this.analyticsService.getDashboardStats();
  }
}
```

### Frontend (Next.js)

#### 1. Composant SEO
```tsx
// components/SEOHead.tsx
import Head from 'next/head';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage = '/default-og-image.jpg',
  structuredData,
  noIndex = false
}: SEOHeadProps) {
  const fullTitle = title.includes('ECOSYSTE') ? title : `${title} | ECOSYSTE`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `https://ecosyste.cm${ogImage}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  );
}
```

#### 2. Hook d'Analytics
```tsx
// hooks/useAnalytics.ts
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsEvent {
  type: string;
  data?: Record<string, any>;
}

export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view
    trackPageView({
      url: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });
  }, [pathname, searchParams]);

  const trackPageView = async (data: any) => {
    try {
      await fetch('/api/marketing/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'page_view',
          ...data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackEvent = async (event: AnalyticsEvent) => {
    try {
      await fetch('/api/marketing/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Event tracking error:', error);
    }
  };

  const trackBusinessView = async (businessId: string) => {
    await trackEvent({
      type: 'business_view',
      data: { businessId }
    });
  };

  const trackSearch = async (query: string, resultCount: number) => {
    await trackEvent({
      type: 'search',
      data: { query, resultCount }
    });
  };

  return {
    trackEvent,
    trackBusinessView,
    trackSearch
  };
}
```

#### 3. Page de Blog
```tsx
// app/blog/page.tsx
import { Metadata } from 'next';
import SEOHead from '@/components/SEOHead';
import BlogCard from '@/components/BlogCard';

export const metadata: Metadata = {
  title: 'Blog - Actualités et Conseils Business au Cameroun',
  description: 'Découvrez nos articles sur l\'entrepreneuriat, les tendances business et les opportunités au Cameroun.',
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  author: string;
  category: string;
  image: string;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  // Récupération des articles depuis l'API ou CMS
  const response = await fetch('https://api.ecosyste.cm/blog/posts', {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  return response.json();
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ECOSYSTE Blog',
    description: 'Actualités et conseils business au Cameroun',
    url: 'https://ecosyste.cm/blog',
    blogPost: posts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://ecosyste.cm/blog/${post.slug}`,
      datePublished: post.publishedAt,
      author: {
        '@type': 'Person',
        name: post.author
      }
    }))
  };

  return (
    <>
      <SEOHead
        title="Blog - Actualités et Conseils Business"
        description="Découvrez nos articles sur l'entrepreneuriat, les tendances business et les opportunités au Cameroun."
        keywords={['blog', 'business', 'cameroun', 'entrepreneuriat', 'conseils']}
        canonicalUrl="https://ecosyste.cm/blog"
        structuredData={structuredData}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog ECOSYSTE
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Actualités, conseils et tendances pour les entrepreneurs camerounais
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </>
  );
}
```

#### 4. Composant de Newsletter
```tsx
// components/Newsletter.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { trackEvent } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        trackEvent({
          type: 'newsletter_signup',
          data: { email }
        });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-blue-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Restez informé des dernières actualités
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Recevez notre newsletter hebdomadaire avec les meilleures opportunités business
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-4">
          <Input
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={status === 'loading'}
            variant="secondary"
          >
            {status === 'loading' ? 'Inscription...' : 'S\'inscrire'}
          </Button>
        </form>
        
        {status === 'success' && (
          <p className="mt-4 text-green-200">Merci ! Vous êtes maintenant inscrit à notre newsletter.</p>
        )}
        {status === 'error' && (
          <p className="mt-4 text-red-200">Une erreur s'est produite. Veuillez réessayer.</p>
        )}
      </div>
    </div>
  );
}
```

## Configuration SEO

### 1. Next.js SEO Config
```javascript
// next.config.js
module.exports = {
  async generateBuildId() {
    return 'ecosyste-build-' + Date.now();
  },
  
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/marketing/sitemap'
      },
      {
        source: '/robots.txt',
        destination: '/api/marketing/robots'
      }
    ];
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },
  
  images: {
    domains: ['ecosyste.cm', 'images.ecosyste.cm'],
    formats: ['image/webp', 'image/avif']
  }
};
```

### 2. Google Analytics Setup
```tsx
// components/GoogleAnalytics.tsx
'use client';

import Script from 'next/script';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  if (!GA_TRACKING_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}
```

## Stratégie de Contenu

### 1. Calendrier Editorial
```typescript
// types/content.ts
export interface ContentCalendar {
  id: string;
  title: string;
  type: 'blog' | 'social' | 'email' | 'video';
  status: 'draft' | 'review' | 'scheduled' | 'published';
  publishDate: Date;
  author: string;
  category: string;
  keywords: string[];
  description: string;
}

// Exemples de contenu
const contentIdeas = [
  {
    title: "Top 10 des secteurs porteurs au Cameroun en 2024",
    type: "blog",
    category: "Tendances",
    keywords: ["secteurs porteurs", "cameroun", "2024", "investissement"]
  },
  {
    title: "Comment créer son entreprise au Cameroun : Guide complet",
    type: "blog",
    category: "Guides",
    keywords: ["créer entreprise", "cameroun", "guide", "démarches"]
  },
  {
    title: "Success Story : L'histoire de [Entreprise Locale]",
    type: "blog",
    category: "Success Stories",
    keywords: ["success story", "entrepreneur", "cameroun"]
  }
];
```

### 2. Templates d'Email Marketing
```html
<!-- templates/newsletter.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter ECOSYSTE</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 30px;">
            <img src="https://ecosyste.cm/logo.png" alt="ECOSYSTE" style="height: 50px;">
            <h1 style="color: #2563eb;">Newsletter Hebdomadaire</h1>
        </header>
        
        <main>
            <section style="margin-bottom: 30px;">
                <h2 style="color: #1f2937;">🔥 Entreprises de la Semaine</h2>
                <!-- Contenu dynamique -->
            </section>
            
            <section style="margin-bottom: 30px;">
                <h2 style="color: #1f2937;">📈 Tendances Business</h2>
                <!-- Contenu dynamique -->
            </section>
            
            <section style="margin-bottom: 30px;">
                <h2 style="color: #1f2937;">💡 Conseil de la Semaine</h2>
                <!-- Contenu dynamique -->
            </section>
        </main>
        
        <footer style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p>ECOSYSTE - Votre plateforme business au Cameroun</p>
            <p><a href="{{unsubscribe_url}}">Se désabonner</a></p>
        </footer>
    </div>
</body>
</html>
```

## Campagnes Publicitaires

### 1. Configuration Google Ads
```typescript
// services/google-ads.service.ts
@Injectable()
export class GoogleAdsService {
  private readonly adWordsApi = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  });

  async createCampaign(campaignData: CampaignData): Promise<string> {
    const campaign = {
      name: campaignData.name,
      advertising_channel_type: 'SEARCH',
      status: 'ENABLED',
      campaign_budget: {
        amount_micros: campaignData.budgetMicros
      },
      target_cpa: {
        target_cpa_micros: campaignData.targetCpaMicros
      }
    };

    const response = await this.adWordsApi.campaigns.create(campaign);
    return response.resource_name;
  }

  async createAdGroup(campaignId: string, adGroupData: AdGroupData): Promise<string> {
    const adGroup = {
      name: adGroupData.name,
      campaign: campaignId,
      cpc_bid_micros: adGroupData.cpcBidMicros,
      status: 'ENABLED'
    };

    const response = await this.adWordsApi.adGroups.create(adGroup);
    return response.resource_name;
  }
}
```

### 2. Mots-clés Stratégiques
```typescript
// data/keywords.ts
export const strategicKeywords = {
  primary: [
    'entreprise cameroun',
    'business cameroun',
    'annuaire entreprise cameroun',
    'société cameroun',
    'commerce cameroun'
  ],
  secondary: [
    'entreprise douala',
    'entreprise yaoundé',
    'business directory cameroon',
    'cameroon companies',
    'annuaire professionnel cameroun'
  ],
  longTail: [
    'trouver entreprise cameroun',
    'liste entreprises cameroun',
    'répertoire entreprises cameroun',
    'annuaire professionnel douala',
    'directory business cameroon'
  ],
  local: [
    'entreprise douala',
    'entreprise yaoundé',
    'entreprise bafoussam',
    'entreprise garoua',
    'entreprise bamenda'
  ]
};
```

## Tests et Monitoring

```typescript
// tests/seo.service.spec.ts
describe('SeoService', () => {
  let service: SeoService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SeoService]
    }).compile();

    service = module.get<SeoService>(SeoService);
  });

  it('should generate proper SEO data for business', async () => {
    const business = {
      id: '1',
      name: 'Test Business',
      category: 'Restaurant',
      city: 'Douala',
      description: 'A great restaurant in Douala'
    };

    const seoData = await service.generateBusinessSeoData(business.id);
    
    expect(seoData.title).toContain(business.name);
    expect(seoData.description).toContain(business.description);
    expect(seoData.keywords).toContain(business.category.toLowerCase());
  });

  it('should generate valid sitemap', async () => {
    const sitemap = await service.generateSitemap();
    
    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain('<urlset');
    expect(sitemap).toContain('https://ecosyste.cm');
  });
});
```

## Dépendances

```json
{
  "dependencies": {
    "@google-ads/api": "^1.0.0",
    "mailchimp-api-v3": "^1.15.0",
    "sitemap": "^7.1.1",
    "feed": "^4.2.2",
    "sharp": "^0.32.0"
  }
}
```

## Critères d'Acceptation

- [ ] Optimisation SEO complète (métadonnées, sitemap, robots.txt)
- [ ] Système d'analytics et tracking fonctionnel
- [ ] Blog avec système de gestion de contenu
- [ ] Newsletter automatisée
- [ ] Campagnes Google Ads configurées
- [ ] Stratégie de médias sociaux définie
- [ ] Monitoring des performances SEO
- [ ] Tests A/B pour les pages de conversion
- [ ] Intégration Google Search Console
- [ ] Rapports de performance automatisés

## Métriques de Succès

- Augmentation du trafic organique de 200% en 6 mois
- Amélioration du classement pour 50+ mots-clés stratégiques
- Taux de conversion newsletter > 15%
- ROI des campagnes publicitaires > 300%
- Score PageSpeed > 90/100
- Temps de chargement < 2 secondes

## Intégrations

- **Google Analytics**: Tracking avancé
- **Google Search Console**: Monitoring SEO
- **Google Ads**: Campagnes publicitaires
- **Mailchimp**: Email marketing
- **Facebook Ads**: Publicité sociale
- **LinkedIn Ads**: Ciblage B2B

## Durée Estimée
**10-12 jours** (incluant développement, configuration et optimisation)

## Notes Techniques

- Implémenter le lazy loading pour les images
- Utiliser les Web Vitals pour optimiser les performances
- Configurer le cache CDN pour les ressources statiques
- Implémenter le schema markup pour tous les types de contenu
- Créer des landing pages optimisées pour chaque segment
- Mettre en place un système de A/B testing