import { OCRService } from '../modules/ocr-service';
import { Logger } from '../utils/logger';
import path from 'path';

/**
 * Test de l'extraction séquentielle des récompenses
 */
async function testSequentialRewardsExtraction() {
  const ocrService = new OCRService();
  const logger = new Logger();

  logger.info("🧪 Test de l'extraction sequentielle des recompenses...");

  try {
    // Test avec une vraie image de monument
    const imagePath = path.join(
      __dirname,
      '..',
      'captures',
      'monument_2025-08-05T19-23-32-266Z.png'
    );

    logger.info(`📁 Analyse de l'image: ${imagePath}`);

    // 1. Analyser le monument avec OCR
    const monumentData = await ocrService.analyzeMonument(
      imagePath,
      'TestOwner'
    );

    logger.success('✅ Analyse OCR terminée !');
    logger.info(`📊 Résultats:`);
    logger.info(`   Monument: ${monumentData.name}`);
    logger.info(`   Places générées: ${monumentData.places.length}`);

    // 2. Afficher le détail des places
    logger.info(`🏛️ Détail des places:`);
    monumentData.places.forEach((place, index) => {
      const status = place.isAvailable ? '🟢 Libre' : '🔴 Occupée';
      const playerInfo = place.playerName ? ` (${place.playerName})` : '';

      logger.info(
        `   Place ${place.position}: ${status}${playerInfo} - ${place.cost} PF → ${place.return} PF`
      );
    });

    // 3. Simuler l'extraction des récompenses (sans vraie interaction souris)
    logger.info(
      `🎁 Simulation de l'extraction séquentielle des récompenses...`
    );

    for (const place of monumentData.places) {
      logger.info(
        `🔄 Traitement place ${place.position} (${place.isAvailable ? 'libre' : 'occupée'})...`
      );

      // Simuler un délai d'extraction
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Place déjà initialisée avec rewards vide
      logger.debug(
        `✅ Place ${place.position} traitée - ${place.rewards?.length || 0} récompense(s)`
      );
    }

    logger.success('🎉 Test séquentiel terminé avec succès !');

    // 4. Résumé final
    const totalPlaces = monumentData.places.length;
    const occupiedPlaces = monumentData.places.filter(
      (p) => !p.isAvailable
    ).length;
    const freePlaces = totalPlaces - occupiedPlaces;

    logger.info(`📈 Résumé:`);
    logger.info(`   Total des places: ${totalPlaces}`);
    logger.info(`   Places libres: ${freePlaces}`);
    logger.info(`   Places occupées: ${occupiedPlaces}`);

    if (monumentData.investmentData) {
      logger.info(
        `   Propriétaire: ${monumentData.investmentData.ownerName} (${monumentData.investmentData.ownerForgePoints} PF)`
      );
      logger.info(
        `   Investisseurs: ${monumentData.investmentData.playerInvestments.length}`
      );
    }
  } catch (error) {
    logger.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testSequentialRewardsExtraction();
