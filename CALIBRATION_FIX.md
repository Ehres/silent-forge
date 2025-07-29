# Correction Bug Calibration - Région Trop Petite

## Problème Identifié

La commande `npm run calibrate -- region 813 948 30 30` causait un crash avec l'erreur:
```
malloc: Incorrect checksum for freed object
Corrupt value: 0x0
abort
```

## Cause

Le problème était causé par:
1. **Région trop petite**: 30x30 pixels causent un bug mémoire dans @nut-tree-fork/nut-js
2. **Absence de validation**: Aucune vérification des tailles minimales
3. **Gestion d'erreur insuffisante**: Pas d'aide en cas d'échec

## Solution Implémentée

### 1. Validation Automatique des Tailles
- **Taille minimale**: 50x50 pixels (auto-ajustement)
- **Avertissement**: Message informatif si ajustement nécessaire
- **Logging**: Indication des tailles originales vs ajustées

### 2. Validation des Coordonnées
- **Coordonnées positives**: Vérification x >= 0 et y >= 0
- **Messages d'erreur**: Guidage utilisateur en cas de problème

### 3. Amélioration des Messages d'Aide
- **Documentation complète**: Exemples pratiques avec vraies coordonnées
- **Notes importantes**: Contraintes et limitations
- **Suggestions**: Guide pour résoudre les problèmes

## Tests de Validation

✅ **Région trop petite**: `npm run calibrate -- region 813 948 30 30`
- Auto-ajustement à 50x50
- Message d'avertissement affiché
- Capture réussie

✅ **Région normale**: `npm run calibrate -- region 813 948 100 100`
- Capture directe sans ajustement
- Fonctionnement normal

✅ **Aide mise à jour**: `npm run calibrate -- help`
- Documentation complète et claire
- Exemples pratiques

## Utilisation Recommandée

```bash
# Pour capturer un bouton précis
npm run calibrate -- region 813 948 200 200

# Pour capturer une zone plus large  
npm run calibrate -- region 100 100 800 600

# Pour tester la configuration actuelle
npm run calibrate -- test
```

## Sécurités Ajoutées

- **Taille minimale**: Évite les crashes avec de très petites régions
- **Validation d'entrée**: Vérification des paramètres avant exécution
- **Messages informatifs**: Guidage utilisateur en cas de problème
- **Gestion d'erreur**: Suggestions en cas d'échec de capture
