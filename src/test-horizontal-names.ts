#!/usr/bin/env node
/**
 * Test de la logique d'extraction horizontale des noms de joueurs
 */

import { Logger } from './utils/logger';
import { loadConfig } from './config/config';

function testHorizontalNameExtraction() {
  const logger = new Logger();
  const config = loadConfig();
  
  logger.info('🧪 Test de l\'extraction horizontale des noms de joueurs');
  
  // Configuration actuelle
  const nameRegion = config.players.nameExtractionRegion;
  logger.info(`📐 Configuration actuelle:`);
  logger.info(`   Position de base: (${nameRegion.x}, ${nameRegion.y})`);
  logger.info(`   Taille zone: ${nameRegion.width}x${nameRegion.height}px`);
  logger.info(`   Espacement horizontal: ${nameRegion.horizontalSpacing}px`);
  
  // Calcul des positions pour 5 joueurs
  logger.info(`\n🎯 Positions calculées pour ${config.ui.pagination.playersPerPage} joueurs:`);
  
  for (let playerIndex = 0; playerIndex < config.ui.pagination.playersPerPage; playerIndex++) {
    const ocrRegion = {
      x: nameRegion.x + (playerIndex * nameRegion.horizontalSpacing),
      y: nameRegion.y, // Y fixe pour alignement horizontal
      width: nameRegion.width,
      height: nameRegion.height,
    };
    
    logger.info(`   Joueur ${playerIndex + 1}: (${ocrRegion.x}, ${ocrRegion.y}) ${ocrRegion.width}x${ocrRegion.height}px`);
  }
  
  // Vérification avec le layout des cartes
  const cardLayout = config.players.cardLayout;
  logger.info(`\n🃏 Vérification avec le layout des cartes:`);
  logger.info(`   Carte de base: (${cardLayout.startX}, ${cardLayout.startY})`);
  logger.info(`   Taille carte: ${cardLayout.cardWidth}x${cardLayout.cardHeight}px`);
  logger.info(`   Espacement cartes: ${cardLayout.spacing}px`);
  
  const calculatedSpacing = cardLayout.cardWidth + cardLayout.spacing;
  logger.info(`   Espacement calculé: ${calculatedSpacing}px`);
  
  if (nameRegion.horizontalSpacing === calculatedSpacing) {
    logger.success('✅ Espacement des noms cohérent avec le layout des cartes');
  } else {
    logger.warn(`⚠️ Incohérence détectée:`);
    logger.warn(`   Espacement noms: ${nameRegion.horizontalSpacing}px`);
    logger.warn(`   Espacement cartes: ${calculatedSpacing}px`);
    logger.info(`💡 Suggestion: utiliser ${calculatedSpacing}px pour l'espacement des noms`);
  }
  
  logger.success('\n✅ Test terminé !');
}

// Exécuter le test si appelé directement
if (require.main === module) {
  testHorizontalNameExtraction();
}

export { testHorizontalNameExtraction };
