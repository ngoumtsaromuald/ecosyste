# Feature 009: Fonctionnalités Avancées

## Description
Implémentation des fonctionnalités avancées pour améliorer l'expérience utilisateur et la compétitivité de la plateforme ECOSYSTE.

## Objectifs
- Implémenter la recherche géospatiale avancée
- Développer un système de recommandations IA
- Créer des analytics en temps réel
- Ajouter des fonctionnalités de géolocalisation
- Implémenter la recherche vocale
- Développer des notifications push intelligentes

## Tâches Techniques

### Backend (NestJS)

#### 1. Service de Géolocalisation
```typescript
// src/modules/geolocation/geolocation.service.ts
@Injectable()
export class GeolocationService {
  async findNearbyBusinesses(
    latitude: number,
    longitude: number,
    radius: number = 5000
  ) {
    return await this.prisma.business.findMany({
      where: {
        AND: [
          {
            latitude: {
              gte: latitude - (radius / 111000),
              lte: latitude + (radius / 111000)
            }
          },
          {
            longitude: {
              gte: longitude - (radius / (111000 * Math.cos(latitude * Math.PI / 180))),
              lte: longitude + (radius / (111000 * Math.cos(latitude * Math.PI / 180)))
            }
          }
        ]
      },
      include: {
        category: true,
        reviews: true
      }
    });
  }

  async calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
```

#### 2. Service de Recommandations IA
```typescript
// src/modules/ai/recommendation.service.ts
@Injectable()
export class RecommendationService {
  private readonly openai: OpenAI;

  async getPersonalizedRecommendations(userId: string, preferences: any) {
    const userHistory = await this.getUserSearchHistory(userId);
    const prompt = this.buildRecommendationPrompt(userHistory, preferences);
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    return this.parseRecommendations(response.choices[0].message.content);
  }

  async getSimilarBusinesses(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: { category: true }
    });

    return await this.prisma.business.findMany({
      where: {
        AND: [
          { id: { not: businessId } },
          { categoryId: business.categoryId },
          {
            OR: [
              { city: business.city },
              { region: business.region }
            ]
          }
        ]
      },
      take: 10,
      orderBy: { rating: 'desc' }
    });
  }
}
```

#### 3. Service Analytics Temps Réel
```typescript
// src/modules/analytics/realtime-analytics.service.ts
@Injectable()
export class RealtimeAnalyticsService {
  constructor(
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async trackEvent(event: AnalyticsEvent) {
    // Stocker dans Redis pour les stats temps réel
    await this.redisService.zadd(
      `analytics:${event.type}:${format(new Date(), 'yyyy-MM-dd-HH')}`,
      Date.now(),
      JSON.stringify(event)
    );

    // Émettre l'événement pour les WebSockets
    this.eventEmitter.emit('analytics.event', event);

    // Mettre à jour les compteurs
    await this.updateCounters(event);
  }

  async getRealTimeStats(timeframe: string = '1h') {
    const now = new Date();
    const keys = this.generateTimeKeys(now, timeframe);
    
    const stats = await Promise.all(
      keys.map(key => this.redisService.zcard(key))
    );

    return {
      totalEvents: stats.reduce((sum, count) => sum + count, 0),
      timeline: keys.map((key, index) => ({
        time: key.split(':').pop(),
        count: stats[index]
      }))
    };
  }
}
```

#### 4. Service de Recherche Vocale
```typescript
// src/modules/voice/voice-search.service.ts
@Injectable()
export class VoiceSearchService {
  async processVoiceQuery(audioBuffer: Buffer): Promise<string> {
    // Utiliser un service de speech-to-text (ex: Google Speech API)
    const transcript = await this.speechToText(audioBuffer);
    return this.processNaturalLanguageQuery(transcript);
  }

  private async processNaturalLanguageQuery(query: string): Promise<any> {
    // Utiliser NLP pour extraire l'intention et les entités
    const intent = await this.extractIntent(query);
    const entities = await this.extractEntities(query);

    return await this.executeSearch(intent, entities);
  }

  private async extractIntent(query: string): Promise<string> {
    // Logique d'extraction d'intention
    const keywords = {
      'search': ['cherche', 'trouve', 'recherche'],
      'nearby': ['près', 'proche', 'autour'],
      'category': ['restaurant', 'hôtel', 'magasin']
    };

    for (const [intent, words] of Object.entries(keywords)) {
      if (words.some(word => query.toLowerCase().includes(word))) {
        return intent;
      }
    }

    return 'general_search';
  }
}
```

### Frontend (Next.js)

