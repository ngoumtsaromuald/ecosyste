# Feature 005: API Commerciale

## 📋 Description

Développement de l'API commerciale d'ECOSYSTE avec système de tarification, gestion des quotas, documentation interactive et outils pour développeurs tiers.

## 🎯 Objectifs

- API REST complète avec authentification par clé API
- Système de tarification et gestion des quotas
- Documentation interactive (Swagger/OpenAPI)
- SDK et outils pour développeurs
- Monitoring et analytics des API calls

## 🔧 Tâches Techniques

### Backend (NestJS)

#### 1. Architecture API
- [ ] Versioning de l'API (v1, v2, etc.)
- [ ] Middleware d'authentification par API Key
- [ ] Système de rate limiting par plan
- [ ] Gestion des quotas et billing
- [ ] Logging et monitoring des requêtes

#### 2. Endpoints commerciaux
- [ ] GET /api/v1/businesses - Liste des entreprises
- [ ] GET /api/v1/businesses/{id} - Détails d'une entreprise
- [ ] GET /api/v1/search - Recherche avancée
- [ ] GET /api/v1/categories - Liste des catégories
- [ ] GET /api/v1/locations - Liste des villes/régions

#### 3. Gestion des API Keys
- [ ] Génération et révocation des clés
- [ ] Scopes et permissions par clé
- [ ] Rotation automatique des clés
- [ ] Audit trail des utilisations

### Frontend (Next.js)

#### 1. Portail développeur
- [ ] Dashboard de gestion des API Keys
- [ ] Monitoring des quotas et usage
- [ ] Documentation interactive
- [ ] Exemples de code et SDK
- [ ] Support et contact

#### 2. Interface d'administration
- [ ] Gestion des plans tarifaires
- [ ] Monitoring global des APIs
- [ ] Analytics et rapports
- [ ] Gestion des clients API

## 🗄️ Modèles de Données

### API Key
```typescript
model ApiKey {
  id          String      @id @default(cuid())
  key         String      @unique
  name        String
  description String?
  
  // Relations
  user_id     String
  user        User        @relation(fields: [user_id], references: [id])
  plan_id     String
  plan        ApiPlan     @relation(fields: [plan_id], references: [id])
  
  // Configuration
  scopes      String[]    // ["businesses:read", "search:read"]
  is_active   Boolean     @default(true)
  
  // Quotas
  monthly_quota     Int
  current_usage     Int         @default(0)
  last_reset_date   DateTime    @default(now())
  
  // Sécurité
  last_used_at      DateTime?
  last_used_ip      String?
  allowed_origins   String[]    // CORS origins
  
  created_at  DateTime    @default(now())
  updated_at  DateTime    @updatedAt
  expires_at  DateTime?
  
  // Relations
  api_calls   ApiCall[]
  
  @@map("api_keys")
}

model ApiPlan {
  id              String    @id @default(cuid())
  name            String    @unique
  description     String?
  
  // Tarification
  price_monthly   Decimal   @db.Decimal(10,2)
  price_yearly    Decimal?  @db.Decimal(10,2)
  
  // Quotas
  monthly_requests    Int
  rate_limit_per_min  Int       @default(60)
  
  // Fonctionnalités
  features        Json      // {"analytics": true, "webhooks": false}
  
  is_active       Boolean   @default(true)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  // Relations
  api_keys        ApiKey[]
  
  @@map("api_plans")
}

model ApiCall {
  id              String    @id @default(cuid())
  
  // Request info
  api_key_id      String
  api_key         ApiKey    @relation(fields: [api_key_id], references: [id])
  
  endpoint        String
  method          String
  status_code     Int
  response_time   Int       // en millisecondes
  
  // Metadata
  ip_address      String
  user_agent      String?
  referer         String?
  
  // Billing
  billable        Boolean   @default(true)
  cost            Decimal?  @db.Decimal(10,4)
  
  created_at      DateTime  @default(now())
  
  @@map("api_calls")
  @@index([api_key_id, created_at])
  @@index([created_at])
}
```

## 🔑 Authentification API

