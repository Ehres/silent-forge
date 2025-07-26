import { ScreenCapture } from './modules/screen-capture';
import { OCRService } from './modules/ocr-service';
import { OpportunityDetector } from './modules/opportunity-detector';
import { Logger } from './utils/logger';
import { loadConfig } from './config/config';

/**
 * Exemple d'utilisation de Silent Forge
 * Ce script montre comment utiliser chaque module individuellement
 */

async function exampleUsage(): Promise<void> {
  const logger = new Logger();
  const config = loadConfig();

  logger.info("🎯 Exemple d'utilisation de Silent Forge");

  // 1. Initialisation des services
  const screenCapture = new ScreenCapture();
  const ocrService = new OCRService();
  const opportunityDetector = new OpportunityDetector(
    config.opportunity.minProfit,
    config.opportunity.minProfitability
  );

  try {
    // 2. Capture d'écran
    logger.info("📸 Étape 1: Capture d'écran");
    const screenshot = await screenCapture.captureMonument();

    // Optionnel: Sauvegarder la capture pour debug
    if (config.debug.saveCaptures) {
      await screenCapture.saveCapture(screenshot, `capture_${Date.now()}.png`);
      logger.info('💾 Capture sauvegardée dans le dossier captures/');
    }

    // 3. Analyse OCR
    logger.info('🧠 Étape 2: Analyse OCR');
    const monumentData = await ocrService.analyzeMonument(screenshot);

    logger.info(`📋 Monument analysé: ${monumentData.name}`);
    logger.info(`📊 Nombre de places détectées: ${monumentData.places.length}`);

    // 4. Affichage des places détectées
    monumentData.places.forEach((place) => {
      logger.info(
        `   Place ${place.position}: ${place.playerName} - ${place.cost}PF → ${place.return}PF`
      );
    });

    // 5. Détection d'opportunités
    logger.info("🔍 Étape 3: Détection d'opportunités");
    const opportunities = opportunityDetector.findOpportunities(monumentData);

    if (opportunities.length > 0) {
      logger.success(
        `🎉 ${opportunities.length} opportunité(s) rentable(s) trouvée(s):`
      );

      opportunities.forEach((opp, index) => {
        logger.info(`   ${index + 1}. Place ${opp.position}:`);
        logger.info(`      💰 Investissement: ${opp.cost}PF`);
        logger.info(`      💎 Retour: ${opp.return}PF`);
        logger.info(
          `      🎯 Profit: ${opp.profit}PF (${opp.profitability.toFixed(1)}%)`
        );
      });
    } else {
      logger.warn('😞 Aucune opportunité rentable trouvée');
    }

    // 6. Analyse globale
    logger.info('📈 Étape 4: Analyse globale');
    const analysis =
      opportunityDetector.analyzeMonumentProfitability(monumentData);

    logger.info(`📊 Résumé du monument ${monumentData.name}:`);
    logger.info(`   💰 Opportunités totales: ${analysis.totalOpportunities}`);
    logger.info(
      `   📈 Profit potentiel total: ${analysis.totalPotentialProfit}PF`
    );
    logger.info(
      `   🎯 Rentabilité moyenne: ${analysis.averageProfitability.toFixed(1)}%`
    );

    if (analysis.bestOpportunity) {
      logger.info(
        `   🏆 Meilleure opportunité: Place ${analysis.bestOpportunity.position} (${analysis.bestOpportunity.profitability.toFixed(1)}%)`
      );
    }
  } catch (error) {
    logger.error("❌ Erreur lors de l'exemple:", error);
  }
}

// Lancement de l'exemple si ce fichier est exécuté directement
if (require.main === module) {
  exampleUsage().catch(console.error);
}

export { exampleUsage };
