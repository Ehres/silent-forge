import { screen, Region, Image } from '@nut-tree-fork/nut-js';
import { CaptureConfig } from '../types';
import { Logger } from '../utils/logger';

/**
 * Service de capture d'écran pour les Grands Monuments
 */
export class ScreenCapture {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Capture l'écran complet ou une région spécifique
   */
  async captureScreen(config?: CaptureConfig): Promise<Image> {
    try {
      this.logger.debug("Capture d'écran en cours...");

      if (config?.region) {
        const region = new Region(
          config.region.x,
          config.region.y,
          config.region.width,
          config.region.height
        );
        return await screen.grabRegion(region);
      } else {
        return await screen.grab();
      }
    } catch (error) {
      this.logger.error("Erreur lors de la capture d'écran:", error);
      throw error;
    }
  }

  /**
   * Capture spécifiquement la zone d'un Grand Monument
   * TODO: Définir les coordonnées exactes selon le jeu
   */
  async captureMonument(): Promise<Image> {
    this.logger.info('Capture du Grand Monument...');

    // Configuration par défaut pour un Grand Monument
    // Ces valeurs devront être ajustées selon l'interface du jeu
    const monumentConfig: CaptureConfig = {
      region: {
        x: 100,
        y: 100,
        width: 800,
        height: 600,
      },
    };

    return this.captureScreen(monumentConfig);
  }

  /**
   * Sauvegarde une capture pour debug/analyse
   */
  async saveCapture(image: Image, filename: string): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');

    const capturesDir = path.join(process.cwd(), 'captures');

    // Créer le dossier captures s'il n'existe pas
    if (!fs.existsSync(capturesDir)) {
      fs.mkdirSync(capturesDir, { recursive: true });
    }

    const filepath = path.join(capturesDir, filename);

    try {
      // Tenter de sauvegarder l'image (méthode à adapter selon l'API)
      // Pour l'instant, on log juste l'information
      this.logger.debug(`Tentative de sauvegarde: ${filepath}`);
      this.logger.info(`Image capturée (sauvegarde à implémenter)`);
    } catch (error) {
      this.logger.warn("Impossible de sauvegarder l'image:", error);
    }
  }
}
