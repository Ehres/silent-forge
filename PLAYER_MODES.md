# Modes de Parcours des Joueurs - Silent Forge

## 🎯 Comparaison des Approches

| Mode           | Avantages                                                                    | Inconvénients                            | Recommandation       |
|----------------|------------------------------------------------------------------------------|------------------------------------------|----------------------|
| **Séquentiel** | ✅ Plus fiable<br>✅ Pas de dépendance OCR noms<br>✅ Gestion position relative | ⚠️ Ne connaît pas les noms               | **🌟 RECOMMANDÉ**    |
| **Scan OCR**   | ✅ Connaît les noms<br>✅ Filtrage précis                                      | ❌ Dépend qualité OCR<br>❌ Plus complexe  | Pour cas spécifiques |
| **Liste fixe** | ✅ Contrôle total<br>✅ Reproductible                                          | ❌ Maintenance manuelle<br>❌ Pas scalable | Tests uniquement     |

## 🔄 Mode Séquentiel (Recommandé)

### Principe
- Traite les joueurs par **position relative** (1er, 2ème, 3ème...)
- **Pas de reconnaissance des noms** requis
- Navigation automatique page par page

### Workflow
```
Page 1: Joueur pos 1 → Joueur pos 2 → ... → Joueur pos 5
         ↓ Navigation automatique
Page 2: Joueur pos 1 → Joueur pos 2 → ... → Joueur pos 5
         ↓ Etc.
```

### Utilisation
```bash
# Mode par défaut
npm run dev

# Explicite
npm run dev -- sequential
```

### Configuration
```typescript
// Dans src/config/config.ts
players: {
  excludeList: [], // Pas applicable en mode séquentiel
  scanAllPlayers: false // Mode séquentiel par défaut
}
```

## 🔍 Mode Scan OCR

### Principe
- **Scanne toutes les pages** pour récupérer les noms
- Applique la **liste d'exclusion**
- Traite par nom de joueur

### Avantages
- Filtrage précis par nom
- Logs avec noms de joueurs
- Peut éviter certains joueurs

### Utilisation
```bash
npm run dev -- scan
```

### Configuration
```typescript
// Dans src/config/config.ts
players: {
  excludeList: [
    'JoueurAEviter1',
    'CompteInactif',
    'JoueurTest'
  ],
  scanAllPlayers: true
}
```

## 📋 Mode Liste Fixe

### Principe
- Liste de joueurs **prédéfinie**
- Utile pour tests ou cas spécifiques

### Utilisation
```bash
# Liste spécifique
npm run dev -- players Joueur1 Joueur2 Joueur3

# Test un seul joueur
npm run dev -- test MonJoueurTest
```

## ⚙️ Configuration Globale

### Interface Config
```typescript
interface Config {
  players: {
    excludeList: string[];      // Joueurs à éviter (mode scan)
    scanAllPlayers: boolean;    // true=scan, false=séquentiel
  };
  automation: {
    maxPlayersPerSession: number; // Limite sécurité (tous modes)
  };
  ui: {
    pagination: {
      playersPerPage: number;     // Joueurs par page
      maxPages: number;           // Limite pages (sécurité)
    };
  };
}
```

### Sécurités Communes
- **Limite par session**: `maxPlayersPerSession` (défaut: 10)
- **Limite pages**: `maxPages` (défaut: 20)
- **Délais humains**: Entre chaque joueur (2-4s)

## 🛠️ Recommandations d'Usage

### Pour la Production
```bash
npm run dev  # Mode séquentiel (plus fiable)
```

### Pour le Debug
```bash
npm run dev -- test JoueurSpecifique
```

### Pour Cas Spéciaux (avec exclusions)
```bash
npm run dev -- scan  # Si vous avez configuré excludeList
```

## 🔧 Calibration Requise

Tous les modes nécessitent la calibration des coordonnées :

```bash
# Interface joueurs (mode séquentiel)
npm run calibrate -- region X Y width height

# Boutons navigation
npm run calibrate -- test  # Vérifier config actuelle
```

### Coordonnées Importantes
- **Zone liste joueurs**: `ui.playersList` (mode séquentiel)
- **Boutons pagination**: `ui.buttons.nextPlayers/previousPlayers`
- **Hauteur ligne joueur**: ~40px (ajustable dans le code)

## 📊 Comparaison Performance

| Critère     | Séquentiel | Scan OCR             | Liste Fixe  |
|-------------|------------|----------------------|-------------|
| Fiabilité   | 🟢 Haute   | 🟡 Moyenne           | 🟢 Haute    |
| Vitesse     | 🟢 Rapide  | 🟡 Lente             | 🟢 Rapide   |
| Maintenance | 🟢 Aucune  | 🟡 Config exclusions | 🔴 Manuelle |
| Flexibilité | 🟡 Moyenne | 🟢 Haute             | 🔴 Faible   |

**Conclusion**: Le mode séquentiel offre le meilleur équilibre **fiabilité/performance** pour la plupart des cas d'usage.
