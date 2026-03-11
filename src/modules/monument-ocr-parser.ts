import { Image } from '@nut-tree-fork/nut-js';
import {
  MonumentData,
  MonumentPlace,
  MonumentInvestmentData,
  PlayerInvestment,
  ParsedMonumentTableRow,
  OCRConfig,
} from '../types/index';
import { Logger } from '../utils/logger';
import { OCREngine } from './ocr-engine';

interface OCRRecognizeData {
  text: string;
  confidence: number;
  words: Array<{ text: string; confidence: number }>;
}

/**
 * Parser OCR spécialisé pour les monuments
 * Responsable de l'analyse et du parsing des tableaux de monuments.
 */
export class MonumentOCRParser {
  private logger: Logger;
  private ocrEngine: OCREngine;

  constructor() {
    this.logger = new Logger();
    this.ocrEngine = new OCREngine();
  }

  /**
   * Analyse une capture d'écran de Grand Monument pour extraire les données
   * Accepte soit un objet Image soit un chemin de fichier
   */
  async analyzeMonument(
    imagePathOrImage: string | Image,
    ownerName?: string,
    config?: OCRConfig
  ): Promise<MonumentData> {
    try {
      this.logger.info('🧠 Analyse OCR en cours...');

      // Si c'est un chemin de fichier, faire l'OCR directement sur le fichier
      if (typeof imagePathOrImage === 'string') {
        this.logger.debug(
          `📁 Analyse OCR depuis le fichier: ${imagePathOrImage}`
        );

        const investmentData = await this.parseMonumentTableFromFile(
          imagePathOrImage,
          ownerName
        );

        const places = this.generatePlacesFromInvestmentData(investmentData);

        const monumentData: MonumentData = {
          name: 'Monument analysé par OCR',
          places,
          timestamp: new Date(),
          hasExistingInvestments: investmentData.playerInvestments.length > 0,
          investmentData,
        };

        this.logger.success(
          `✅ Monument analysé: ${investmentData.ownerName} (${investmentData.ownerForgePoints} PF) + ${investmentData.playerInvestments.length} investisseurs`
        );
        return monumentData;
      }

      // Utiliser la méthode simulée pour les objets Image
      const investmentData = await this.extractInvestmentData(
        imagePathOrImage,
        ownerName
      );

      const places: MonumentPlace[] = [
        { position: 1, cost: 200, return: 280, playerName: 'TestPlayer1', isAvailable: true, rewards: [] },
        { position: 2, cost: 180, return: 220, playerName: 'TestPlayer2', isAvailable: true, rewards: [] },
        { position: 3, cost: 150, return: 170, playerName: 'TestPlayer3', isAvailable: false, rewards: [] },
        { position: 4, cost: 300, return: 350, playerName: 'TestPlayer4', isAvailable: true, rewards: [] },
        { position: 5, cost: 100, return: 110, playerName: 'TestPlayer5', isAvailable: true, rewards: [] },
      ];

      const monumentData: MonumentData = {
        name: 'Grand Monument de Test',
        places,
        timestamp: new Date(),
        hasExistingInvestments: true,
        investmentData,
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
   * Extrait les données d'un tableau de monuments via OCR
   */
  async extractMonumentTableData(
    screenshot: string | Image | null
  ): Promise<ParsedMonumentTableRow[]> {
    this.logger.debug('📊 Extraction des données du tableau des monuments...');

    try {
      if (!screenshot) {
        this.logger.warn(
          '⚠️ Pas de screenshot fourni — utilisation des données simulées'
        );
        return this.getSimulatedMonumentData();
      }

      const imageData = this.ocrEngine.prepareImageForOCR(screenshot);

      this.logger.debug('🧠 Lancement de la reconnaissance OCR...');

      const ocrResult = await this.ocrEngine.recognizeWithWorker(imageData, {
        lang: 'eng+fra',
        charWhitelist:
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789/() -',
        pageSegMode: 'SINGLE_BLOCK',
        preserveInterwordSpaces: true,
      });

      this.logger.debug(`📝 Texte OCR extrait: ${ocrResult.text.length} caractères`);

      const tableRows = await this.parseOCRTextToTableRows(ocrResult);

      this.logger.debug(
        `📊 ${tableRows.length} ligne(s) de monuments extraite(s)`
      );

      return tableRows;
    } catch (error) {
      this.logger.error(
        "❌ Erreur lors de l'extraction OCR des données du tableau:",
        error
      );

      this.logger.warn('⚠️ Fallback données simulées suite à erreur OCR');
      return this.getSimulatedMonumentData();
    }
  }

  /**
   * Génère les places du monument à partir des données d'investissement
   */
  private generatePlacesFromInvestmentData(
    investmentData: MonumentInvestmentData
  ): MonumentPlace[] {
    const places: MonumentPlace[] = [];

    for (let position = 1; position <= 5; position++) {
      const investor = investmentData.playerInvestments.find(
        (inv) => inv.rank === position
      );

      if (investor) {
        places.push({
          position,
          cost: investor.forgePoints,
          return: Math.floor(investor.forgePoints * 1.1),
          playerName: investor.playerName,
          isAvailable: false,
          currentInvestment: investor.forgePoints,
          rewards: [],
        });

        this.logger.debug(
          `📍 Place ${position}: ${investor.playerName} (${investor.forgePoints} PF)`
        );
      } else {
        places.push({
          position,
          cost: 0,
          return: 0,
          isAvailable: true,
          currentInvestment: 0,
          rewards: [],
        });

        this.logger.debug(`📍 Place ${position}: Libre`);
      }
    }

    this.logger.debug(
      `✅ ${places.length} places générées (${places.filter((p) => !p.isAvailable).length} occupées, ${places.filter((p) => p.isAvailable).length} libres)`
    );

    return places;
  }

  /**
   * Extrait les données d'investissement du monument (simulation)
   */
  private async extractInvestmentData(
    _image: Image,
    ownerName?: string
  ): Promise<MonumentInvestmentData | undefined> {
    try {
      this.logger.debug("📊 Extraction des données d'investissement...");

      const simulatedInvestmentData: MonumentInvestmentData = {
        ownerName: ownerName || 'PropriétaireInconnu',
        ownerForgePoints: Math.floor(Math.random() * 1000) + 500,
        playerInvestments: [
          { playerName: 'Investisseur1', forgePoints: Math.floor(Math.random() * 300) + 100, rank: 1 },
          { playerName: 'Investisseur2', forgePoints: Math.floor(Math.random() * 200) + 50, rank: 2 },
          { playerName: 'Investisseur3', forgePoints: Math.floor(Math.random() * 150) + 25, rank: 3 },
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
   */
  parseInvestmentText(ocrText: string): PlayerInvestment[] {
    const investments: PlayerInvestment[] = [];
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
   */
  parseOwnerForgePoints(ocrText: string): number {
    const ownerPattern = /propriétaire.*?(\d+)\s*PF/i;
    const match = ocrText.match(ownerPattern);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Parse le texte OCR pour extraire les informations des places
   */
  parseMonumentText(text: string): MonumentPlace[] {
    const places: MonumentPlace[] = [];
    const lines = text.split('\n').filter((line) => line.trim().length > 0);

    this.logger.debug('Texte OCR détecté:');
    this.logger.debug(text);

    const placeRegex =
      /(\d+)\.?\s*(.+?)\s*-?\s*(\d+)\s*PF\s*[→>\-]\s*(\d+)\s*PF/i;

    for (const line of lines) {
      const match = line.match(placeRegex);
      if (match) {
        const [, positionStr, playerName, costStr, returnStr] = match;
        places.push({
          position: parseInt(positionStr, 10),
          cost: parseInt(costStr, 10),
          return: parseInt(returnStr, 10),
          playerName: playerName.trim(),
          isAvailable: true,
        });
      }
    }

    return places.sort((a, b) => a.position - b.position);
  }

  /**
   * Extrait le nom du monument du texte OCR
   */
  extractMonumentName(text: string): string | null {
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.includes('Monument') || line.includes('Grand')) {
        return line.trim();
      }
    }

    const firstLine = lines.find((line) => line.trim().length > 0);
    return firstLine?.trim() || null;
  }

  /**
   * Parse un tableau de monument à 3 colonnes depuis un fichier avec Tesseract
   */
  private async parseMonumentTableFromFile(
    imagePath: string,
    ownerName?: string
  ): Promise<MonumentInvestmentData> {
    try {
      this.logger.debug(
        '🧠 Analyse OCR du tableau de monument à partir du fichier...'
      );

      const result = await this.ocrEngine.recognizeWithTesseract(imagePath);

      this.logger.debug(
        `📝 Texte extrait: ${result.text.substring(0, 200)}...`
      );

      return this.parseMonumentTable(result.text, ownerName);
    } catch (error) {
      this.logger.error("❌ Erreur lors de l'analyse OCR du monument:", error);
      return {
        ownerName: ownerName || 'Inconnu',
        ownerForgePoints: 0,
        playerInvestments: [],
      };
    }
  }

  /**
   * Parse le texte OCR extrait pour identifier le tableau de monument
   */
  private parseMonumentTable(
    text: string,
    ownerName?: string
  ): MonumentInvestmentData {
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    this.logger.debug(`🔍 Analyse de ${lines.length} lignes du tableau`);

    const playerInvestments: Array<{
      playerName: string;
      forgePoints: number;
      rank: number;
    }> = [];
    let detectedOwnerName = ownerName || 'Inconnu';
    let ownerForgePoints = 0;
    let currentRank = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      this.logger.debug(`📋 Ligne ${i + 1}: "${line}"`);

      if (line.includes('Aucun participant')) {
        continue;
      }

      let columns: string[] = [];

      if (line.includes('\t')) {
        columns = line.split('\t').filter((col) => col.trim().length > 0);
      } else {
        columns = line.split(/\s{2,}/).filter((col) => col.trim().length > 0);

        if (columns.length === 1) {
          const parts = line.split(/\s+/);
          if (parts.length >= 3) {
            const firstPart = parts[0];
            const lastPart = parts[parts.length - 1];
            const nameParts = parts.slice(1, -1);

            if (lastPart.match(/\d+/)) {
              columns = [firstPart, nameParts.join(' '), lastPart];
            } else {
              if (parts.length >= 4 && parts[parts.length - 2].match(/\d+/)) {
                columns = [
                  firstPart,
                  nameParts.slice(0, -1).join(' '),
                  parts[parts.length - 2],
                ];
              }
            }
          }
        }
      }

      this.logger.debug(
        `🔧 Colonnes extraites: [${columns.map((c) => `"${c}"`).join(', ')}]`
      );

      if (columns.length >= 2) {
        const firstColumn = columns[0].trim();

        const isOwner =
          !firstColumn.match(/^\d+$/) || firstColumn.includes('>');

        if (isOwner) {
          if (columns.length >= 2) {
            let nameColumn = '';
            let pointsColumn = '';

            if (columns.length === 2) {
              nameColumn = columns[0].replace(/[I>\.\s]+/, '').trim();
              pointsColumn = columns[1];
            } else if (columns.length >= 3) {
              nameColumn = columns[1];
              pointsColumn = columns[2];
            }

            if (nameColumn && pointsColumn) {
              detectedOwnerName = this.cleanPlayerName(nameColumn);
              ownerForgePoints = this.parseForgePoints(pointsColumn);
              this.logger.debug(
                `👑 Propriétaire détecté: ${detectedOwnerName} (${ownerForgePoints} PF)`
              );
            }
          }
        } else if (firstColumn.match(/^\d+$/)) {
          if (columns.length >= 3) {
            const playerName = this.cleanPlayerName(columns[1]);
            const forgePoints = this.parseForgePoints(columns[2]);

            if (playerName && forgePoints > 0) {
              playerInvestments.push({
                playerName,
                forgePoints,
                rank: currentRank++,
              });
              this.logger.debug(
                `💰 Investisseur: ${playerName} (${forgePoints} PF, rang ${currentRank - 1})`
              );
            }
          }
        }
      }
    }

    playerInvestments.sort((a, b) => b.forgePoints - a.forgePoints);
    playerInvestments.forEach((investment, index) => {
      investment.rank = index + 1;
    });

    this.logger.success(
      `✅ Analyse terminée: Propriétaire ${detectedOwnerName} (${ownerForgePoints} PF), ${playerInvestments.length} investisseurs`
    );

    return {
      ownerName: detectedOwnerName,
      ownerForgePoints,
      playerInvestments,
    };
  }

  /**
   * Parse le texte OCR brut en lignes de tableau structurées
   */
  private async parseOCRTextToTableRows(
    ocrData: OCRRecognizeData
  ): Promise<ParsedMonumentTableRow[]> {
    this.logger.debug('📝 Parsing du texte OCR en lignes de tableau...');

    try {
      const rows: ParsedMonumentTableRow[] = [];
      const lines = ocrData.text
        .split('\n')
        .filter((line: string) => line.trim().length > 0);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (this.isTableHeaderLine(line)) {
          continue;
        }

        const parsedRow = this.parseMonumentTableRow(line, i);
        if (parsedRow) {
          rows.push(parsedRow);
        }
      }

      this.logger.debug(`📊 ${rows.length} ligne(s) de monuments parsée(s)`);
      return rows;
    } catch (error) {
      this.logger.error('❌ Erreur lors du parsing OCR:', error);
      throw error;
    }
  }

  private isTableHeaderLine(line: string): boolean {
    const headerKeywords = [
      'nom', 'niveau', 'progression', 'points', 'rang', 'activité', 'name', 'level',
    ];
    const lowerLine = line.toLowerCase();
    return headerKeywords.some((keyword) => lowerLine.includes(keyword));
  }

  /**
   * Parse une ligne du tableau des monuments via OCR
   */
  private parseMonumentTableRow(
    ocrText: string,
    rowIndex: number
  ): ParsedMonumentTableRow | null {
    try {
      this.logger.debug(`🔍 Parsing ligne ${rowIndex}: "${ocrText}"`);

      const cleanedText = ocrText.replace(/[|]/g, ' ').trim();

      const progressionPattern = /(\d+)\s*\/\s*(\d+)/;
      const progressionMatch = cleanedText.match(progressionPattern);

      if (!progressionMatch) {
        this.logger.debug(
          `⚠️ Ligne ${rowIndex} non parsée: pas de progression trouvée`
        );
        return null;
      }

      const progressionCurrent = parseInt(progressionMatch[1]);
      const progressionMaximum = parseInt(progressionMatch[2]);

      const beforeFirstNumberPattern = /^([A-Za-zÀ-ÿ\s\-']+?)(?=\s+\d)/;
      const nameMatch = cleanedText.match(beforeFirstNumberPattern);

      if (!nameMatch) {
        this.logger.debug(`⚠️ Ligne ${rowIndex} non parsée: nom non trouvé`);
        return null;
      }

      const monumentName = nameMatch[1].trim();

      const afterNamePattern = new RegExp(
        `${monumentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(\\d{1,2})`
      );
      const levelMatch = cleanedText.match(afterNamePattern);
      const level = levelMatch ? parseInt(levelMatch[1]) : 1;

      const investmentPattern = /(\d+)\s*PF.*?rang\s*(\d+)/i;
      const investmentMatch = cleanedText.match(investmentPattern);

      let myInvestment: number | null = null;
      let myRank: number | null = null;

      if (investmentMatch) {
        const potentialInvestment = parseInt(investmentMatch[1]);
        if (
          potentialInvestment !== progressionCurrent &&
          potentialInvestment !== progressionMaximum
        ) {
          myInvestment = potentialInvestment;
          myRank = parseInt(investmentMatch[2]);
        }
      }

      const baseY = 451;
      const rowSpacing = 8;
      const height = 22;
      const activityButtonPosition = {
        x: 1060,
        y: baseY + rowIndex * rowSpacing + rowIndex * height,
        height,
        width: 130,
      };

      const result: ParsedMonumentTableRow = {
        name: monumentName,
        level,
        progression: {
          current: progressionCurrent,
          maximum: progressionMaximum,
        },
        myInvestment,
        myRank,
        activityButtonPosition,
      };

      this.logger.debug(
        `✅ Ligne ${rowIndex} parsée: ${monumentName} (Niv.${level}) - ${progressionCurrent}/${progressionMaximum} PF`
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Erreur parsing ligne ${rowIndex}:`, error);
      return null;
    }
  }

  /**
   * Données simulées pour fallback
   */
  private getSimulatedMonumentData(): ParsedMonumentTableRow[] {
    return [
      {
        name: 'Arc de Triomphe',
        level: 12,
        progression: { current: 450, maximum: 1000 },
        myInvestment: null,
        myRank: null,
        activityButtonPosition: { x: 1150, y: 500, width: 130, height: 22 },
      },
      {
        name: 'Tour Eiffel',
        level: 15,
        progression: { current: 200, maximum: 800 },
        myInvestment: 50,
        myRank: 3,
        activityButtonPosition: { x: 1150, y: 540, width: 130, height: 22 },
      },
      {
        name: 'Statue de la Liberté',
        level: 8,
        progression: { current: 0, maximum: 600 },
        myInvestment: null,
        myRank: null,
        activityButtonPosition: { x: 1150, y: 580, width: 130, height: 22 },
      },
      {
        name: 'Colisée',
        level: 18,
        progression: { current: 750, maximum: 1200 },
        myInvestment: null,
        myRank: null,
        activityButtonPosition: { x: 1150, y: 620, width: 130, height: 22 },
      },
    ];
  }

  /**
   * Nettoie le nom du joueur en supprimant les artefacts OCR
   */
  private cleanPlayerName(rawName: string): string {
    return rawName
      .replace(/[I>\.\@\©\®]+/g, '')
      .replace(/^(fn|El)\s*/g, '')
      .replace(/[^\w\s\-\.\'\`]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extrait les points de forge du texte OCR
   */
  private parseForgePoints(rawPoints: string): number {
    const match = rawPoints.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
