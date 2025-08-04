import Tesseract from 'tesseract.js';
import { Image } from '@nut-tree-fork/nut-js';
import {
  MonumentData,
  MonumentPlace,
  OCRConfig,
  MonumentInvestmentData,
  PlayerInvestment,
} from '../types';
import { Logger } from '../utils/logger';

/**
 * Service OCR pour analyser les captures d'écran des Grands Monuments
 */
export class OCRService {
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
   * Analyse une capture d'écran de Grand Monument pour extraire les données
   */
  async analyzeMonument(
    image: Image,
    ownerName?: string,
    config?: OCRConfig
  ): Promise<MonumentData> {
    try {
      this.logger.info('🧠 Analyse OCR en cours...');

      const ocrConfig = { ...this.defaultConfig, ...config };

      // Simuler l'extraction des investissements
      const investmentData = await this.extractInvestmentData(image, ownerName);

      // Données de test simulées avec support des récompenses
      const places: MonumentPlace[] = [
        {
          position: 1,
          cost: 200,
          return: 280,
          playerName: 'TestPlayer1',
          isAvailable: true,
          rewards: [], // Sera rempli par analyzeMonumentOpportunities
        },
        {
          position: 2,
          cost: 180,
          return: 220,
          playerName: 'TestPlayer2',
          isAvailable: true,
          rewards: [],
        },
        {
          position: 3,
          cost: 150,
          return: 170,
          playerName: 'TestPlayer3',
          isAvailable: false,
          rewards: [],
        },
        {
          position: 4,
          cost: 300,
          return: 350,
          playerName: 'TestPlayer4',
          isAvailable: true,
          rewards: [],
        },
        {
          position: 5,
          cost: 100,
          return: 110,
          playerName: 'TestPlayer5',
          isAvailable: true,
          rewards: [],
        },
      ];

      const monumentData: MonumentData = {
        name: 'Grand Monument de Test',
        places,
        timestamp: new Date(),
        hasExistingInvestments: true,
        investmentData: investmentData,
      };

      this.logger.success(
        `✅ ${places.length} places détectées dans le monument`
      );

      if (investmentData) {
        this.logger.info(
          `💰 Données d'investissement: Propriétaire ${investmentData.ownerName} (${investmentData.ownerForgePoints} PF), ${investmentData.playerInvestments.length} autres investisseurs`
        );
      }

      return monumentData;
    } catch (error) {
      this.logger.error("Erreur lors de l'analyse OCR:", error);
      throw error;
    }
  }

  /**
   * Extrait les données d'investissement du monument via OCR
   */
  private async extractInvestmentData(
    image: Image,
    ownerName?: string
  ): Promise<MonumentInvestmentData | undefined> {
    try {
      this.logger.debug("📊 Extraction des données d'investissement...");

      // TODO: Implémenter l'OCR réelle pour extraire les investissements
      // Pour l'instant, simulons des données avec le propriétaire fourni

      const simulatedInvestmentData: MonumentInvestmentData = {
        ownerName: ownerName || 'PropriétaireInconnu',
        ownerForgePoints: Math.floor(Math.random() * 1000) + 500, // 500-1500 PF simulés
        playerInvestments: [
          {
            playerName: 'Investisseur1',
            forgePoints: Math.floor(Math.random() * 300) + 100,
            rank: 1,
          },
          {
            playerName: 'Investisseur2',
            forgePoints: Math.floor(Math.random() * 200) + 50,
            rank: 2,
          },
          {
            playerName: 'Investisseur3',
            forgePoints: Math.floor(Math.random() * 150) + 25,
            rank: 3,
          },
        ],
      };

      this.logger.debug(
        `✅ Données d'investissement simulées pour ${simulatedInvestmentData.ownerName}`
      );

      return simulatedInvestmentData;
    } catch (error) {
      this.logger.error(
        "❌ Erreur extraction données d'investissement:",
        error
      );
      return undefined;
    }
  }

  /**
   * Parse le texte OCR pour extraire les investissements réels
   * Format attendu : "PlayerName: 150 PF (rang 3)"
   */
  private parseInvestmentText(ocrText: string): PlayerInvestment[] {
    const investments: PlayerInvestment[] = [];

    // Pattern pour les investissements: "PlayerName: 150 PF (rang 3)"
    const investmentPattern = /(.+?):\s*(\d+)\s*PF\s*\(rang\s*(\d+)\)/gi;

    let match;
    while ((match = investmentPattern.exec(ocrText)) !== null) {
      const [, playerName, forgePointsStr, rankStr] = match;

      investments.push({
        playerName: playerName.trim(),
        forgePoints: parseInt(forgePointsStr),
        rank: parseInt(rankStr),
      });
    }

    return investments.sort((a, b) => a.rank - b.rank);
  }

  /**
   * Extrait les points de forge du propriétaire
   * Format attendu : "Propriétaire: 500 PF" ou similar
   */
  private parseOwnerForgePoints(ocrText: string): number {
    // Pattern pour les PF du propriétaire
    const ownerPattern = /propriétaire.*?(\d+)\s*PF/i;
    const match = ocrText.match(ownerPattern);

    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Parse le texte OCR pour extraire les informations des places
   */
  private parseMonumentText(text: string): MonumentPlace[] {
    const places: MonumentPlace[] = [];
    const lines = text.split('\n').filter((line) => line.trim().length > 0);

    this.logger.debug('Texte OCR détecté:');
    this.logger.debug(text);

    // Regex pour détecter les patterns de places
    // Format attendu: "1. PlayerName - 250 PF → 300 PF"
    const placeRegex =
      /(\d+)\.?\s*(.+?)\s*-?\s*(\d+)\s*PF\s*[→>\-]\s*(\d+)\s*PF/i;

    for (const line of lines) {
      const match = line.match(placeRegex);
      if (match) {
        const [, positionStr, playerName, costStr, returnStr] = match;

        const place: MonumentPlace = {
          position: parseInt(positionStr, 10),
          cost: parseInt(costStr, 10),
          return: parseInt(returnStr, 10),
          playerName: playerName.trim(),
          isAvailable: true, // Par défaut, les places détectées sont disponibles
        };

        places.push(place);
        this.logger.debug(
          `Place détectée: ${place.position} - ${place.playerName} (${place.cost}PF → ${place.return}PF)`
        );
      }
    }

    return places.sort((a, b) => a.position - b.position);
  }

  /**
   * Extrait le nom du monument du texte OCR
   */
  private extractMonumentName(text: string): string | null {
    const lines = text.split('\n');

    // Le nom du monument est généralement sur la première ligne ou dans une ligne contenant "Monument"
    for (const line of lines) {
      if (line.includes('Monument') || line.includes('Grand')) {
        return line.trim();
      }
    }

    // Fallback: prendre la première ligne non-vide
    const firstLine = lines.find((line) => line.trim().length > 0);
    return firstLine?.trim() || null;
  }

  /**
   * Préprocessing d'image pour améliorer l'OCR
   */
  private async preprocessImage(
    imageBuffer: Buffer,
    config: OCRConfig['preprocessing']
  ): Promise<Buffer> {
    // TODO: Implémenter le préprocessing avec une librairie comme Sharp
    // Pour l'instant, on retourne l'image telle quelle
    this.logger.debug("Préprocessing d'image (TODO: implémenter avec Sharp)");
    return imageBuffer;
  }
}
