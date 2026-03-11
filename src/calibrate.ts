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
   * Compte à rebours avant capture
   */
  private async countdown(seconds: number = 5): Promise<void> {
    this.logger.info(`⏳ Préparation... Capture dans ${seconds} secondes`);
    this.logger.info('🎮 Préparez votre écran de jeu maintenant!');

    for (let i = seconds; i > 0; i--) {
      this.logger.info(`⏰ ${i}...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.logger.info('📸 Capture en cours!');
  }

  /**
   * Capture l'écran complet pour identifier les zones d'intérêt
   */
  async captureFullScreen(): Promise<void> {
    this.logger.info("📸 Capture d'écran complète pour calibration...");

    try {
      // Compte à rebours avant capture
      await this.countdown();

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
    // Validation des paramètres
    const minSize = 50; // Taille minimale pour éviter les crashes
    const adjustedWidth = Math.max(width, minSize);
    const adjustedHeight = Math.max(height, minSize);

    if (width < minSize || height < minSize) {
      this.logger.warn(
        `⚠️ Région trop petite (${width}x${height}), ajustée à ${adjustedWidth}x${adjustedHeight}`
      );
      this.logger.info('💡 Taille minimale recommandée: 50x50 pixels');
    }

    // Validation des coordonnées
    if (x < 0 || y < 0) {
      this.logger.error('❌ Les coordonnées ne peuvent pas être négatives');
      return;
    }

    this.logger.info(
      `📸 Test de capture région: (${x}, ${y}, ${adjustedWidth}x${adjustedHeight})`
    );

    try {
      // Compte à rebours avant capture
      await this.countdown(3);

      const config = {
        region: { x, y, width: adjustedWidth, height: adjustedHeight },
      };

      const screenshot = await this.screenCapture.captureScreen(config);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      await this.screenCapture.saveCapture(
        screenshot,
        `calibration-region-${x}-${y}-${adjustedWidth}x${adjustedHeight}-${timestamp}.png`
      );

      this.logger.success('✅ Capture de région sauvegardée!');
      this.logger.info(
        '💡 Vérifiez si la zone capturée contient bien les boutons/places'
      );

      if (adjustedWidth !== width || adjustedHeight !== height) {
        this.logger.info(`📏 Région originale demandée: ${width}x${height}`);
        this.logger.info(
          `📏 Région capturée (ajustée): ${adjustedWidth}x${adjustedHeight}`
        );
      }
    } catch (error) {
      this.logger.error('❌ Erreur lors de la capture de région:', error);
      this.logger.info('💡 Suggestions:');
      this.logger.info(
        "   • Vérifiez que les coordonnées sont dans les limites de l'écran"
      );
      this.logger.info('   • Utilisez une taille plus grande (minimum 50x50)');
      this.logger.info("   • Testez d'abord avec: npm run calibrate -- full");
    }
  }

  /**
   * Séquence de captures multiples pour comparer
   */
  async captureSequence(): Promise<void> {
    this.logger.info('📸 Séquence de captures pour calibration...');
    this.logger.info(
      '🎮 Assurez-vous que votre jeu est ouvert et positionné correctement'
    );

    // Compte à rebours initial
    await this.countdown();

    const testRegions = [
      { x: 100, y: 100, width: 800, height: 600, name: 'default' },
      { x: 200, y: 150, width: 600, height: 400, name: 'centered' },
      { x: 50, y: 50, width: 1000, height: 700, name: 'large' },
    ];

    for (let i = 0; i < testRegions.length; i++) {
      const region = testRegions[i];
      this.logger.info(
        `📸 Test région ${region.name} (${i + 1}/${testRegions.length})...`
      );

      if (i > 0) {
        // Délai plus court entre captures de la séquence
        this.logger.info('⏳ Capture dans 2 secondes...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const config = {
        region: {
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height,
        },
      };

      const screenshot = await this.screenCapture.captureScreen(config);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      await this.screenCapture.saveCapture(
        screenshot,
        `calibration-${region.name}-${region.x}-${region.y}-${region.width}x${region.height}-${timestamp}.png`
      );

      this.logger.success(`✅ Capture ${region.name} sauvegardée!`);
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
    this.logger.info(
      '   • Positionnez la fenêtre du jeu comme vous le souhaitez'
    );
    this.logger.info('');
    this.logger.info('📸 ÉTAPE 2: Capture de référence');
    this.logger.info(
      '🚨 IMPORTANT: Ne bougez plus la fenêtre après le début du compte à rebours!'
    );

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
  const cliLogger = new Logger();
  const args = process.argv.slice(2);
  const command = args[0] || 'interactive';

  const calibrator = new CalibrationHelper();

  switch (command) {
    case 'full':
      await calibrator.captureFullScreen();
      break;

    case 'region': {
      const x = parseInt(args[1]) || 100;
      const y = parseInt(args[2]) || 100;
      const width = parseInt(args[3]) || 200;
      const height = parseInt(args[4]) || 200;

      if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
        cliLogger.error('Coordonnées invalides');
        cliLogger.info('Usage: npm run calibrate -- region x y width height');
        cliLogger.info('Exemple: npm run calibrate -- region 813 948 200 200');
        return;
      }

      await calibrator.testRegionCapture(x, y, width, height);
      break;
    }

    case 'sequence':
      await calibrator.captureSequence();
      break;

    case 'test': {
      const { loadConfig } = await import('./config/config');
      const config = loadConfig();
      await calibrator.testRegionCapture(
        config.capture.monumentRegion.x,
        config.capture.monumentRegion.y,
        config.capture.monumentRegion.width,
        config.capture.monumentRegion.height
      );
      break;
    }

    case 'help':
      cliLogger.info('Commandes disponibles:');
      cliLogger.info('  npm run calibrate                    # Guide interactif (défaut)');
      cliLogger.info('  npm run calibrate -- full           # Capture plein écran');
      cliLogger.info('  npm run calibrate -- region x y w h # Capture région spécifique');
      cliLogger.info('  npm run calibrate -- sequence       # Capture plusieurs régions');
      cliLogger.info('  npm run calibrate -- test           # Test config actuelle');
      cliLogger.info('  npm run calibrate -- help           # Affiche cette aide');
      cliLogger.info('');
      cliLogger.info('Exemples:');
      cliLogger.info('  npm run calibrate -- region 813 948 200 200  # Capture bouton');
      cliLogger.info('  npm run calibrate -- region 100 100 800 600  # Grande zone');
      cliLogger.info('  npm run calibrate -- test                    # Test config');
      cliLogger.info('');
      cliLogger.info('Notes importantes:');
      cliLogger.info('  - Taille minimale: 50x50 pixels (auto-ajustée si plus petite)');
      cliLogger.info('  - Les coordonnées doivent être positives');
      cliLogger.info("  - Vérifiez que la région est dans les limites de l'écran");
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