### Middleware d'authentification
```typescript
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    // Vérification en cache d'abord
    const cachedKey = await this.redis.get(`api_key:${apiKey}`);
    let keyData;

    if (cachedKey) {
      keyData = JSON.parse(cachedKey);
    } else {
      keyData = await this.prisma.apiKey.findUnique({
        where: { key: apiKey, is_active: true },
        include: {
          plan: true,
          user: { select: { id: true, email: true, is_active: true } }
        }
      });

      if (!keyData) {
        throw new UnauthorizedException('Invalid API key');
      }

      // Cache pour 5 minutes
      await this.redis.setex(`api_key:${apiKey}`, 300, JSON.stringify(keyData));
    }

    // Vérifications
    if (!keyData.user.is_active) {
      throw new UnauthorizedException('User account inactive');
    }

    if (keyData.expires_at && new Date() > new Date(keyData.expires_at)) {
      throw new UnauthorizedException('API key expired');
    }

    // Vérification des quotas
    await this.checkQuotas(keyData);

    // Rate limiting
    await this.checkRateLimit(apiKey, keyData.plan.rate_limit_per_min);

    // Mise à jour de la dernière utilisation
    await this.updateLastUsed(keyData.id, request.ip, request.get('User-Agent'));

    // Ajout des infos dans la requête
    request.apiKey = keyData;
    request.user = keyData.user;

    return true;
  }

  private extractApiKey(request: any): string | null {
    // Header Authorization: Bearer <api_key>
    const authHeader = request.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Query parameter
    return request.query.api_key || null;
  }

  private async checkQuotas(keyData: any): Promise<void> {
    const now = new Date();
    const resetDate = new Date(keyData.last_reset_date);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Reset mensuel des quotas
    if (resetDate < monthStart) {
      await this.prisma.apiKey.update({
        where: { id: keyData.id },
        data: {
          current_usage: 0,
          last_reset_date: monthStart
        }
      });
      keyData.current_usage = 0;
    }

    if (keyData.current_usage >= keyData.monthly_quota) {
      throw new ForbiddenException('Monthly quota exceeded');
    }
  }

  private async checkRateLimit(apiKey: string, limitPerMin: number): Promise<void> {
    const key = `rate_limit:${apiKey}`;
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, 60);
    }
    
    if (current > limitPerMin) {
      throw new TooManyRequestsException('Rate limit exceeded');
    }
  }

  private async updateLastUsed(keyId: string, ip: string, userAgent: string): Promise<void> {
    // Mise à jour asynchrone pour ne pas ralentir la requête
    setImmediate(async () => {
      await this.prisma.apiKey.update({
        where: { id: keyId },
        data: {
          last_used_at: new Date(),
          last_used_ip: ip,
          current_usage: { increment: 1 }
        }
      });
    });
  }
}
```

## 📊 Endpoints API

### Controller principal
```typescript
@Controller('api/v1')
@UseGuards(ApiKeyGuard)
@ApiTags('Commercial API')
export class CommercialApiController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('businesses')
  @ApiOperation({ summary: 'List businesses' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'verified', required: false, type: Boolean })
  async getBusinesses(
    @Query() query: GetBusinessesDto,
    @Req() request: any,
  ): Promise<ApiResponse<Business[]>> {
    // Log de l'appel API
    await this.logApiCall(request, 'GET', '/api/v1/businesses');

    const { data, total, page, limit } = await this.businessService.findMany(query);

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        quota_remaining: request.apiKey.monthly_quota - request.apiKey.current_usage
      }
    };
  }

  @Get('businesses/:id')
  @ApiOperation({ summary: 'Get business details' })
  @ApiParam({ name: 'id', description: 'Business ID' })
  async getBusiness(
    @Param('id') id: string,
    @Req() request: any,
  ): Promise<ApiResponse<Business>> {
    await this.logApiCall(request, 'GET', `/api/v1/businesses/${id}`);

    const business = await this.businessService.findById(id);
    
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return {
      success: true,
      data: business,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        quota_remaining: request.apiKey.monthly_quota - request.apiKey.current_usage
      }
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Advanced search' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'location', required: false, description: 'Location filter' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Search radius in km' })
  async search(
    @Query() query: SearchDto,
    @Req() request: any,
  ): Promise<ApiResponse<Business[]>> {
    await this.logApiCall(request, 'GET', '/api/v1/search');

    const results = await this.businessService.search(query);

    return {
      success: true,
      data: results.businesses,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        search_time: results.searchTime,
        total_results: results.total,
        quota_remaining: request.apiKey.monthly_quota - request.apiKey.current_usage
      }
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all categories' })
  async getCategories(@Req() request: any): Promise<ApiResponse<Category[]>> {
    await this.logApiCall(request, 'GET', '/api/v1/categories');

    const categories = await this.businessService.getCategories();

    return {
      success: true,
      data: categories,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        quota_remaining: request.apiKey.monthly_quota - request.apiKey.current_usage
      }
    };
  }

  private async logApiCall(request: any, method: string, endpoint: string): Promise<void> {
    const startTime = Date.now();
    
    // Log après la réponse
    request.on('finish', async () => {
      const responseTime = Date.now() - startTime;
      
      await this.analyticsService.logApiCall({
        api_key_id: request.apiKey.id,
        endpoint,
        method,
        status_code: request.res.statusCode,
        response_time: responseTime,
        ip_address: request.ip,
        user_agent: request.get('User-Agent'),
        referer: request.get('Referer'),
      });
    });
  }
}
```

## 🎨 Portail Développeur

### Dashboard API Keys
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Key, Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  plan: {
    name: string;
    monthly_requests: number;
  };
  current_usage: number;
  monthly_quota: number;
  last_used_at: string | null;
  created_at: string;
  is_active: boolean;
}

