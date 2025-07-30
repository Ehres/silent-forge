# Système de Clics Naturels

Le système Silent Forge utilise maintenant un **système de clics naturels avancé** qui simule fidèlement le comportement humain.

## 🎯 Fonctionnalités

### 1. **Comportements Adaptatifs**
Le système adapte automatiquement le style de clic selon la situation :

- **`precise`** : Clics très précis près du centre (utilisateur expérimenté)
- **`casual`** : Distribution gaussienne naturelle (utilisation normale)
- **`hurried`** : Clics plus dispersés, peut aller près des bords (utilisateur pressé)
- **`careful`** : Évite les bords, reste au centre (utilisateur prudent)

### 2. **Intelligence Contextuelle**
Le `HumanClickSimulator` observe le comportement et s'adapte :

```typescript
// Premiers clics → comportement "careful" (prudent)
// Clics rapides (>5 en 10s) → comportement "hurried" (pressé)
// Clics normaux → comportement "casual" (décontracté)
```

### 3. **Distribution Gaussienne**
- Utilise la **transformation Box-Muller** pour une distribution normale réaliste
- Évite les bords automatiquement (marge configurable)
- Centre naturellement autour du milieu du bouton

## 🔧 Configuration

### Exemple d'Utilisation
```typescript
const simulator = new HumanClickSimulator();
const position = simulator.generateClickPosition(button, 'casual');

// Le simulateur se souvient des derniers clics et adapte le comportement
await automationService.humanClick(position.x, position.y);
```

### Marges de Sécurité
```typescript
// Marge par défaut : 15% des bords du bouton
// Bouton 20x20 → zone cliquable 17x17 au centre
// Bouton 80x30 → zone cliquable 68x25 au centre
```

## 📊 Exemples Concrets

### Bouton Monuments (20x20)
- **Precise** : Clics dans un rayon de ±2px du centre
- **Casual** : Dispersion gaussienne ±3-4px
- **Hurried** : Peut aller jusqu'aux bords
- **Careful** : Reste dans une zone ±2-3px du centre

### Bouton Plus Grand (80x30)
- Distribution naturelle sur toute la surface
- Concentration gaussienne au centre
- Évite automatiquement les 15% de bords

## 🧠 Avantages Anti-Détection

### 1. **Variation Naturelle**
- Aucun clic identique, même sur le même bouton
- Historique des 10 derniers clics pour éviter les patterns
- Adaptation selon la fréquence d'utilisation

### 2. **Comportement Réaliste**
- Distribution statistiquement identique aux clics humains
- Réaction à la "fatigue" (plus de dispersion après beaucoup de clics)
- Temps d'adaptation aux nouveaux éléments d'interface

### 3. **Anti-Pattern**
- Jamais deux clics consécutifs au même endroit
- Variation automatique si trop de similarité détectée
- Simulation de "micro-tremblements" de la main

## 🚀 Utilisation

### Scripts de Test
```bash
# Tester tous les comportements
npm run test-clicks

# Tester les comportements spécifiques
npm run test-clicks -- --behaviors

# Tester le simulateur intelligent
npm run test-clicks -- --intelligent

# Tester sur des boutons plus grands
npm run test-clicks -- --large
```

### Intégration Automatique
Le système est automatiquement utilisé dans :
- ✅ `openMonumentsList()` - Ouverture des monuments
- 🔄 Prochainement : Tous les autres boutons de l'interface

### Configuration des Boutons
```typescript
// Dans config.ts - tous les boutons ont maintenant des dimensions
buttons: {
  openMonuments: { x: 813, y: 948, width: 20, height: 20 },
  validate: { x: 600, y: 250, width: 80, height: 30 },
  // etc...
}
```

## 📈 Résultats

Le nouveau système produit des clics **indiscernables des clics humains** avec :
- Distribution gaussienne naturelle
- Adaptation comportementale intelligente
- Variation continue sans répétition
- Respect automatique des zones de sécurité

**Le système évolue constamment pour devenir de plus en plus naturel !** 🎯
