import { Logger } from '../utils/logger';
import { OCREngine } from './ocr-engine';

/**
 * Extracteur de noms de joueurs depuis des captures d'écran
 * Responsable de l'OCR et du parsing spécifique aux noms de joueurs.
 */
export class PlayerNameExtractor {
  private logger: Logger;
  private ocrEngine: OCREngine;

  constructor() {
    this.logger = new Logger();
    this.ocrEngine = new OCREngine();
  }

  /**
   * Extrait les noms des joueurs depuis une image complète via OCR
   * Configuration optimisée pour les noms composés alignés horizontalement
   */
  async extractPlayerNamesFromImage(
    imagePath: string,
    maxPlayers: number = 5
  ): Promise<string[]> {
    try {
      this.logger.debug(
        "🧠 Lancement de l'OCR pour extraction des noms composés..."
      );

      const result = await this.ocrEngine.recognizeWithWorker(imagePath, {
        lang: 'eng+fra',
        charWhitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789_- '",
        pageSegMode: 'SINGLE_BLOCK',
        preserveInterwordSpaces: true,
      });

      this.logger.debug(`📝 Texte OCR brut: "${result.text}"`);

      const playerNames = this.parsePlayerNamesFromOCRText(
        result.text,
        maxPlayers
      );

      return playerNames;
    } catch (error) {
      this.logger.error('❌ Erreur OCR extraction noms joueurs:', error);
      return [];
    }
  }

  /**
   * Parse le texte OCR pour extraire les noms individuels des joueurs
   */
  private parsePlayerNamesFromOCRText(
    ocrText: string,
    maxPlayers: number = 5
  ): string[] {
    try {
      const playerNames: string[] = [];

      this.logger.debug(
        `🔍 Parsing du texte OCR pour extraire ${maxPlayers} noms...`
      );

      const cleanedText = ocrText
        .replace(/\n/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      this.logger.debug(`📝 Texte nettoyé: "${cleanedText}"`);

      // Stratégie 1: Diviser par des séparateurs logiques
      let potentialNames: string[] = [];

      const separatorPatterns = [
        /\s{3,}/g,
        /\s*\|\s*/g,
        /\s*-{2,}\s*/g,
        /\s*_{2,}\s*/g,
      ];

      let workingText = cleanedText;
      for (const pattern of separatorPatterns) {
        if (pattern.test(workingText)) {
          potentialNames = workingText.split(pattern);
          this.logger.debug(
            `✂️ Division par pattern ${pattern}: ${potentialNames.length} segments`
          );
          break;
        }
      }

      // Stratégie 2: Division par espacement calculé
      if (potentialNames.length === 0 || potentialNames.length === 1) {
        this.logger.debug('🧮 Tentative de division par espacement calculé...');
        potentialNames = this.divideTextByCalculatedSpacing(
          cleanedText,
          maxPlayers
        );
      }

      // Stratégie 3: Fallback par mots simples
      if (potentialNames.length === 0) {
        this.logger.debug('⚠️ Fallback: division par mots simples');
        potentialNames = cleanedText.split(/\s+/);
      }

      // Nettoyer et valider chaque nom potentiel
      for (
        let i = 0;
        i < potentialNames.length && playerNames.length < maxPlayers;
        i++
      ) {
        const rawName = potentialNames[i].trim();

        if (rawName.length === 0) continue;

        const cleanedName = rawName
          .replace(/[^\w\s\-\'\u00C0-\u017F]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (this.isValidPlayerName(cleanedName)) {
          playerNames.push(cleanedName);
          this.logger.debug(`✅ Nom valide trouvé: "${cleanedName}"`);
        } else {
          this.logger.debug(`❌ Nom invalide rejeté: "${cleanedName}"`);
        }
      }

      this.logger.debug(
        `🎯 ${playerNames.length} nom(s) final(aux) extraits: [${playerNames.join('", "')}]`
      );
      return playerNames;
    } catch (error) {
      this.logger.error('❌ Erreur parsing noms de joueurs:', error);
      return [];
    }
  }

  /**
   * Valide si une chaîne est un nom de joueur valide
   */
  private isValidPlayerName(name: string): boolean {
    if (name.length < 2) return false;
    if (/^\d+$/.test(name)) return false;
    if (!/[a-zA-ZÀ-ÿ]/.test(name)) return false;
    if (name.length > 25) return false;

    const wordCount = name.split(/\s+/).length;
    if (wordCount > 4) return false;

    return true;
  }

  /**
   * Divise le texte en utilisant un espacement calculé basé sur le nombre de joueurs attendus
   */
  private divideTextByCalculatedSpacing(
    text: string,
    expectedPlayers: number
  ): string[] {
    if (text.length < expectedPlayers * 3) {
      return [text];
    }

    const averageLength = Math.floor(text.length / expectedPlayers);
    const names: string[] = [];

    let currentPos = 0;
    for (let i = 0; i < expectedPlayers && currentPos < text.length; i++) {
      let endPos = Math.min(currentPos + averageLength, text.length);

      if (endPos < text.length) {
        const nextSpace = text.indexOf(' ', endPos);
        if (nextSpace !== -1 && nextSpace - endPos < averageLength / 2) {
          endPos = nextSpace;
        }
      }

      const segment = text.substring(currentPos, endPos).trim();
      if (segment.length > 0) {
        names.push(segment);
      }

      currentPos = endPos + 1;
    }

    this.logger.debug(
      `🧮 Division calculée: ${names.length} segments de longueur moyenne ${averageLength}`
    );
    return names;
  }
}
