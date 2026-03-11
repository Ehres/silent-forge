# Silent Forge

Un outil d'automatisation TypeScript pour analyser les opportunités de jeu via capture d'écran, OCR et détection automatisée. Conçu pour scanner discrètement les "Grands Monuments" dans les jeux afin d'identifier les opportunités d'investissement rentables.

## 🎯 Workflow Principal

Silent Forge automatise un processus en 7 étapes pour analyser et investir dans les monuments des joueurs:

1. **🔍 Navigation vers le joueur** - Recherche et accès au profil du joueur cible
2. **🏛️ Accès aux Grands Monuments** - Ouverture de la section monuments du joueur
3. **📊 Identification des investissements** - Détection des monuments avec places d'investissement disponibles
4. **💰 Analyse des opportunités** - Évaluation de la rentabilité selon les seuils configurés
5. **🎯 Investissement automatique** - Placement automatique sur les opportunités détectées
6. **📈 Suivi des résultats** - Logging détaillé des actions et résultats
7. **� Répétition** - Traitement de la liste complète des joueurs

## 🚀 Utilisation

### Installation

```bash
npm install
```

### Commandes principales

```bash
# Workflow complet (mode séquentiel recommandé)
npm run dev

# Test sur un seul joueur
npm run test-player [nom_joueur]

# Traitement d'une liste personnalisée
npm run run-players Joueur1 Joueur2 Joueur3

# Mode calibration des coordonnées
npm run calibration

# Outil de calibration interactif
npm run calibrate
```

### Configuration requise

Avant utilisation, calibrez les coordonnées UI dans `src/config/config.ts`:

```typescript
ui: {
  regions: {
    playersList: { x: 100, y: 200, width: 300, height: 400 },
    monumentsList: { x: 500, y: 200, width: 400, height: 500 },
    monumentDetails: { x: 200, y: 100, width: 600, height: 600 }
  },
  buttons: {
    searchPlayer: { x: 150, y: 50 },
    openMonuments: { x: 700, y: 300 },
    invest: { x: 400, y: 500 }
  }
}
```

## 🏗️ Architecture

### Services principaux

- **`GameNavigationService`**: Orchestration du workflow complet
- **`ScreenCapture`**: Capture d'écran avec @nut-tree-fork/nut-js
- **`OCRService`**: Traitement d'images via Tesseract.js (simulation actuelle)
- **`OpportunityDetector`**: Analyse des opportunités d'investissement
- **`AutomationService`**: Mouvements de souris humains avec courbes de Bézier

### Flux de données

```
ScreenCapture → OCRService → OpportunityDetector → GameNavigationService
       ↑                                               ↓
AutomationService ←── Config ←── Types ←── Logger
```

## ⚙️ Configuration

### Seuils d'investissement

```typescript
investment: {
  minProfitPercentage: 10,    // Profit minimum requis (%)
  maxInvestmentAmount: 1000,  // Investissement maximum par monument
  maxTotalPerPlayer: 5000,    // Total maximum par joueur
  maxPlayersPerSession: 10    // Limite de joueurs par session
}
```

### Paramètres d'automatisation

```typescript
automation: {
  humanlike: {
    moveSpeed: 'medium',        // Vitesse des mouvements
    clickDelay: [100, 300],     // Délai entre clics (ms)
    scrollDelay: [200, 500]     // Délai de défilement (ms)
  }
}
```

## 📁 Structure du projet

```
src/
├── main.ts                    # Point d'entrée principal (CLI)
├── calibrate.ts               # Calibration interactive
├── calibrate-cards.ts         # Calibration des cartes joueurs
├── calibrate-ocr.ts           # Calibration des paramètres OCR
├── types/
│   └── index.ts               # Types TypeScript partagés
├── modules/
│   ├── game-navigation-service.ts   # Orchestration du workflow
│   ├── player-navigation-service.ts # Navigation et pagination joueurs
│   ├── monument-processing-service.ts # Traitement des monuments
│   ├── reward-extraction-service.ts  # Extraction des récompenses
│   ├── screen-capture.ts            # Capture d'écran
│   ├── ocr-service.ts               # Service OCR (Tesseract)
│   ├── ocr-enhancement.ts           # Correction OCR monuments
│   ├── opportunity-detector.ts      # Détection d'opportunités
│   └── automation-service.ts        # Automatisation souris/clavier
├── utils/
│   ├── logger.ts              # Logging avec couleurs
│   └── button-utils.ts        # Utilitaires boutons et clics
├── scripts/
│   ├── test-implementation.ts # Test filtrage et exclusion
│   ├── test-monument-ocr.ts   # Test extraction OCR monuments
│   └── test-sequential-rewards.ts # Test récompenses séquentielles
└── config/
    └── config.ts              # Configuration centralisée
```

## 🧪 Étapes de MVP (Produit minimal viable)
	1.	✅ Capturer l'écran d'un Grand Monument
	2.	✅ OCR ou image recognition pour lire les 5 premières places
	3.	✅ Calcul de la rentabilité (ex : tu dépenses 250 PF pour un retour de 280)
	4.	✅ Affichage CLI ou log d'un snipe potentiel
	5.	🔄 Refaire pour tous les amis/voisins (en cours)

## 📖 Documentation

Consultez les guides dans le dossier `docs/` :

- [GETTING_STARTED.md](./docs/GETTING_STARTED.md) — Guide de démarrage et configuration initiale
- [IMPLEMENTATION_GUIDE.md](./docs/IMPLEMENTATION_GUIDE.md) — Guide d'implémentation technique
- [PLAYER_MODES.md](./docs/PLAYER_MODES.md) — Modes de traitement des joueurs
- [PAGINATION.md](./docs/PAGINATION.md) — Gestion de la pagination
- [CALIBRATION_FIX.md](./docs/CALIBRATION_FIX.md) — Résolution de problèmes de calibration

## 🛠️ Configuration

Modifiez `src/config/config.ts` pour ajuster :
- Les coordonnées de capture des Grands Monuments
- Les seuils de rentabilité (profit minimum, pourcentage minimum)
- Les paramètres OCR et d'automatisation

## 🔒 Sécurité et discrétion

- ✅ Mouvements de souris humains avec courbes de Bézier
- ✅ Délais aléatoires entre les actions
- ✅ Variations dans les timings
- ✅ Pas de patterns prévisibles