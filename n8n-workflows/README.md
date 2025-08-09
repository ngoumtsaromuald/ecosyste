# 🤖 N8N Workflows pour RomAPI

Ce dossier contient les workflows n8n pour automatiser le scraping d'entreprises camerounaises et alimenter la base de données RomAPI.

## 📋 Workflows Disponibles

### 1. `cameroon-business-scraper.json`
**Objectif :** Scraper les entreprises depuis les annuaires généraux du Cameroun
- **Source :** pagesjaunes.cm et autres annuaires nationaux
- **Fréquence :** Quotidienne (configurée dans l'orchestrateur)
- **Données extraites :** Nom, description, téléphone, email, adresse, site web, catégorie
- **Rate limiting :** 2 secondes entre chaque requête

### 2. `douala-business-scraper.json`
**Objectif :** Scraper spécifiquement les entreprises de Douala
- **Source :** go.cm/douala et annuaires locaux
- **Spécialisation :** Entreprises de la région du Littoral
- **Géolocalisation :** Coordonnées GPS automatiques pour Douala
- **Rate limiting :** 3 secondes entre chaque requête

### 3. `business-scraper-orchestrator.json`
**Objectif :** Orchestrer et planifier l'exécution des scrapers
- **Planification :** Cron job quotidien à 2h du matin
- **Logique :** Rotation des scrapers selon les jours de la semaine
- **Monitoring :** Vérification de santé de l'API avant exécution
- **Reporting :** Génération de rapports d'exécution

## 🚀 Installation et Configuration

### Prérequis
1. **N8N installé** (version 1.0+)
2. **RomAPI backend** fonctionnel sur `http://localhost:3001`
3. **API Keys** configurées pour l'authentification

### Étapes d'installation

1. **Importer les workflows dans N8N :**
   ```bash
   # Démarrer N8N
   npx n8n start
   
   # Accéder à l'interface : http://localhost:5678
   # Aller dans "Workflows" > "Import from file"
   # Importer chaque fichier .json
   ```

2. **Configurer les API Keys :**
   - Créer une API Key dans RomAPI pour n8n
   - Remplacer `your-n8n-api-key-here` dans chaque workflow
   - Remplacer `your-admin-api-key-here` dans l'orchestrateur

3. **Configurer les credentials N8N :**
   ```javascript
   // Dans N8N > Settings > Credentials
   // Créer un "HTTP Header Auth" credential
   {
     "name": "X-API-Key",
     "value": "votre-api-key-romapi"
   }
   ```

4. **Tester les workflows :**
   - Exécuter manuellement chaque scraper
   - Vérifier que les données arrivent dans RomAPI
   - Activer l'orchestrateur pour l'automatisation

## ⚙️ Configuration Avancée

### Personnalisation des Sources

Pour ajouter de nouvelles sources de scraping :

```javascript
// Dans le node "Parse Business Data"
// Adapter les sélecteurs CSS selon le site cible
$('.business-listing, .company-item, .listing-item').each((index, element) => {
  const $el = $(element);
  // Modifier les sélecteurs selon la structure HTML
});
```

### Gestion des Rate Limits

```javascript
// Ajuster les délais selon les robots.txt des sites
{
  "amount": 2, // secondes
  "unit": "seconds"
}
```

### Filtrage et Validation

```javascript
// Personnaliser les critères de validation
if (business.name && (business.phone || business.email || business.address)) {
  businesses.push(business);
}
```

## 📊 Monitoring et Logs

### Logs d'Exécution
- **Succès :** `✅ Business successfully added: [nom]`
- **Erreur :** `❌ Failed to add business: [erreur]`
- **Info :** `📍 [Ville] business processed: [nom]`

### Métriques Importantes
- Nombre d'entreprises scrapées par session
- Taux de succès des requêtes API
- Durée d'exécution des workflows
- Erreurs de parsing ou de validation

### Dashboard N8N
Accéder aux statistiques via :
- **Executions :** Historique des exécutions
- **Logs :** Détails des erreurs
- **Metrics :** Performance des workflows

## 🛡️ Bonnes Pratiques

### Respect des Robots.txt
```javascript
// Vérifier robots.txt avant scraping
const robotsUrl = new URL('/robots.txt', baseUrl).href;
// Implémenter la logique de respect des règles
```

### Gestion des Erreurs
```javascript
// Retry logic pour les requêtes échouées
try {
  // Scraping logic
} catch (error) {
  console.log(`Erreur scraping: ${error.message}`);
  // Retry ou skip
}
```

### Anonymisation
```javascript
// Rotation des User-Agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
];
```

## 🔧 Dépannage

### Problèmes Courants

1. **API Key invalide :**
   ```
   Error: 401 Unauthorized
   Solution: Vérifier la clé API dans les credentials N8N
   ```

2. **Timeout de scraping :**
   ```
   Error: Request timeout
   Solution: Augmenter le timeout dans les paramètres HTTP
   ```

3. **Parsing échoué :**
   ```
   Error: Cannot read property of undefined
   Solution: Vérifier les sélecteurs CSS du site cible
   ```

### Debug Mode
```javascript
// Activer les logs détaillés
console.log('Debug:', {
  url: currentUrl,
  businesses: businesses.length,
  errors: errorCount
});
```

## 📈 Évolutions Futures

- **Multi-langues :** Support français/anglais
- **Géolocalisation :** API Google Maps pour coordonnées précises
- **ML Classification :** Catégorisation automatique intelligente
- **Duplicate Detection :** Détection et fusion des doublons
- **Real-time Updates :** Mise à jour en temps réel des changements

## 🤝 Contribution

Pour contribuer aux workflows :
1. Fork le projet
2. Créer une branche feature
3. Tester les modifications
4. Soumettre une pull request

---

**Note :** Ces workflows respectent les bonnes pratiques de scraping éthique et les conditions d'utilisation des sites sources.