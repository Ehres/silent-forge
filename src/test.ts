import { ScreenCapture } from './modules/screen-capture';
import { OCRService } from './modules/ocr-service';
import { Logger } from './utils/logger';

/**
 * Version simplifiée pour tester la capture d'écran et l'OCR
 */
class TestSilentForge {
  private screenCapture: ScreenCapture;
  private ocrService: OCRService;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    this.screenCapture = new ScreenCapture();
    this.ocrService = new OCRService();
  }

  /**
   * Test de capture d'écran simple
   */
  async testScreenCapture(): Promise<void> {
    this.logger.info("🧪 Test de capture d'écran...");

    try {
      // Capture de l'écran complet
      const screenshot = await this.screenCapture.captureScreen();

      // Sauvegarde pour inspection
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await this.screenCapture.saveCapture(
        screenshot,
        `test-capture-${timestamp}.png`
      );

      this.logger.success("✅ Capture d'écran réussie!");
      this.logger.info(`📸 Image sauvegardée dans le dossier captures/`);
    } catch (error) {
      this.logger.error('❌ Erreur lors de la capture:', error);
    }
  }

  /**
   * Test OCR sur une image de test
   */
  async testOCR(): Promise<void> {
    this.logger.info('🧪 Test OCR...');

    try {
      // Capture d'écran d'abord
      const screenshot = await this.screenCapture.captureScreen();

      // Analyse OCR
      const monumentData = await this.ocrService.analyzeMonument(screenshot);

      this.logger.success('✅ Analyse OCR terminée!');
      this.logger.info(`🏛️ Monument: ${monumentData.name}`);
      this.logger.info(`📊 Places détectées: ${monumentData.places.length}`);

      // Afficher les places détectées
      monumentData.places.forEach((place) => {
        this.logger.info(
          `   Place ${place.position}: ${place.cost}PF → ${place.return}PF (${place.playerName || 'Inconnu'})`
        );
      });
    } catch (error) {
      this.logger.error('❌ Erreur lors du test OCR:', error);
    }
  }

  /**
   * Test complet: capture + OCR + détection d'opportunités
   */
  async testComplete(): Promise<void> {
    this.logger.info('🧪 Test complet de Silent Forge...');

    try {
      // Import dynamique du module principal pour éviter les erreurs de compilation
      const { OpportunityDetector } = await import(
        './modules/opportunity-detector'
      );
      const opportunityDetector = new OpportunityDetector();

      // Capture
      this.logger.info("📸 Étape 1: Capture d'écran...");
      const screenshot = await this.screenCapture.captureScreen();

      // OCR
      this.logger.info('🧠 Étape 2: Analyse OCR...');
      const monumentData = await this.ocrService.analyzeMonument(screenshot);

      // Détection d'opportunités
      this.logger.info("💰 Étape 3: Détection d'opportunités...");
      const opportunities = opportunityDetector.findOpportunities(monumentData);

      // Résultats
      this.logger.success(
        `✅ Test terminé! ${opportunities.length} opportunité(s) trouvée(s)`
      );

      if (opportunities.length > 0) {
        this.logger.info('🎯 Opportunités détectées:');
        opportunities.forEach((opp) => {
          this.logger.info(
            `   Place ${opp.position}: Investir ${opp.cost}PF → Retour ${opp.return}PF (Profit: ${opp.profit}PF, ${opp.profitability.toFixed(1)}%)`
          );
        });
      }
    } catch (error) {
      this.logger.error('❌ Erreur lors du test complet:', error);
    }
  }
}

// Interface CLI pour les tests
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'complete';

  const tester = new TestSilentForge();

  switch (command) {
    case 'capture':
      await tester.testScreenCapture();
      break;
    case 'ocr':
      await tester.testOCR();
      break;
    case 'complete':
    default:
      await tester.testComplete();
      break;
  }
}

// Exécution si ce fichier est lancé directement
if (require.main === module) {
  main().catch(console.error);
}
