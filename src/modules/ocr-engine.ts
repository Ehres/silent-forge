import Tesseract from 'tesseract.js';
import { Image } from '@nut-tree-fork/nut-js';
import { OCRConfig } from '../types/index';
import { Logger } from '../utils/logger';

/**
 * Configuration OCR pour Tesseract avec whitelist et paramètres de segmentation
 */
interface TesseractOCRConfig {
  lang: string;
  charWhitelist: string;
  pageSegMode: 'SINGLE_BLOCK';
  preserveInterwordSpaces: boolean;
}

/**
 * Moteur OCR bas niveau — wrapper autour de Tesseract.js
 * Responsable de la reconnaissance de texte brut depuis des images.
 */
export class OCREngine {
  private logger: Logger;
  private defaultConfig: OCRConfig;

  constructor() {
    this.logger = new Logger();
    this.defaultConfig = {
      language: 'eng',
      confidence: 75,
      preprocessing: {
        contrast: 1.2,
        brightness: 1.1,
        blur: 0,
      },
    };
  }

  /**
   * Reconnaissance OCR directe avec Tesseract (API haut niveau)
   * Utilise l'import par défaut de Tesseract pour les cas simples.
   */
  async recognizeWithTesseract(
    imagePath: string,
    lang: string = 'fra+eng'
  ): Promise<{ text: string; confidence: number }> {
    const result = await Tesseract.recognize(imagePath, lang, {
      logger: (message) => {
        if (message.status === 'recognizing text') {
          this.logger.debug(
            `OCR progress: ${Math.round(message.progress * 100)}%`
          );
        }
      },
    });
    return { text: result.data.text, confidence: result.data.confidence };
  }

  /**
   * Reconnaissance OCR avec worker dédié et configuration fine
   * Permet de configurer la whitelist, le mode de segmentation, etc.
   */
  async recognizeWithWorker(
    imageSource: string,
    config: TesseractOCRConfig
  ): Promise<{ text: string; confidence: number; words: Array<{ text: string; confidence: number }> }> {
    const { createWorker, PSM } = await import('tesseract.js');
    const worker = await createWorker(config.lang);

    await worker.setParameters({
      tessedit_char_whitelist: config.charWhitelist,
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: config.preserveInterwordSpaces ? '1' : '0',
      tessedit_write_images: '0',
    });

    const { data } = await worker.recognize(imageSource);
    await worker.terminate();

    return {
      text: data.text,
      confidence: data.confidence,
      words: data.words.map((w) => ({ text: w.text, confidence: w.confidence })),
    };
  }

  /**
   * Extraction de texte depuis une image de tooltip
   * Configuration optimisée pour les tooltips avec récompenses.
   */
  async extractTextFromTooltip(tooltipImage: string): Promise<string> {
    try {
      this.logger.debug('🧠 OCR tooltip en cours...');

      const result = await this.recognizeWithWorker(tooltipImage, {
        lang: 'eng+fra',
        charWhitelist:
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789+/() -',
        pageSegMode: 'SINGLE_BLOCK',
        preserveInterwordSpaces: true,
      });

      this.logger.debug(`📝 Texte tooltip OCR: "${result.text.trim()}"`);
      return result.text.trim();
    } catch (error) {
      this.logger.error('❌ Erreur OCR tooltip:', error);
      return '';
    }
  }

  /**
   * Prépare l'image pour l'OCR en identifiant le format d'entrée
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepareImageForOCR(screenshot: string | Image | Buffer): any {
    if (typeof screenshot === 'string') {
      this.logger.debug('✅ Utilisation du chemin de fichier pour OCR');
      return screenshot;
    }

    if (Buffer.isBuffer(screenshot)) {
      this.logger.debug('✅ Image déjà en format Buffer');
      return screenshot;
    }

    if (
      screenshot &&
      screenshot.data &&
      screenshot.width &&
      screenshot.height
    ) {
      this.logger.debug(
        '📸 Image @nut-tree-fork/nut-js détectée, utilisation directe pour Tesseract'
      );
      return screenshot;
    }

    this.logger.debug("⚠️ Format d'image non reconnu, tentative directe");
    return screenshot;
  }

  get config(): OCRConfig {
    return this.defaultConfig;
  }
}
