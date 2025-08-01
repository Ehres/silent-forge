# Logique de Filtrage des Monuments

## Vue d'ensemble

Cette documentation explique la logique de filtrage des monuments dans Silent Forge pour identifier les opportunités de "sniping" optimales.

## Critères de Filtrage

### Monuments Ciblés
Les monuments sélectionnés doivent répondre à **TOUS** ces critères :

1. ✅ **Ont des investissements existants** (`progression.current > 0`)
   - D'autres joueurs ont déjà investi des PF
   - Le monument est "actif" et en progression

2. ❌ **N'ont PAS mes investissements** (`myInvestment === null`)
   - Je ne suis pas encore présent sur ce monument
   - Opportunité de "sniping" disponible

### Monuments Exclus

❌ **Monuments sans aucun investissement** (`progression.current === 0`)
- Personne n'a encore investi
- Risque plus élevé, pas d'activité prouvée

❌ **Monuments avec mes investissements** (`myInvestment !== null`)
- J'ai déjà une position sur ce monument
- Évite les doublons et conflits

## Exemple Pratique

### Tableau des Monuments
| Nom                  | Niveau | Progression | Points de forge | Rang | Action                         |
|----------------------|--------|-------------|-----------------|------|--------------------------------|
| Arc de Triomphe      | 12     | 450/1000    | -               | -    | **✅ CIBLÉ**                    |
| Tour Eiffel          | 15     | 200/800     | 50              | 3    | ❌ Exclu (j'ai investi)         |
| Statue de la Liberté | 8      | 0/600       | -               | -    | ❌ Exclu (aucun investissement) |
| Colisée              | 18     | 750/1200    | -               | -    | **✅ CIBLÉ**                    |

### Résultat du Filtrage
- **2 monuments ciblés** : Arc de Triomphe, Colisée
- **2 monuments exclus** : Tour Eiffel (j'ai investi), Statue de la Liberté (aucun investissement)

## Structure des Données

### MonumentTableRow
```typescript
interface MonumentTableRow {
  name: string;                           // Nom du monument
  level: number;                          // Niveau du monument
  progression: {                          // Progression des investissements
    current: number;                      // PF déjà investis par tous
    maximum: number;                      // PF maximum possible
  };
  myInvestment: number | null;            // Mes PF investis (null = aucun)
  myRank: number | null;                  // Mon rang (null = aucun)
  activityButtonPosition: { x: number; y: number }; // Position bouton "Activité"
}
```

### TargetMonument
```typescript
interface TargetMonument {
  name: string;
  level: number;
  progression: { current: number; maximum: number };
  hasOthersInvestments: boolean;          // Toujours true
  hasMyInvestments: boolean;              // Toujours false
  activityButtonPosition: { x: number; y: number };
}
```

## Workflow de Filtrage

1. **Extraction OCR** : Analyser le tableau des monuments
2. **Parsing** : Convertir en structures `MonumentTableRow`
3. **Filtrage** : Appliquer les critères de sélection
4. **Conversion** : Transformer en `TargetMonument`
5. **Traitement** : Investir dans les monuments ciblés

## Test et Validation

Exécuter le test de filtrage :
```bash
npx ts-node src/test-monument-filtering.ts
```

Ce test valide la logique avec des données simulées et affiche :
- Les monuments extraits du tableau
- Le résultat du filtrage avec justification
- Les monuments finalement sélectionnés

## Configuration OCR

Les patterns regex pour l'OCR réel :
- **Progression** : `/(\d+)\/(\d+)/` pour "450/1000"
- **Nombres** : `/\d+/g` pour niveau, PF, rang
- **Cellules vides** : Détection des zones sans texte

## Intégration

Cette logique s'intègre dans :
- `GameNavigationService.identifyInvestedMonuments()`
- `GameNavigationService.processPlayer()`
- `GameNavigationService.processCurrentPlayer()`

La méthode filtre automatiquement et ne traite que les monuments correspondant aux critères optimaux de sniping.
