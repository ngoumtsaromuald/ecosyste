# ECOSYSTE 🌍

**Plateforme de découverte d'entreprises locales au Cameroun**  
*Business directory platform for local businesses in Cameroon*

## 📋 Description

ECOSYSTE est une plateforme web moderne qui permet aux utilisateurs de découvrir et d'explorer les entreprises locales au Cameroun. La plateforme offre une interface intuitive pour rechercher, filtrer et consulter les informations détaillées des entreprises par catégorie et localisation.

## ✨ Fonctionnalités

- 🔍 **Recherche avancée** : Recherche par nom, catégorie, ville ou région
- 📱 **Interface responsive** : Optimisée pour mobile, tablette et desktop
- 🏢 **Catalogue d'entreprises** : Affichage détaillé avec informations complètes
- 📊 **Tableau de bord** : Interface d'administration pour la gestion
- 🔐 **Authentification** : Système de connexion sécurisé
- 📈 **Analytics** : Suivi des performances et statistiques

## 🛠️ Technologies utilisées

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **React** - Bibliothèque UI

### Backend & Base de données
- **Supabase** - Backend-as-a-Service (PostgreSQL)
- **Prisma** - ORM pour la base de données
- **Node.js** - Runtime JavaScript

### Outils de développement
- **ESLint** - Linting du code
- **PostCSS** - Traitement CSS
- **Git** - Contrôle de version

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/ngoumtsaromuald/ecosyste.git
cd ecosyste
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
```

Configurer les variables d'environnement dans `.env` :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du projet

```
ecosyste/
├── app/                    # Pages et composants Next.js (App Router)
│   ├── api/               # Routes API
│   ├── components/        # Composants React
│   ├── dashboard/         # Interface d'administration
│   └── business/          # Pages des entreprises
├── lib/                   # Utilitaires et configuration
├── prisma/               # Schéma de base de données
├── public/               # Assets statiques
└── n8n-workflows/        # Workflows d'automatisation
```

## 🗄️ Base de données

Le projet utilise Supabase avec PostgreSQL. Les principales tables :

- **businesses** : Informations des entreprises
- **categories** : Catégories d'entreprises
- **users** : Utilisateurs de la plateforme

## 🔧 Scripts disponibles

```bash
npm run dev          # Démarrer en mode développement
npm run build        # Construire pour la production
npm run start        # Démarrer en mode production
npm run lint         # Vérifier le code avec ESLint
```

## 🌐 Déploiement

Le projet est configuré pour être déployé sur :
- **Vercel** (recommandé pour Next.js)
- **Netlify**
- Tout autre hébergeur supportant Node.js

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Ngoumtsa Romuald**
- GitHub: [@ngoumtsaromuald](https://github.com/ngoumtsaromuald)

## 🙏 Remerciements

- Communauté Next.js
- Équipe Supabase
- Contributeurs open source

---

*Développé avec ❤️ pour la communauté camerounaise*
