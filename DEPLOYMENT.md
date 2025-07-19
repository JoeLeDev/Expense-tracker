# 🚀 Guide de Déploiement - Sumeria Expense Tracker

Ce guide vous explique comment déployer l'application Sumeria Expense Tracker sur différentes plateformes.

## 📋 Prérequis

- Node.js 18+ installé
- Compte GitHub
- Compte Vercel (recommandé) ou autre plateforme de déploiement

## 🎯 Déploiement Recommandé : Vercel

### 1. Préparation du Repository

```bash
# Cloner le repository
git clone <votre-repo-url>
cd sumeria-expense-tracker

# Installer les dépendances
npm install

# Tester que tout fonctionne
npm test
npm run build
```

### 2. Déploiement sur Vercel

#### Option A : Déploiement via GitHub (Recommandé)

1. **Pousser le code sur GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Sumeria Expense Tracker"
   git push origin main
   ```

2. **Connecter à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec votre compte GitHub
   - Cliquez sur "New Project"
   - Importez votre repository
   - Vercel détectera automatiquement que c'est un projet React

3. **Configuration automatique**
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

4. **Variables d'environnement** (optionnel)
   ```
   REACT_APP_VERSION=1.0.0
   REACT_APP_NAME=Sumeria Expense Tracker
   ```

5. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel construira et déploiera automatiquement votre application

#### Option B : Déploiement via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel

# Pour les déploiements suivants
vercel --prod
```

### 3. Configuration du Domaine Personnalisé

1. Dans le dashboard Vercel, allez dans les paramètres du projet
2. Section "Domains"
3. Ajoutez votre domaine personnalisé
4. Suivez les instructions pour configurer les DNS

## 🌐 Autres Plateformes de Déploiement

### Netlify

1. **Via Git**
   - Connectez votre repository GitHub
   - Build command: `npm run build`
   - Publish directory: `build`

2. **Via CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=build
   ```

### GitHub Pages

1. **Installer gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Ajouter les scripts dans package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     },
     "homepage": "https://username.github.io/sumeria-expense-tracker"
   }
   ```

3. **Déployer**
   ```bash
   npm run deploy
   ```

### Firebase Hosting

1. **Installer Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialiser Firebase**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configuration**
   - Public directory: `build`
   - Single-page app: `Yes`
   - GitHub Actions: `No`

4. **Déployer**
   ```bash
   npm run build
   firebase deploy
   ```

## 🔧 Configuration Avancée

### Variables d'Environnement

Créez un fichier `.env.production` pour la production :

```env
REACT_APP_VERSION=1.0.0
REACT_APP_NAME=Sumeria Expense Tracker
REACT_APP_API_URL=https://api.example.com
```

### Optimisations de Performance

1. **Compression Gzip**
   - Vercel et Netlify l'activent automatiquement
   - Pour d'autres plateformes, configurez la compression

2. **Cache des Assets**
   - Les fichiers statiques sont automatiquement mis en cache
   - Configurez les headers de cache si nécessaire

3. **CDN**
   - Vercel et Netlify utilisent des CDN globaux
   - Pour d'autres plateformes, configurez un CDN

### Monitoring et Analytics

1. **Vercel Analytics** (si vous utilisez Vercel)
   - Activez dans les paramètres du projet
   - Suivez les performances en temps réel

2. **Google Analytics**
   ```bash
   npm install react-ga
   ```

3. **Sentry pour le monitoring d'erreurs**
   ```bash
   npm install @sentry/react
   ```

## 🧪 Tests de Déploiement

### Tests Locaux

```bash
# Test de build
npm run build

# Test de serveur local
npx serve -s build

# Tests unitaires
npm test

# Vérification des types
npm run type-check
```

### Tests Post-Déploiement

1. **Vérification des fonctionnalités**
   - Création de groupe
   - Ajout de dépenses
   - Calcul des soldes
   - Responsive design

2. **Tests de Performance**
   - Lighthouse audit
   - Core Web Vitals
   - Temps de chargement

3. **Tests de Compatibilité**
   - Chrome, Firefox, Safari
   - Mobile (iOS, Android)
   - Tablettes

## 🔄 Déploiement Continu (CI/CD)

### GitHub Actions

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Configuration des Secrets

Dans GitHub Settings > Secrets :
- `VERCEL_TOKEN`: Token d'API Vercel
- `ORG_ID`: ID de votre organisation Vercel
- `PROJECT_ID`: ID de votre projet Vercel

## 🚨 Résolution de Problèmes

### Erreurs Courantes

1. **Build Failed**
   ```bash
   # Vérifiez les erreurs TypeScript
   npm run type-check
   
   # Vérifiez les erreurs de linting
   npm run lint
   ```

2. **Assets Not Found**
   - Vérifiez le `homepage` dans package.json
   - Assurez-vous que les chemins sont corrects

3. **Environment Variables**
   - Vérifiez que les variables sont définies dans Vercel
   - Redéployez après modification des variables

### Support

- **Documentation Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Documentation Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Issues GitHub**: Créez une issue dans le repository

## 📊 Métriques de Déploiement

### Objectifs de Performance

- **Lighthouse Score**: >90
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

### Monitoring

- **Uptime**: >99.9%
- **Error Rate**: <0.1%
- **Response Time**: <200ms

---

**Note**: Ce guide est optimisé pour Vercel, mais l'application peut être déployée sur n'importe quelle plateforme supportant les applications React statiques. 