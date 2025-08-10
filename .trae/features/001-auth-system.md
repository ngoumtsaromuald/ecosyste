# Feature 001: Système d'Authentification JWT

## 📋 Description

Implémentation d'un système d'authentification complet avec JWT, gestion des rôles, et sécurité renforcée pour ECOSYSTE.

## 🎯 Objectifs

- Authentification sécurisée avec JWT
- Gestion des rôles (Admin, Business Owner, User)
- Protection des routes sensibles
- Session management et refresh tokens
- Intégration avec Supabase Auth

## 🔧 Tâches Techniques

### Backend (NestJS)

#### 1. Configuration JWT
- [ ] Installation des dépendances (`@nestjs/jwt`, `@nestjs/passport`)
- [ ] Configuration du module JWT
- [ ] Stratégies Passport (Local, JWT)
- [ ] Guards d'authentification

#### 2. Modules d'authentification
- [ ] `AuthModule` avec services et contrôleurs
- [ ] `UserModule` pour la gestion des utilisateurs
- [ ] `RoleModule` pour la gestion des rôles
- [ ] Middleware de validation des tokens

#### 3. Endpoints API
```typescript
// Routes à implémenter
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
GET /auth/profile
PUT /auth/profile
POST /auth/forgot-password
POST /auth/reset-password
```

#### 4. Base de données
- [ ] Migration des tables `users`, `roles`, `user_roles`
- [ ] Seeders pour les rôles par défaut
- [ ] Index sur les champs critiques

### Frontend (Next.js)

#### 1. Context d'authentification
- [ ] `AuthContext` avec React Context
- [ ] `AuthProvider` pour l'application
- [ ] Hooks personnalisés (`useAuth`, `useUser`)

#### 2. Pages d'authentification
- [ ] `/login` - Page de connexion
- [ ] `/register` - Page d'inscription
- [ ] `/forgot-password` - Mot de passe oublié
- [ ] `/reset-password` - Réinitialisation

#### 3. Composants
- [ ] `LoginForm` avec validation Zod
- [ ] `RegisterForm` avec validation
- [ ] `ProtectedRoute` HOC
- [ ] `RoleGuard` pour les permissions

#### 4. Middleware Next.js
- [ ] Middleware de protection des routes
- [ ] Redirection automatique
- [ ] Gestion des tokens côté client

## 🗄️ Structure de Base de Données

```sql
-- Table users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table user_roles
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Table refresh_tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Sécurité

### Mesures de sécurité
- [ ] Hachage des mots de passe avec bcrypt
- [ ] Validation des entrées avec class-validator
- [ ] Rate limiting sur les endpoints sensibles
- [ ] CORS configuré correctement
- [ ] Sanitisation des données

### Configuration JWT
```typescript
// Configuration recommandée
{
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '15m', // Access token
    issuer: 'ecosyste-api',
    audience: 'ecosyste-app'
  },
  refreshToken: {
    expiresIn: '7d' // Refresh token
  }
}
```

## 🧪 Tests

### Tests unitaires
- [ ] AuthService tests
- [ ] UserService tests
- [ ] JWT Strategy tests
- [ ] Guards tests

### Tests d'intégration
- [ ] Endpoints d'authentification
- [ ] Flux complet login/logout
- [ ] Gestion des erreurs

### Tests E2E
- [ ] Parcours utilisateur complet
- [ ] Gestion des sessions
- [ ] Protection des routes

## 📦 Dépendances

### Backend
```json
{
  "@nestjs/jwt": "^10.2.0",
  "@nestjs/passport": "^10.0.3",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "passport-local": "^1.0.0",
  "bcrypt": "^5.1.1",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1"
}
```

### Frontend
```json
{
  "@hookform/resolvers": "^3.3.2",
  "react-hook-form": "^7.48.2",
  "zod": "^3.22.4",
  "js-cookie": "^3.0.5",
  "@types/js-cookie": "^3.0.6"
}
```

## 🚀 Critères d'Acceptation

### Fonctionnels
- [ ] Un utilisateur peut s'inscrire avec email/mot de passe
- [ ] Un utilisateur peut se connecter et recevoir un JWT
- [ ] Les tokens expirent et se renouvellent automatiquement
- [ ] Les routes protégées nécessitent une authentification
- [ ] Les rôles limitent l'accès aux fonctionnalités
- [ ] La déconnexion invalide les tokens

### Techniques
- [ ] Temps de réponse < 200ms pour l'authentification
- [ ] Sécurité: mots de passe hachés, tokens sécurisés
- [ ] Couverture de tests > 80%
- [ ] Documentation API complète
- [ ] Logs d'audit pour les actions sensibles

## 📈 Métriques de Succès

- **Performance**: Temps d'authentification < 200ms
- **Sécurité**: 0 vulnérabilité critique
- **UX**: Taux de conversion inscription > 70%
- **Technique**: Couverture de tests > 80%

## 🔄 Intégrations

- **Supabase Auth**: Synchronisation des utilisateurs
- **Redis**: Cache des sessions actives
- **Email Service**: Vérification et récupération
- **Monitoring**: Logs d'authentification

## ⏱️ Estimation

**Durée totale**: 5-7 jours
- Backend: 3-4 jours
- Frontend: 2-3 jours
- Tests: 1 jour (parallèle)

## 🎯 Prochaines Étapes

1. Checkout sur la branche `feature/001-auth-system`
2. Configuration de l'environnement de développement
3. Implémentation backend (AuthModule)
4. Implémentation frontend (AuthContext)
5. Tests et validation
6. Documentation et review
7. Merge vers master

---

**Branche**: `feature/001-auth-system`  
**Priorité**: Critique  
**Statut**: Prêt pour développement  
**Assigné**: En attente