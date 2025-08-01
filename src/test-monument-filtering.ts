#!/usr/bin/env ts-node

import { GameNavigationService } from './modules/game-navigation-service';

/**
 * Script de test pour la logique de filtrage des monuments
 */
async function testMonumentFiltering(): Promise<void> {
  console.log('🧪 Test de la logique de filtrage des monuments\n');

  try {
    const gameNavigationService = new GameNavigationService();

    // Exécuter le test de filtrage
    await gameNavigationService.testMonumentFiltering();

    console.log('\n✅ Test terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

// Exécuter le test si appelé directement
if (require.main === module) {
  testMonumentFiltering()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export { testMonumentFiltering };