export function ApiKeysDashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/developer/keys');
      const data = await response.json();
      setApiKeys(data.keys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName,
          plan_id: 'basic', // Plan par défaut
        }),
      });

      if (response.ok) {
        setNewKeyName('');
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Error creating API key:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Afficher une notification de succès
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette clé API ?')) return;

    try {
      await fetch(`/api/developer/keys/${keyId}`, {
        method: 'DELETE',
      });
      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clés API</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Nom de la nouvelle clé"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={createApiKey}
            disabled={isCreating || !newKeyName.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer une clé
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {apiKeys.map((apiKey) => {
          const usagePercentage = (apiKey.current_usage / apiKey.monthly_quota) * 100;
          const isVisible = showKeys[apiKey.id];

          return (
            <Card key={apiKey.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {apiKey.name}
                      <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                        {apiKey.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Plan: {apiKey.plan.name} • Créée le {new Date(apiKey.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteApiKey(apiKey.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Clé API:</span>
                    </div>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {isVisible ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Utilisation mensuelle:</span>
                      <span>
                        {apiKey.current_usage.toLocaleString()} / {apiKey.monthly_quota.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {usagePercentage.toFixed(1)}% utilisé
                    </p>
                  </div>

                  {apiKey.last_used_at && (
                    <p className="text-sm text-gray-600">
                      Dernière utilisation: {new Date(apiKey.last_used_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {apiKeys.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune clé API</h3>
            <p className="text-gray-600 mb-4">
              Créez votre première clé API pour commencer à utiliser l'API ECOSYSTE.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## 📚 Documentation Interactive

### Configuration Swagger
```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('ECOSYSTE API')
    .setDescription('API commerciale pour accéder aux données des entreprises camerounaises')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        name: 'Authorization',
        description: 'Entrez votre clé API',
        in: 'header',
      },
      'api-key',
    )
    .addServer('https://api.ecosyste.cm', 'Production')
    .addServer('https://staging-api.ecosyste.cm', 'Staging')
    .addServer('http://localhost:3001', 'Development')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'ECOSYSTE API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(3001);
}
```

## 🧪 Tests API

### Tests d'intégration
```typescript
describe('Commercial API', () => {
  let app: INestApplication;
  let apiKey: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Créer une clé API de test
    apiKey = await createTestApiKey();
  });

  describe('GET /api/v1/businesses', () => {
    it('should return businesses list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/businesses')
        .set('Authorization', `Bearer ${apiKey}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.meta.quota_remaining).toBeGreaterThan(0);
    });

    it('should handle pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/businesses?page=2&limit=5')
        .set('Authorization', `Bearer ${apiKey}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should filter by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/businesses?category=restaurant')
        .set('Authorization', `Bearer ${apiKey}`)
        .expect(200);

      response.body.data.forEach(business => {
        expect(business.category.slug).toBe('restaurant');
      });
    });
  });

  describe('Authentication', () => {
    it('should reject requests without API key', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/businesses')
        .expect(401);
    });

    it('should reject invalid API key', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/businesses')
        .set('Authorization', 'Bearer invalid-key')
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(100).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/businesses')
          .set('Authorization', `Bearer ${apiKey}`)
      );

      const responses = await Promise.allSettled(requests);
      const rateLimited = responses.some(r => 
        r.status === 'fulfilled' && r.value.status === 429
      );

      expect(rateLimited).toBe(true);
    });
  });
});
```

## 📦 Dépendances

```json
{
  "@nestjs/swagger": "^7.1.17",
  "@nestjs/throttler": "^5.0.1",
  "swagger-ui-express": "^5.0.0",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.14.0"
}
```

## 🚀 Critères d'Acceptation

### API
- [ ] Tous les endpoints fonctionnels
- [ ] Authentification par API key
- [ ] Rate limiting opérationnel
- [ ] Gestion des quotas
- [ ] Documentation Swagger complète

### Portail développeur
- [ ] Gestion des clés API
- [ ] Monitoring des quotas
- [ ] Documentation interactive
- [ ] Exemples de code

### Performance
- [ ] Temps de réponse < 200ms
- [ ] Support de 1000+ requêtes/min
- [ ] Cache efficace

## 📈 Métriques de Succès

- **Adoption**: 50+ développeurs inscrits
- **Usage**: 10,000+ appels API/mois
- **Performance**: 99.9% uptime
- **Satisfaction**: Score NPS > 8/10
- **Revenus**: €2,000 MRR via API

## ⏱️ Estimation

**Durée totale**: 8-10 jours
- Backend API: 4-5 jours
- Portail développeur: 3-4 jours
- Documentation: 2 jours
- Tests et optimisation: 2-3 jours

## 🎯 Prochaines Étapes

1. Checkout sur la branche `feature/005-commercial-api`
2. Mise en place de l'architecture API
3. Développement des endpoints
4. Système d'authentification
5. Portail développeur
6. Documentation Swagger
7. Tests et optimisation
8. Déploiement et monitoring
9. Merge vers master

---

**Branche**: `feature/005-commercial-api`  
**Priorité**: Haute  
**Statut**: Prêt pour développement  
**Dépendances**: Features 001, 002, 003, 004