#### 1. Composant de Carte Interactive
```typescript
// app/components/InteractiveMap.tsx
'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export function InteractiveMap({ businesses, center, onLocationSelect }) {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Erreur géolocalisation:', error)
      );
    }
  }, []);

  return (
    <MapContainer center={center} zoom={13} className="h-96 w-full rounded-lg">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>Votre position</Popup>
        </Marker>
      )}
      
      {businesses.map((business) => (
        <Marker
          key={business.id}
          position={[business.latitude, business.longitude]}
          eventHandlers={{
            click: () => onLocationSelect(business)
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{business.name}</h3>
              <p className="text-sm text-gray-600">{business.address}</p>
              <p className="text-sm">⭐ {business.rating}/5</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

#### 2. Composant de Recherche Vocale
```typescript
// app/components/VoiceSearch.tsx
'use client';
export function VoiceSearch({ onResults }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        
        // Envoyer la requête vocale au backend
        const results = await fetch('/api/voice-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: transcript })
        }).then(res => res.json());
        
        onResults(results);
      };

      recognition.start();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={startListening}
        disabled={isListening}
        className={`${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}
      >
        {isListening ? (
          <MicIcon className="h-4 w-4" />
        ) : (
          <MicOffIcon className="h-4 w-4" />
        )}
      </Button>
      {transcript && (
        <span className="text-sm text-gray-600">"{transcript}"</span>
      )}
    </div>
  );
}
```

#### 3. Dashboard Analytics Temps Réel
```typescript
// app/dashboard/analytics/realtime/page.tsx
export default function RealtimeAnalytics() {
  const [stats, setStats] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connexion WebSocket pour les données temps réel
    const ws = new WebSocket('ws://localhost:3001/analytics');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStats(prevStats => ({
        ...prevStats,
        ...data
      }));
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Temps Réel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Visiteurs Actifs"
          value={stats?.activeUsers || 0}
          icon={<UsersIcon />}
        />
        <StatsCard
          title="Recherches/min"
          value={stats?.searchesPerMinute || 0}
          icon={<SearchIcon />}
        />
        <StatsCard
          title="Nouvelles Entreprises"
          value={stats?.newBusinesses || 0}
          icon={<BuildingIcon />}
        />
      </div>
      
      <RealtimeChart data={stats?.timeline || []} />
    </div>
  );
}
```

## Configuration

### Variables d'Environnement
```env
# AI Services
OPENAI_API_KEY=sk-...
GOOGLE_SPEECH_API_KEY=...

# Maps
MAPBOX_ACCESS_TOKEN=pk...
GOOGLE_MAPS_API_KEY=...

# WebSocket
WS_PORT=3001
```

## Tests

### Tests d'Intégration
```typescript
// tests/advanced-features.e2e.spec.ts
describe('Advanced Features E2E', () => {
  it('should find nearby businesses', async () => {
    const response = await request(app)
      .get('/api/businesses/nearby')
      .query({ lat: 4.0511, lng: 9.7679, radius: 5000 })
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should process voice search', async () => {
    const audioBuffer = fs.readFileSync('test-audio.wav');
    const response = await request(app)
      .post('/api/voice-search')
      .attach('audio', audioBuffer)
      .expect(200);

    expect(response.body.results).toBeDefined();
  });
});
```

## Dépendances
```json
{
  "dependencies": {
    "openai": "^4.0.0",
    "@google-cloud/speech": "^6.0.0",
    "leaflet": "^1.9.0",
    "react-leaflet": "^4.2.0",
    "socket.io": "^4.7.0",
    "socket.io-client": "^4.7.0",
    "natural": "^6.0.0",
    "compromise": "^14.0.0"
  }
}
```

## Critères d'Acceptation
- [ ] Recherche géospatiale fonctionnelle
- [ ] Recommandations IA personnalisées
- [ ] Analytics temps réel avec WebSockets
- [ ] Recherche vocale opérationnelle
- [ ] Carte interactive avec géolocalisation
- [ ] Notifications push intelligentes
- [ ] Performance optimisée (< 2s)
- [ ] Interface responsive
- [ ] Tests automatisés complets

## Métriques de Succès
- Augmentation de 40% de l'engagement utilisateur
- Précision des recommandations > 85%
- Temps de réponse recherche vocale < 3s
- Taux d'utilisation des fonctionnalités > 60%

## Intégrations
- OpenAI GPT-4 pour les recommandations
- Google Speech-to-Text API
- Services de cartographie (Leaflet/Mapbox)
- WebSocket pour temps réel
- Services de géolocalisation

## Durée Estimée
**15-18 jours**

## Notes Techniques
- Optimiser les requêtes géospatiales avec des index
- Implémenter le cache pour les recommandations
- Utiliser des Web Workers pour le traitement audio
- Prévoir la scalabilité des WebSockets