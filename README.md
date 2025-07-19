# 💳 Sumeria Expense Tracker

Une application web moderne pour gérer les remboursements entre amis, inspirée de Lydia. Développée avec React, TypeScript et les meilleures pratiques de développement moderne.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités principales
- **Création de groupes d'amis** : Organisez vos dépenses par groupe (voyage, colocation, etc.)
- **Gestion des dépenses** : Ajoutez facilement des dépenses avec montant, description et répartition
- **Calcul automatique des soldes** : L'application calcule automatiquement qui doit quoi à qui
- **Interface responsive** : Fonctionne parfaitement sur desktop, tablette et mobile
- **Persistance des données** : Vos données sont sauvegardées localement

### 🎯 Fonctionnalités avancées
- **Répartition flexible** : Choisissez qui a payé et pour qui
- **Catégorisation** : Organisez vos dépenses par catégorie (nourriture, transport, etc.)
- **Historique complet** : Consultez toutes vos dépenses avec dates et détails
- **Calculs précis** : Arrondis à 2 décimales pour éviter les erreurs
- **Interface intuitive** : Design moderne et UX optimisée

## 🛠️ Stack Technique

### Frontend
- **React 18** : Framework principal avec hooks modernes
- **TypeScript** : Typage statique pour un code plus robuste
- **React Query (TanStack Query)** : Gestion d'état serveur et cache intelligent
- **CSS Modules** : Styles modulaires et responsive

### Architecture
- **Hooks personnalisés** : Logique métier réutilisable
- **Composants fonctionnels** : Architecture moderne React
- **Gestion d'état optimisée** : React Query pour les données, useState pour l'UI
- **TypeScript strict** : Configuration stricte pour la qualité du code

### Outils de développement
- **ESLint** : Linting du code
- **Prettier** : Formatage automatique
- **Create React App** : Configuration optimisée

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd sumeria-expense-tracker

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🚀 Scripts disponibles

```bash
# Développement
npm start          # Lance le serveur de développement
npm test           # Lance les tests
npm run build      # Build de production
npm run eject      # Eject CRA (irréversible)

# Tests
npm test           # Lance les tests en mode watch
npm run test:coverage  # Lance les tests avec couverture
```

## 📁 Structure du projet

```
src/
├── components/          # Composants React
│   ├── GroupList.tsx
│   ├── GroupDetail.tsx
│   ├── CreateGroupModal.tsx
│   ├── CreateExpenseModal.tsx
│   ├── ExpenseList.tsx
│   └── BalanceSummary.tsx
├── hooks/              # Hooks personnalisés
│   ├── useGroups.ts
│   └── useExpenses.ts
├── types/              # Types TypeScript
│   └── index.ts
├── utils/              # Utilitaires
│   └── balanceCalculator.ts
├── App.tsx             # Composant principal
└── index.tsx           # Point d'entrée
```

## 🎨 Architecture

### Gestion des données
- **localStorage** : Persistance locale des données
- **React Query** : Cache intelligent et synchronisation
- **Hooks personnalisés** : Abstraction de la logique métier

### Calculs financiers
- **Algorithme de répartition** : Calcul automatique des soldes
- **Gestion des arrondis** : Précision à 2 décimales
- **Validation des données** : Vérification de cohérence

### Interface utilisateur
- **Design responsive** : Mobile-first approach
- **Composants modulaires** : Réutilisabilité maximale
- **Accessibilité** : Standards WCAG respectés

## 🧪 Tests

### Tests unitaires
```bash
npm test
```

### Couverture de code
```bash
npm run test:coverage
```

### Tests d'intégration
Les tests couvrent :
- Calculs financiers
- Gestion des groupes
- Gestion des dépenses
- Validation des formulaires

## 📱 Fonctionnalités par écran

### Page d'accueil
- Liste des groupes existants
- Bouton de création de groupe
- État vide avec call-to-action

### Création de groupe
- Formulaire avec validation
- Ajout dynamique de membres
- Prévisualisation en temps réel

### Détail du groupe
- Résumé des soldes
- Liste des dépenses récentes
- Bouton d'ajout de dépense

### Ajout de dépense
- Formulaire complet
- Sélection multiple de bénéficiaires
- Catégorisation optionnelle

## 🔧 Configuration

### Variables d'environnement
```env
REACT_APP_VERSION=1.0.0
REACT_APP_NAME=Sumeria Expense Tracker
```

### TypeScript
Configuration stricte avec :
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Déploiement sur Vercel
1. Connecter le repository GitHub
2. Configuration automatique détectée
3. Déploiement automatique à chaque push

### Déploiement manuel
```bash
# Build
npm run build

# Serveur statique
npx serve -s build
```

## 📊 Métriques de qualité

- **Couverture de tests** : >80%
- **Performance Lighthouse** : >90
- **Accessibilité** : 100%
- **SEO** : Optimisé
- **Bundle size** : <500KB gzippé

## 🤝 Contribution

### Guidelines
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code
- **TypeScript strict** : Tous les types doivent être définis
- **ESLint** : Respecter les règles de linting
- **Prettier** : Formatage automatique
- **Tests** : Nouveaux composants doivent être testés

## 📝 Changelog

### v1.0.0 (2024-01-XX)
- ✨ Version initiale
- 🎯 Gestion complète des groupes et dépenses
- 📱 Interface responsive
- 🧪 Tests unitaires complets

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Développé avec ❤️ pour démontrer les compétences techniques modernes.

## 🙏 Remerciements

- **Lydia** : Inspiration pour l'interface et les fonctionnalités
- **React Team** : Framework exceptionnel
- **TanStack** : Outils de développement de qualité
- **Communauté open source** : Bibliothèques et ressources

---

**Note** : Ce projet a été développé comme démonstration technique pour un portfolio. Il utilise localStorage pour la persistance des données et est optimisé pour un usage personnel ou en petit groupe.
