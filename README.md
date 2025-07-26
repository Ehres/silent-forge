# Silent Forge
Un outil invisible pour analyser, repérer et tirer parti des opportunités… sans jamais se faire voir.

## 🎯 Objectif principal

Automatiser la visite des profils amis/voisins pour :
	1.	Accéder à leurs Grands Monuments
	2.	Lire les places disponibles et les récompenses
	3.	Détecter si une opportunité de snipe existe (ex. : place 1 à 200 PF pour 300 de retour)
	4.	Te signaler l'opportunité (ou l'ajouter à une liste)

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Compilation
npm run build

# Test principal
npm run dev

# Test de capture uniquement
npm run dev -- capture

# Exemple d'utilisation détaillée
npx ts-node src/example.ts
```

## 🔧 Stack technique
	•	Langage : TypeScript
	•	Automatisation : @nut-tree-fork/nut-js
	•	OCR : Tesseract.js intégré à nut.js
	•	Reconnaissance visuelle : Images de référence (captures d'éléments d'interface)
	•	Système de clics humains : Mouvement irrégulier, délais aléatoires

## 📁 Structure du projet

```
src/
├── index.ts              # Point d'entrée principal
├── example.ts            # Exemple d'utilisation détaillée
├── test.ts               # Script de test et validation
├── types/
│   └── index.ts          # Types TypeScript
├── modules/
│   ├── screen-capture.ts      # Service de capture d'écran
│   ├── ocr-service.ts         # Service OCR avec Tesseract
│   ├── opportunity-detector.ts # Détection d'opportunités
│   └── automation-service.ts   # Automatisation des clics/mouvements
├── utils/
│   └── logger.ts         # Service de logging avec couleurs
└── config/
    └── config.ts         # Configuration du projet
```

## 🧪 Étapes de MVP (Produit minimal viable)
	1.	✅ Capturer l'écran d'un Grand Monument
	2.	✅ OCR ou image recognition pour lire les 5 premières places
	3.	✅ Calcul de la rentabilité (ex : tu dépenses 250 PF pour un retour de 280)
	4.	✅ Affichage CLI ou log d'un snipe potentiel
	5.	🔄 Refaire pour tous les amis/voisins (en cours)

## 📖 Documentation

Consultez [GETTING_STARTED.md](./GETTING_STARTED.md) pour un guide détaillé de configuration et d'utilisation.

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