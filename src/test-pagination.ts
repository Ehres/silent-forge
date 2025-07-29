import { GameNavigationService } from './modules/game-navigation-service';
import { Logger } from './utils/logger';

/**
 * Test spécifique pour vérifier la pagination avec 12 joueurs (2.4 pages)
 */
async function testPagination() {
  const logger = new Logger();
  logger.info('🧪 Test de la pagination avec 12 joueurs...');

  // Créer une liste de 12 joueurs pour tester la pagination
  const testPlayers = [
    'Joueur1',
    'Joueur2',
    'Joueur3',
    'Joueur4',
    'Joueur5',
    'Joueur6',
    'Joueur7',
    'Joueur8',
    'Joueur9',
    'Joueur10',
    'Joueur11',
    'Joueur12',
  ];

  logger.info(`📋 Liste de test: ${testPlayers.length} joueurs`);
  logger.info(`📋 Configuration: 5 joueurs par page = 3 pages attendues`);

  const navigationService = new GameNavigationService();

  try {
    await navigationService.processAllPlayers(testPlayers);
    logger.success('✅ Test de pagination terminé!');
  } catch (error) {
    logger.error('❌ Erreur lors du test:', error);
  }
}

// Lancer le test
testPagination().catch(console.error);
