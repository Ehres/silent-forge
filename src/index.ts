import { ScreenCapture } from './modules/screen-capture';
import { OCRService } from './modules/ocr-service';
import { OpportunityDetector } from './modules/opportunity-detector';
import { AutomationService } from './modules/automation-service';
import { Logger } from './utils/logger';

/**
 * Point d'entrée principal de Silent Forge
 */
class SilentForge {
  private screenCapture: ScreenCapture;
  private ocrService: OCRService;
  private opportunityDetector: OpportunityDetector;
  private automationService: AutomationService;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    this.screenCapture = new ScreenCapture();
    this.ocrService = new OCRService();
    this.opportunityDetector = new OpportunityDetector();
    this.automationService = new AutomationService();
  }

  /**
   * Lance l'analyse des opportunités sur tous les amis/voisins
   */
  async start(): Promise<void> {
    this.logger.info('🚀 Démarrage de Silent Forge...');

    try {
      // Phase 1: Capturer l'écran d'un Grand Monument
      this.logger.info("📸 Capture d'écran en cours...");
      const screenshot = await this.screenCapture.captureMonument();

      // Phase 2: OCR pour lire les places
      this.logger.info('🧠 Analyse OCR des places...');
      const monumentData = await this.ocrService.analyzeMonument(screenshot);

      // Phase 3: Calcul de rentabilité
      this.logger.info('📊 Calcul des opportunités...');
      const opportunities =
        this.opportunityDetector.findOpportunities(monumentData);

      // Phase 4: Affichage des résultats
      if (opportunities.length > 0) {
        this.logger.success(
          `✅ ${opportunities.length} opportunité(s) détectée(s)!`
        );
        opportunities.forEach((opp) => {
          this.logger.info(
            `💰 Place ${opp.position}: Investir ${opp.cost}PF pour gagner ${opp.return}PF (profit: ${opp.profit}PF)`
          );
        });
      } else {
        this.logger.warn('❌ Aucune opportunité rentable détectée');
      }
    } catch (error) {
      this.logger.error("❌ Erreur lors de l'exécution:", error);
    }
  }
}

// Point d'entrée
async function main(): Promise<void> {
  const silentForge = new SilentForge();
  await silentForge.start();
}

// Exécution si ce fichier est lancé directement
if (require.main === module) {
  main().catch(console.error);
}

export default SilentForge;
