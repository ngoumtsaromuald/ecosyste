# Feature 002: Tableau de Bord des Entreprises

## 📋 Description

Développement d'un tableau de bord complet pour les propriétaires d'entreprises leur permettant de gérer leurs informations, analyser leurs performances et interagir avec la plateforme ECOSYSTE.

## 🎯 Objectifs

- Interface de gestion complète pour les entreprises
- Analytiques et statistiques en temps réel
- Gestion des informations d'entreprise
- Système de notifications
- Gestion des abonnements et facturation

## 🔧 Tâches Techniques

### Backend (NestJS)

#### 1. Module Business Dashboard
- [ ] `BusinessDashboardModule` avec services et contrôleurs
- [ ] `AnalyticsService` pour les statistiques
- [ ] `NotificationService` pour les alertes
- [ ] `BusinessProfileService` pour la gestion des profils

#### 2. Endpoints API
```typescript
// Routes à implémenter
GET /dashboard/overview
GET /dashboard/analytics
GET /dashboard/notifications
PUT /dashboard/business-profile
GET /dashboard/subscription
GET /dashboard/billing-history
POST /dashboard/upload-media
DELETE /dashboard/media/:id
GET /dashboard/reviews
POST /dashboard/respond-review
```

#### 3. Services d'analytiques
- [ ] Calcul des vues et interactions
- [ ] Statistiques de performance
- [ ] Rapports périodiques
- [ ] Comparaisons avec la concurrence

#### 4. Gestion des médias
- [ ] Upload d'images et vidéos
- [ ] Optimisation automatique
- [ ] Stockage cloud (Supabase Storage)
- [ ] Gestion des métadonnées

### Frontend (Next.js)

#### 1. Layout du Dashboard
- [ ] `DashboardLayout` avec navigation
- [ ] Sidebar responsive
- [ ] Header avec profil utilisateur
- [ ] Breadcrumb navigation

#### 2. Pages principales
- [ ] `/dashboard` - Vue d'ensemble
- [ ] `/dashboard/analytics` - Analytiques détaillées
- [ ] `/dashboard/business` - Gestion du profil
- [ ] `/dashboard/billing` - Facturation
- [ ] `/dashboard/settings` - Paramètres

#### 3. Composants spécialisés
- [ ] `OverviewCards` - Métriques principales
- [ ] `AnalyticsCharts` - Graphiques interactifs
- [ ] `BusinessProfileForm` - Formulaire de profil
- [ ] `MediaUploader` - Gestionnaire de médias
- [ ] `NotificationCenter` - Centre de notifications

#### 4. Intégration graphiques
- [ ] Charts.js ou Recharts pour les graphiques
- [ ] Tableaux de données interactifs
- [ ] Filtres et exports

## 🗄️ Structure de Base de Données

