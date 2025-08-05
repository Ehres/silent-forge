import { OCRService } from './modules/ocr-service';
import { Logger } from './utils/logger';
import path from 'path';

async function testMonumentOCR() {
  const ocrService = new OCRService();
  const logger = new Logger();

  logger.info("🧪 Test de l'analyse OCR de tableau de monument...");

  // Test avec une vraie image de monument
  const imagePath = path.join(
    __dirname,
    '..',
    'captures',
    'monument_2025-08-05T19-23-32-266Z.png'
  );

  try {
    logger.info(`📁 Analyse de l'image: ${imagePath}`);

    const monumentData = await ocrService.analyzeMonument(
      imagePath,
      'TestOwner'
    );

    logger.success('✅ Analyse terminée !');
    logger.info(`📊 Résultats:`);
    logger.info(`   Monument: ${monumentData.name}`);
    logger.info(`   Timestamp: ${monumentData.timestamp}`);
    logger.info(
      `   Investissements existants: ${monumentData.hasExistingInvestments}`
    );

    if (monumentData.investmentData) {
      const data = monumentData.investmentData;
      logger.info(
        `   Propriétaire: ${data.ownerName} (${data.ownerForgePoints} PF)`
      );
      logger.info(`   Investisseurs: ${data.playerInvestments.length}`);

      data.playerInvestments.forEach((investment, index) => {
        logger.info(
          `     ${index + 1}. ${investment.playerName}: ${investment.forgePoints} PF (rang ${investment.rank})`
        );
      });
    }
  } catch (error) {
    logger.error('❌ Erreur lors du test:', error);
  }
}

// Lancer le test
testMonumentOCR()
  .then(() => {
    const logger = new Logger();
    logger.success('🏁 Test terminé');
  })
  .catch((error) => {
    const logger = new Logger();
    logger.error('💥 Test échoué:', error);
  });
