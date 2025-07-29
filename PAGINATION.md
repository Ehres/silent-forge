# Système de Pagination - Documentation

## Fonctionnalité Implémentée

Le `GameNavigationService` a été modifié pour gérer la pagination automatique des listes de joueurs qui s'affichent 5 par 5 dans l'interface du jeu.

## Configuration

Dans `src/config/config.ts`:

```typescript
ui: {
  pagination: {
    playersPerPage: 5,    // Nombre de joueurs par page
    maxPages: 20          // Limite de sécurité
  },
  buttons: {
    nextPlayers: { x: 650, y: 550 },      // Bouton "Suivant"
    previousPlayers: { x: 150, y: 550 }   // Bouton "Précédent" (pour futur)
  }
}
```

## Workflow de Pagination

1. **Division automatique**: La liste de joueurs est divisée en pages de 5 joueurs
2. **Traitement séquentiel**: Chaque page est traitée complètement avant de passer à la suivante
3. **Navigation automatique**: Après traitement des 5 joueurs, clic automatique sur "Suivant"
4. **Logs détaillés**: Suivi du progrès avec indication de la page courante

## Exemple de Logs

```
📄 3 page(s) de joueurs à traiter
📄 Traitement de la page 1/3 (5 joueurs)
... traitement des 5 joueurs ...
📄 Navigation vers la page suivante de joueurs...
🖱️ Clic humain vers (650, 550)
✅ Page suivante chargée
📄 Traitement de la page 2/3 (5 joueurs)
```

## Sécurités

- **Limite maximale**: 20 pages max (100 joueurs) pour éviter les boucles infinies
- **Gestion d'erreurs**: Exceptions capturées lors de la navigation
- **Délais humains**: Attente de 1-2 secondes après chaque navigation

## Tests

- ✅ Testé avec 3 joueurs (1 page, pas de navigation)
- ✅ Testé avec 12 joueurs (3 pages, 2 navigations)
- ✅ Validation des coordonnées de boutons
- ✅ Vérification des logs et du workflow

## Calibration Requise

L'utilisateur devra calibrer les coordonnées exactes des boutons "Suivant" et "Précédent" selon son interface de jeu avec l'outil de calibration:

```bash
npm run calibrate -- --help
```
