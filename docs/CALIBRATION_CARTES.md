# Calibration des Cartes de Joueurs

Le système de navigation utilise maintenant un système de **positionnement dynamique** pour les cartes de joueurs affichées horizontalement.

## Configuration Actuelle

Les paramètres de layout des cartes sont dans `src/config/config.ts` :

```typescript
cardLayout: {
  startX: 100,     // Position X de la première carte
  startY: 200,     // Position Y des cartes
  cardWidth: 250,  // Largeur d'une carte
  cardHeight: 300, // Hauteur d'une carte
  spacing: 20,     // Espacement entre cartes
  monumentsButtonOffset: {
    x: 125,        // Position du bouton dans la carte (X)
    y: 250,        // Position du bouton dans la carte (Y)
  }
}
```

## Calibration

### 1. Script de Calibration Automatique

```bash
# Capture une zone avec les cartes de joueurs
npm run calibrate-cards

# Teste les positions calculées sans capture
npm run calibrate-cards -- --test

# Affiche l'aide
npm run calibrate-cards -- --help
```

### 2. Processus de Calibration

1. **Ouvrez votre jeu** et affichez la liste des joueurs
2. **Lancez la calibration** : `npm run calibrate-cards`
3. **Attendez le compte à rebours** (3 secondes)
4. **Ouvrez l'image générée** dans `captures/cards-calibration-*.png`
5. **Mesurez les éléments** selon le guide affiché
6. **Mettez à jour** les valeurs dans `src/config/config.ts`

### 3. Éléments à Mesurer

#### Position de la Première Carte
- **startX** : Distance du bord gauche de l'écran à la première carte
- **startY** : Distance du bord haut de l'écran aux cartes

#### Dimensions des Cartes
- **cardWidth** : Largeur d'une carte de joueur
- **cardHeight** : Hauteur d'une carte de joueur

#### Espacement
- **spacing** : Distance horizontale entre deux cartes consécutives

#### Position du Bouton "Grands Monuments"
- **monumentsButtonOffset.x** : Distance depuis le bord gauche de la carte
- **monumentsButtonOffset.y** : Distance depuis le bord haut de la carte

## Fonctionnement

### Calcul Automatique des Positions

Pour chaque joueur à l'index `i`, le système calcule :

```typescript
// Position de la carte
cardX = startX + (i * (cardWidth + spacing))
cardY = startY

// Position du bouton dans cette carte
buttonX = cardX + monumentsButtonOffset.x
buttonY = cardY + monumentsButtonOffset.y
```

### Modes de Traitement

1. **Sequential** (recommandé) : Parcourt les joueurs par position
2. **Scan OCR** : Utilise l'OCR pour identifier les joueurs
3. **Fixed List** : Utilise une liste prédéfinie de joueurs

## Exemple d'Utilisation

```bash
# Mode séquentiel (recommandé)
npm run dev -- sequential

# Mode avec OCR
npm run dev -- scan

# Mode avec liste fixe
npm run dev -- fixed
```

## Dépannage

### Les Boutons Ne Sont Pas Cliqués Correctement

1. Vérifiez que les cartes sont bien visibles à l'écran
2. Lancez `npm run calibrate-cards -- --test` pour voir les positions calculées
3. Ajustez les paramètres dans `config.ts`
4. Re-testez avec `npm run calibrate-cards`

### L'Interface du Jeu a Changé

1. Re-calibrez avec `npm run calibrate-cards`
2. Mesurez les nouveaux paramètres
3. Mettez à jour la configuration

### Différentes Résolutions d'Écran

Les paramètres de calibration dépendent de la résolution d'écran et du zoom du jeu. Vous devrez re-calibrer si vous changez :
- La résolution d'écran
- Le niveau de zoom du navigateur/jeu
- La taille de la fenêtre du jeu