```sql
-- Table business_analytics
CREATE TABLE business_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  calls INTEGER DEFAULT 0,
  messages INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, date)
);

-- Table business_media
CREATE TABLE business_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'image', 'video', 'document'
  url VARCHAR(500) NOT NULL,
  filename VARCHAR(255),
  size INTEGER,
  mime_type VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table subscription_plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XAF',
  billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'yearly'
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table business_subscriptions
CREATE TABLE business_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'expired'
  started_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📊 Fonctionnalités du Dashboard

### 1. Vue d'ensemble
- [ ] Métriques clés (vues, clics, appels)
- [ ] Graphique de performance mensuelle
- [ ] Notifications récentes
- [ ] Statut de l'abonnement
- [ ] Actions rapides

### 2. Analytiques avancées
- [ ] Graphiques de tendances
- [ ] Comparaisons périodiques
- [ ] Sources de trafic
- [ ] Données démographiques
- [ ] Export des rapports

### 3. Gestion du profil
- [ ] Informations de base
- [ ] Horaires d'ouverture
- [ ] Galerie de photos
- [ ] Services et produits
- [ ] Coordonnées de contact

### 4. Centre de notifications
- [ ] Nouveaux avis clients
- [ ] Alertes de performance
- [ ] Rappels de facturation
- [ ] Mises à jour système
- [ ] Messages directs

## 🎨 Interface Utilisateur

### Design System
- [ ] Palette de couleurs cohérente
- [ ] Typographie standardisée
- [ ] Composants réutilisables
- [ ] Icônes et illustrations
- [ ] Responsive design

### Composants UI
```typescript
// Composants principaux
<DashboardCard title="Vues" value={1234} trend="+12%" />
<AnalyticsChart data={chartData} type="line" />
<NotificationItem type="review" message="Nouvel avis" />
<MediaGallery images={businessImages} onUpload={handleUpload} />
<SubscriptionStatus plan="Premium" expires="2024-12-31" />
```

## 🔔 Système de Notifications

### Types de notifications
- [ ] **Avis clients**: Nouveaux avis et réponses
- [ ] **Performance**: Alertes de baisse/hausse
- [ ] **Facturation**: Rappels et confirmations
- [ ] **Système**: Mises à jour et maintenance
- [ ] **Marketing**: Conseils et opportunités

### Canaux de notification
- [ ] In-app notifications
- [ ] Email notifications
- [ ] SMS (optionnel)
- [ ] Push notifications (futur)

## 🧪 Tests

### Tests unitaires
- [ ] BusinessDashboardService tests
- [ ] AnalyticsService tests
- [ ] NotificationService tests
- [ ] Composants React tests

### Tests d'intégration
- [ ] Endpoints dashboard
- [ ] Upload de médias
- [ ] Calculs d'analytiques
- [ ] Système de notifications

### Tests E2E
- [ ] Parcours complet dashboard
- [ ] Gestion du profil business
- [ ] Interactions avec les graphiques

## 📦 Dépendances

### Backend
```json
{
  "@nestjs/platform-express": "^10.0.0",
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.32.6",
  "@supabase/storage-js": "^2.5.5",
  "date-fns": "^2.30.0",
  "@nestjs/schedule": "^4.0.0"
}
```

### Frontend
```json
{
  "recharts": "^2.8.0",
  "react-dropzone": "^14.2.3",
  "react-table": "^7.8.0",
  "date-fns": "^2.30.0",
  "react-hot-toast": "^2.4.1",
  "framer-motion": "^10.16.5"
}
```

## 🚀 Critères d'Acceptation

### Fonctionnels
- [ ] Un propriétaire peut voir ses métriques en temps réel
- [ ] Les graphiques s'actualisent automatiquement
- [ ] Upload et gestion des médias fonctionnels
- [ ] Notifications en temps réel
- [ ] Profil business modifiable
- [ ] Export des rapports disponible

### Techniques
- [ ] Temps de chargement < 2s
- [ ] Interface responsive sur tous appareils
- [ ] Graphiques interactifs et fluides
- [ ] Gestion d'erreurs robuste
- [ ] Sécurité des uploads

## 📈 Métriques de Succès

- **Engagement**: Temps passé sur le dashboard > 5min
- **Utilisation**: 80% des fonctionnalités utilisées
- **Satisfaction**: Score NPS > 8/10
- **Performance**: Temps de chargement < 2s
- **Conversion**: 60% des utilisateurs mettent à jour leur profil

## 🔄 Intégrations

- **Supabase Storage**: Stockage des médias
- **Analytics API**: Données de performance
- **Email Service**: Notifications par email
- **Payment Gateway**: Informations de facturation
- **Review System**: Gestion des avis

## ⏱️ Estimation

**Durée totale**: 7-9 jours
- Backend (API + Services): 4-5 jours
- Frontend (UI + Intégrations): 4-5 jours
- Tests et optimisations: 2 jours (parallèle)

## 🎯 Prochaines Étapes

1. Checkout sur la branche `feature/002-business-dashboard`
2. Mise en place de la structure backend
3. Développement des services d'analytiques
4. Création de l'interface utilisateur
5. Intégration des graphiques et médias
6. Tests et validation
7. Documentation et review
8. Merge vers master

---

**Branche**: `feature/002-business-dashboard`  
**Priorité**: Haute  
**Statut**: Prêt pour développement  
**Dépendances**: Feature 001 (Auth System)