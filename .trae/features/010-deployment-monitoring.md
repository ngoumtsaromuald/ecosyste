# Feature 010: Déploiement et Monitoring

## Description
Mise en place d'une infrastructure de déploiement robuste et d'un système de monitoring complet pour assurer la haute disponibilité et les performances optimales de la plateforme ECOSYSTE.

## Objectifs
- Automatiser le déploiement avec CI/CD
- Implémenter un monitoring complet (APM, logs, métriques)
- Configurer les alertes et notifications
- Optimiser les performances et la scalabilité
- Assurer la sécurité et la conformité
- Mettre en place la sauvegarde et la récupération

## Tâches Techniques

### Infrastructure (Docker + Kubernetes)

#### 1. Configuration Docker
```dockerfile
# Dockerfile.backend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:prod"]

# Dockerfile.frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/.next/static /usr/share/nginx/html/_next/static
COPY --from=builder /app/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Docker Compose Production
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl/certs
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ecosyste
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### 3. Configuration Kubernetes
```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecosyste-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ecosyste-backend
  template:
    metadata:
      labels:
        app: ecosyste-backend
    spec:
      containers:
      - name: backend
        image: ecosyste/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ecosyste-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

### CI/CD Pipeline (GitHub Actions)

#### 1. Workflow Principal
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ecosyste/app:latest,ecosyste/app:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v1
        with:
          manifests: |
            k8s/deployment.yml
            k8s/service.yml
          images: |
            ecosyste/app:${{ github.sha }}
```

### Monitoring et Observabilité

#### 1. Configuration Prometheus
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'ecosyste-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
```

#### 2. Règles d'Alerte
```yaml
# monitoring/alert_rules.yml
groups:
- name: ecosyste_alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors per second"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }}s"

  - alert: DatabaseConnectionsHigh
    expr: pg_stat_activity_count > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High database connections"
      description: "Database has {{ $value }} active connections"
```

#### 3. Configuration Grafana
```json
{
  "dashboard": {
    "title": "ECOSYSTE Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Database Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_tup_fetched",
            "legendFormat": "Tuples fetched"
          }
        ]
      }
    ]
  }
}
```

### Backend Monitoring (NestJS)

#### 1. Métriques Prometheus
```typescript
// src/modules/monitoring/prometheus.service.ts
import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status']
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5]
  });

  private readonly activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active database connections'
  });

  incrementHttpRequests(method: string, route: string, status: number) {
    this.httpRequestsTotal.inc({ method, route, status: status.toString() });
  }

  observeHttpDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  getMetrics() {
    return register.metrics();
  }
}
```

#### 2. Health Check Complet
```typescript
// src/modules/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private readonly redisHealthIndicator: RedisHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.prismaHealthIndicator.pingCheck('database'),
      () => this.redisHealthIndicator.pingCheck('redis'),
      () => this.checkExternalServices(),
      () => this.checkDiskSpace(),
      () => this.checkMemoryUsage()
    ]);
  }

  private async checkExternalServices(): Promise<HealthIndicatorResult> {
    try {
      // Vérifier les services externes (APIs, etc.)
      const response = await fetch('https://api.external-service.com/health');
      return {
        'external-services': {
          status: response.ok ? 'up' : 'down'
        }
      };
    } catch (error) {
      return {
        'external-services': {
          status: 'down',
          error: error.message
        }
      };
    }
  }
}
```

### Logging Centralisé

#### 1. Configuration ELK Stack
```yaml
# monitoring/elk-stack.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

#### 2. Configuration Winston Logger
```typescript
// src/modules/logging/winston.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
        })
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});
```

### Sauvegarde et Récupération

#### 1. Script de Sauvegarde
```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
DB_NAME="ecosyste"

# Sauvegarde PostgreSQL
pg_dump -h postgres -U $DB_USER -d $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Sauvegarde Redis
redis-cli -h redis --rdb $BACKUP_DIR/redis_backup_$DATE.rdb

# Compression
tar -czf $BACKUP_DIR/full_backup_$DATE.tar.gz $BACKUP_DIR/*_$DATE.*

# Nettoyage (garder seulement les 7 derniers jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Upload vers S3 (optionnel)
aws s3 cp $BACKUP_DIR/full_backup_$DATE.tar.gz s3://ecosyste-backups/

echo "Backup completed: full_backup_$DATE.tar.gz"
```

#### 2. Cron Job pour Sauvegardes
```bash
# Ajouter au crontab
# Sauvegarde quotidienne à 2h du matin
0 2 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1

# Sauvegarde hebdomadaire complète le dimanche à 1h
0 1 * * 0 /scripts/full_backup.sh >> /var/log/backup.log 2>&1
```

## Configuration de Sécurité

### 1. SSL/TLS avec Let's Encrypt
```bash
#!/bin/bash
# scripts/setup-ssl.sh

# Installation Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d ecosyste.com -d www.ecosyste.com

# Renouvellement automatique
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 2. Configuration Nginx Sécurisée
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name ecosyste.com www.ecosyste.com;

    ssl_certificate /etc/letsencrypt/live/ecosyste.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ecosyste.com/privkey.pem;
    
    # Sécurité SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Tests et Validation

### Tests de Performance
```typescript
// tests/performance.spec.ts
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

describe('Performance Tests', () => {
  it('should handle 1000 concurrent requests', async () => {
    const promises = Array.from({ length: 1000 }, () =>
      request(app).get('/api/businesses').expect(200)
    );
    
    const start = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(10000); // 10 secondes max
  });

  it('should maintain response time under load', async () => {
    const responses = [];
    
    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      await request(app).get('/api/businesses').expect(200);
      responses.push(Date.now() - start);
    }
    
    const avgResponseTime = responses.reduce((a, b) => a + b) / responses.length;
    expect(avgResponseTime).toBeLessThan(500); // 500ms max
  });
});
```

## Dépendances
```json
{
  "devDependencies": {
    "@nestjs/terminus": "^10.0.0",
    "prom-client": "^14.0.0",
    "winston": "^3.8.0",
    "nest-winston": "^1.9.0",
    "@elastic/elasticsearch": "^8.5.0"
  },
  "scripts": {
    "docker:build": "docker build -t ecosyste .",
    "docker:run": "docker-compose up -d",
    "k8s:deploy": "kubectl apply -f k8s/",
    "backup": "./scripts/backup.sh",
    "monitor": "docker-compose -f monitoring/docker-compose.yml up -d"
  }
}
```

## Critères d'Acceptation
- [ ] Pipeline CI/CD fonctionnel
- [ ] Déploiement automatisé
- [ ] Monitoring complet (métriques, logs, alertes)
- [ ] Health checks opérationnels
- [ ] Sauvegardes automatiques
- [ ] SSL/TLS configuré
- [ ] Performance optimisée
- [ ] Haute disponibilité (99.9%)
- [ ] Sécurité renforcée
- [ ] Documentation complète

## Métriques de Succès
- Disponibilité > 99.9%
- Temps de réponse moyen < 200ms
- Temps de déploiement < 10 minutes
- Récupération après incident < 5 minutes
- 0 perte de données

## Intégrations
- GitHub Actions pour CI/CD
- Docker Hub pour les images
- Kubernetes pour l'orchestration
- Prometheus + Grafana pour le monitoring
- ELK Stack pour les logs
- Let's Encrypt pour SSL
- AWS S3 pour les sauvegardes

## Durée Estimée
**10-12 jours**

## Notes Techniques
- Utiliser des images Docker optimisées (Alpine)
- Implémenter le blue-green deployment
- Configurer l'auto-scaling
- Prévoir la disaster recovery
- Documenter tous les processus