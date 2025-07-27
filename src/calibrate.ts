import { ScreenCapture } from './modules/screen-capture';
import { Logger } from './utils/logger';

/**
 * Script de calibration pour capturer et analyser les boutons à enregistrer
 */
class CalibrationHelper {
  private screenCapture: ScreenCapture;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    this.screenCapture = new ScreenCapture();
  }

  /**
   * Capture l'écran complet pour identifier les zones d'intérêt
   */
  async captureFullScreen(): Promise<void> {
    this.logger.info("📸 Capture d'écran complète pour calibration...");

    try {
      const screenshot = await this.screenCapture.captureScreen();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      await this.screenCapture.saveCapture(
        screenshot,
        `calibration-fullscreen-${timestamp}.png`
      );

      this.logger.success('✅ Capture complète sauvegardée!');
      this.logger.info('📋 Étapes suivantes:');
      this.logger.info("   1. Ouvrez l'image dans captures/");
      this.logger.info('   2. Mesurez les coordonnées du Grand Monument');
      this.logger.info('   3. Mettez à jour src/config/config.ts');
      this.logger.info('   4. Relancez avec: npm run calibrate -- region');
    } catch (error) {
      this.logger.error('❌ Erreur lors de la capture:', error);
    }
  }

  /**
   * Test de capture d'une région spécifique
   */
  async testRegionCapture(
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    this.logger.info(
      `📸 Test de capture région: (${x}, ${y}, ${width}x${height})`
    );

    try {
      const config = {
        region: { x, y, width, height },
      };

      const screenshot = await this.screenCapture.captureScreen(config);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      await this.screenCapture.saveCapture(
        screenshot,
        `calibration-region-${x}-${y}-${width}x${height}-${timestamp}.png`
      );

      this.logger.success('✅ Capture de région sauvegardée!');
      this.logger.info(
        '💡 Vérifiez si la zone capturée contient bien les boutons/places'
      );
    } catch (error) {
      this.logger.error('❌ Erreur lors de la capture de région:', error);
    }
  }

  /**
   * Séquence de captures multiples pour comparer
   */
  async captureSequence(): Promise<void> {
    this.logger.info('📸 Séquence de captures pour calibration...');

    const testRegions = [
      { x: 100, y: 100, width: 800, height: 600, name: 'default' },
      { x: 200, y: 150, width: 600, height: 400, name: 'centered' },
      { x: 50, y: 50, width: 1000, height: 700, name: 'large' },
    ];

    for (const region of testRegions) {
      this.logger.info(`📸 Test région ${region.name}...`);
      await this.testRegionCapture(
        region.x,
        region.y,
        region.width,
        region.height
      );

      // Délai entre captures
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.logger.success('✅ Séquence de calibration terminée!');
    this.logger.info('📋 Comparez les images pour choisir la meilleure région');
  }

  /**
   * Guide interactif de calibration
   */
  async interactiveCalibration(): Promise<void> {
    this.logger.info('🎯 Calibration interactive - Guide étape par étape');
    this.logger.info('');
    this.logger.info('📋 ÉTAPE 1: Préparation');
    this.logger.info('   • Ouvrez votre jeu');
    this.logger.info('   • Naviguez vers un Grand Monument');
    this.logger.info('   • Assurez-vous que les places/boutons sont visibles');
    this.logger.info('');
    this.logger.info('📸 ÉTAPE 2: Capture de référence');

    await this.captureFullScreen();

    this.logger.info('');
    this.logger.info('📐 ÉTAPE 3: Mesure des coordonnées');
    this.logger.info("   • Ouvrez l'image de capture dans un éditeur");
    this.logger.info('   • Mesurez la zone contenant les boutons:');
    this.logger.info('     - Position X (coin supérieur gauche)');
    this.logger.info('     - Position Y (coin supérieur gauche)');
    this.logger.info('     - Largeur de la zone');
    this.logger.info('     - Hauteur de la zone');
    this.logger.info('');
    this.logger.info('⚙️ ÉTAPE 4: Configuration');
    this.logger.info('   • Modifiez src/config/config.ts avec vos mesures');
    this.logger.info('   • Testez avec: npm run calibrate -- test');
  }
}

// Interface CLI
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'interactive';

  const calibrator = new CalibrationHelper();

  switch (command) {
    case 'full':
      await calibrator.captureFullScreen();
      break;

    case 'region':
      const x = parseInt(args[1]) || 100;
      const y = parseInt(args[2]) || 100;
      const width = parseInt(args[3]) || 800;
      const height = parseInt(args[4]) || 600;
      await calibrator.testRegionCapture(x, y, width, height);
      break;

    case 'sequence':
      await calibrator.captureSequence();
      break;

    case 'test':
      // Test avec la config actuelle
      const { loadConfig } = await import('./config/config');
      const config = loadConfig();
      await calibrator.testRegionCapture(
        config.capture.monumentRegion.x,
        config.capture.monumentRegion.y,
        config.capture.monumentRegion.width,
        config.capture.monumentRegion.height
      );
      break;

    case 'interactive':
    default:
      await calibrator.interactiveCalibration();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { CalibrationHelper };
