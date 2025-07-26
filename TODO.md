# 📋 TODO - Silent Forge

## 🚀 Prochaines étapes prioritaires

### Phase 1: Calibration et configuration réelle
- [ ] **Calibrer les coordonnées de capture**
  - [ ] Ouvrir le jeu et identifier la position exacte des Grands Monuments
  - [ ] Mesurer les coordonnées (x, y, width, height) de la zone d'affichage
  - [ ] Mettre à jour `src/config/config.ts` avec les vraies coordonnées
  - [ ] Tester les captures avec `npm run dev -- capture`

### Phase 2: OCR réel et patterns
- [ ] **Remplacer l'OCR simulé par de vraies captures**
  - [ ] Supprimer la simulation dans `src/modules/ocr-service.ts`
  - [ ] Activer Tesseract.js pour analyser de vraies images
  - [ ] Tester l'OCR sur quelques captures manuelles

- [ ] **Adapter les patterns de reconnaissance**
  - [ ] Analyser le format exact d'affichage de votre jeu
  - [ ] Modifier la regex dans `parseMonumentText()` pour correspondre au format
  - [ ] Exemples de formats possibles :
    - `"1. PlayerName - 250 PF → 300 PF"`
    - `"Place 1 | PlayerName | 250 PF | Retour: 300 PF"`
    - `"1 - PlayerName (250 PF) -> 300 PF"`

- [ ] **Améliorer la robustesse OCR**
  - [ ] Implémenter le préprocessing d'image (contraste, luminosité)
  - [ ] Ajouter la gestion d'erreurs OCR
  - [ ] Tester avec différentes résolutions d'écran

### Phase 3: Navigation et automatisation
- [ ] **Implémenter la navigation vers les amis**
  - [ ] Identifier les éléments UI pour accéder à la liste d'amis
  - [ ] Coder la séquence de clics dans `automation-service.ts`
  - [ ] Ajouter la navigation retour au menu principal

- [ ] **Boucle d'analyse automatique**
  - [ ] Créer une liste des amis à analyser
  - [ ] Implémenter la boucle principale dans `index.ts`
  - [ ] Ajouter gestion d'erreurs et retry logic
  - [ ] Ajouter pause entre chaque ami (délais humains)

### Phase 4: Fonctionnalités avancées
- [ ] **Améliorer la détection d'opportunités**
  - [ ] Ajouter différents types d'opportunités (court terme vs long terme)
  - [ ] Calculer le ROI et temps de retour sur investissement
  - [ ] Prioriser les opportunités par rentabilité

- [ ] **Système de notifications**
  - [ ] Notifications desktop quand opportunité détectée
  - [ ] Export des opportunités en JSON/CSV
  - [ ] Logs détaillés avec timestamps

- [ ] **Interface utilisateur**
  - [ ] Interface web simple pour voir les résultats
  - [ ] Dashboard avec statistiques
  - [ ] Configuration via interface

### Phase 5: Optimisations et sécurité
- [ ] **Optimiser les performances**
  - [ ] Cache des captures récentes
  - [ ] Optimiser la vitesse d'OCR
  - [ ] Paralléliser l'analyse de plusieurs amis

- [ ] **Renforcer la discrétion**
  - [ ] Varier les patterns de navigation
  - [ ] Ajouter des pauses aléatoires plus longues
  - [ ] Simuler des erreurs humaines occasionnelles

- [ ] **Gestion des erreurs robuste**
  - [ ] Retry automatique en cas d'échec
  - [ ] Détection de changements d'interface du jeu
  - [ ] Mode dégradé si OCR échoue

## 🔧 Améliorations techniques

### Code et architecture
- [ ] **Tests unitaires**
  - [ ] Tests pour chaque module principal
  - [ ] Tests d'intégration
  - [ ] Mocks pour l'OCR et les captures

- [ ] **Configuration avancée**
  - [ ] Lecture de config depuis fichier JSON externe
  - [ ] Profils de configuration (dev, prod, test)
  - [ ] Variables d'environnement

- [ ] **Logging avancé**
  - [ ] Rotation des logs
  - [ ] Niveaux de log configurables
  - [ ] Export des logs pour analyse

### Documentation
- [ ] **Compléter la documentation**
  - [ ] Guide de troubleshooting
  - [ ] FAQ des problèmes courants
  - [ ] Exemples de configuration pour différents jeux

- [ ] **Vidéos/captures d'écran**
  - [ ] Démonstration de l'installation
  - [ ] Exemple de calibration
  - [ ] Résultats attendus

## 🎯 Objectifs par version

### v1.0 - MVP fonctionnel
- [x] Structure de base du projet
- [x] Modules principaux implémentés
- [x] OCR simulé fonctionnel
- [ ] OCR réel avec vraies captures
- [ ] Calibration initiale réussie

### v1.1 - Automatisation basique
- [ ] Navigation entre amis
- [ ] Boucle d'analyse automatique
- [ ] Gestion d'erreurs de base

### v1.2 - Fonctionnalités avancées
- [ ] Notifications
- [ ] Export des données
- [ ] Interface de configuration

### v2.0 - Production ready
- [ ] Tests complets
- [ ] Documentation finale
- [ ] Optimisations performances
- [ ] Sécurité renforcée

## 📝 Notes de développement

### Problèmes connus à résoudre
- [ ] La méthode `toBuffer()` de nut-js n'existe pas - utiliser une alternative
- [ ] Patterns OCR à adapter selon le jeu cible
- [ ] Coordonnées de capture à calibrer manuellement

### Idées d'améliorations futures
- [ ] Support multi-jeux avec configs différentes
- [ ] API REST pour contrôle à distance
- [ ] Mode apprentissage automatique des patterns
- [ ] Intégration avec bases de données externes
- [ ] Support mobile/tablette

---

## 🚨 Important

⚠️ **Rappel éthique**: Cet outil est destiné à l'analyse et à l'aide à la décision. Respectez toujours les conditions d'utilisation de votre jeu et les règles de fair-play de la communauté.

---

*Dernière mise à jour: 27 juillet 2025*
