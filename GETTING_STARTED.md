# 🚀 Guide de démarrage - Silent Forge

## Installation et configuration

### 1. Installation des dépendances
```bash
npm install
```

### 2. Compilation
```bash
npm run build
```

### 3. Tests
```bash
# Test complet (capture + OCR + détection)
npm run dev

# Test de capture d'écran uniquement
npm run dev -- capture

# Test OCR uniquement
npm run dev -- ocr
```

## Structure du projet

```
src/
├── index.ts              # Point d'entrée principal
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

## Utilisation

### Phase 1: Tests et calibration
1. **Test de capture**: Vérifiez que les captures d'écran fonctionnent
2. **Calibration des coordonnées**: Ajustez les régions de capture dans `config.ts`
3. **Test OCR**: Vérifiez la reconnaissance de texte sur vos captures
4. **Ajustement des patterns**: Modifiez les regex dans `ocr-service.ts` selon le format de votre jeu

### Phase 2: Configuration
1. **Seuils de rentabilité**: Ajustez `minProfit` et `minProfitability` dans `config.ts`
2. **Régions de capture**: Définissez les coordonnées exactes des Grands Monuments
3. **Patterns OCR**: Adaptez les regex selon le format d'affichage de votre jeu

### Phase 3: Automatisation
1. **Navigation**: Implémentez la navigation vers les amis dans `automation-service.ts`
2. **Boucle principale**: Activez l'analyse automatique de tous les amis
3. **Actions**: Ajoutez les actions automatiques (clics, placement, etc.)

## Configuration importante

### Coordonnées de capture
Ajustez ces valeurs dans `src/config/config.ts`:
```typescript
capture: {
  monumentRegion: {
    x: 100,      // Position X du Grand Monument
    y: 100,      // Position Y du Grand Monument
    width: 800,  // Largeur de la zone de capture
    height: 600, // Hauteur de la zone de capture
  }
}
```

### Seuils de rentabilité
```typescript
opportunity: {
  minProfit: 50,           // Profit minimum en PF
  minProfitability: 10,    // Rentabilité minimum en %
}
```

## Prochaines étapes

1. **🧪 Phase de test**: Utilisez `npm run dev` pour tester les captures
2. **📐 Calibration**: Ajustez les coordonnées selon votre résolution d'écran
3. **🔍 OCR**: Adaptez les patterns de reconnaissance selon votre jeu
4. **⚙️ Automatisation**: Implémentez la navigation et les actions automatiques
5. **🚀 Production**: Lancez l'analyse automatique sur tous vos amis

## Sécurité et discrétion

- ✅ Mouvements de souris humains avec courbes de Bézier
- ✅ Délais aléatoires entre les actions
- ✅ Variations dans les timings
- ✅ Pas de patterns prévisibles

## Support

Pour des questions ou des améliorations, consultez les commentaires dans le code source. Chaque module est documenté avec des TODO pour les prochaines implémentations.
