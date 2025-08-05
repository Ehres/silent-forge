import { screen, Region, Image } from '@nut-tree-fork/nut-js';
import Jimp from 'jimp';
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
        x: 477,
        y: 568,
        width: 670,
        height: 195,
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

    // Assurer l'extension .png si pas présente
    const finalFilename = filename.endsWith('.png')
      ? filename
      : `${filename}.png`;
    const filepath = path.join(capturesDir, finalFilename);

    try {
      this.logger.debug(`Sauvegarde de l'image: ${filepath}`);
      this.logger.debug(
        `Dimensions: ${image.width}x${image.height}, Channels: ${image.channels}`
      );

      // Créer une image Jimp à partir du buffer de @nut-tree-fork/nut-js
      const jimpImage = await this.createJimpFromNutImage(image);

      // Sauvegarder avec Jimp (méthode synchrone)
      jimpImage.write(filepath);
      this.logger.success(`📸 Image sauvegardée: ${finalFilename}`);
    } catch (error) {
      this.logger.warn("Impossible de sauvegarder l'image:", error);
    }
  }

  /**
   * Convertit une image @nut-tree-fork/nut-js vers Jimp
   */
  private async createJimpFromNutImage(nutImage: Image): Promise<any> {
    const { width, height, data, channels } = nutImage;

    // Créer un buffer RGBA standard (4 channels)
    const rgbaBuffer = Buffer.alloc(width * height * 4);

    for (let i = 0; i < width * height; i++) {
      const srcIndex = i * channels;
      const dstIndex = i * 4;

      if (channels >= 3) {
        rgbaBuffer[dstIndex] = data[srcIndex]; // R
        rgbaBuffer[dstIndex + 1] = data[srcIndex + 1]; // G
        rgbaBuffer[dstIndex + 2] = data[srcIndex + 2]; // B
        rgbaBuffer[dstIndex + 3] = channels === 4 ? data[srcIndex + 3] : 255; // A
      } else if (channels === 1) {
        // Grayscale vers RGBA
        const gray = data[srcIndex];
        rgbaBuffer[dstIndex] = gray; // R
        rgbaBuffer[dstIndex + 1] = gray; // G
        rgbaBuffer[dstIndex + 2] = gray; // B
        rgbaBuffer[dstIndex + 3] = 255; // A
      }
    }

    // Utiliser la méthode create de Jimp avec un objet de configuration
    const jimp = await import('jimp');
    return new jimp.Jimp({
      data: rgbaBuffer,
      width,
      height,
    });
  }
}
