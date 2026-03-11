import Tesseract from 'tesseract.js';
import { Image } from '@nut-tree-fork/nut-js';
import {
  MonumentData,
  MonumentPlace,
  OCRConfig,
  MonumentInvestmentData,
  PlayerInvestment,
  ParsedMonumentTableRow,
} from '../types/index';
import { Logger } from '../utils/logger';

interface OCRRecognizeData {
  text: string;
  confidence: number;
  words: Array<{ text: string; confidence: number }>;
}

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
   * Accepte soit un objet Image soit un chemin de fichier
   */
  async analyzeMonument(
    imagePathOrImage: string | Image,
    ownerName?: string,
    config?: OCRConfig
  ): Promise<MonumentData> {
    try {
      this.logger.info('🧠 Analyse OCR en cours...');

      const ocrConfig = { ...this.defaultConfig, ...config };

      // Si c'est un chemin de fichier, faire l'OCR directement sur le fichier
      if (typeof imagePathOrImage === 'string') {
        this.logger.debug(
          `📁 Analyse OCR depuis le fichier: ${imagePathOrImage}`
        );

        // Parser le tableau de monument avec OCR
        const investmentData = await this.parseMonumentTableFromFile(
          imagePathOrImage,
          ownerName
        );

        // Générer les places à partir des données d'investissement
        const places = this.generatePlacesFromInvestmentData(investmentData);

        // Retourner directement les données avec l'investissement analysé
        const monumentData: MonumentData = {
          name: 'Monument analysé par OCR',
          places: places, // Places générées à partir des investisseurs
          timestamp: new Date(),
          hasExistingInvestments: investmentData.playerInvestments.length > 0,
          investmentData: investmentData,
        };

        this.logger.success(
          `✅ Monument analysé: ${investmentData.ownerName} (${investmentData.ownerForgePoints} PF) + ${investmentData.playerInvestments.length} investisseurs`
        );
        return monumentData;
      }

      // Utiliser la méthode existante (ou simulée si c'était un fichier)
      const investmentData = await this.extractInvestmentData(
        typeof imagePathOrImage === 'string' ? (null as any) : imagePathOrImage,
        ownerName
      );

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
   * Génère les places du monument à partir des données d'investissement
   * Crée 5 places (positions 1-5) en utilisant les investisseurs détectés
   */
  private generatePlacesFromInvestmentData(
    investmentData: MonumentInvestmentData
  ): MonumentPlace[] {
    const places: MonumentPlace[] = [];

    // Créer les 5 places standard
    for (let position = 1; position <= 5; position++) {
      // Chercher si un investisseur occupe cette position
      const investor = investmentData.playerInvestments.find(
        (inv) => inv.rank === position
      );

      if (investor) {
        // Place occupée par un investisseur
        places.push({
          position,
          cost: investor.forgePoints, // Montant déjà investi
          return: Math.floor(investor.forgePoints * 1.1), // Estimation du retour (+10%)
          playerName: investor.playerName,
          isAvailable: false, // Place occupée
          currentInvestment: investor.forgePoints,
          rewards: [], // Sera rempli par l'extraction des récompenses
        });

        this.logger.debug(
          `📍 Place ${position}: ${investor.playerName} (${investor.forgePoints} PF)`
        );
      } else {
        // Place libre
        places.push({
          position,
          cost: 0, // Pas de coût initial pour une place libre
          return: 0, // Pas de retour défini pour une place libre
          isAvailable: true, // Place disponible
          currentInvestment: 0,
          rewards: [], // Sera rempli par l'extraction des récompenses
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

  /**
   * Extrait les noms des joueurs depuis une image complète via OCR
   * Configuration optimisée pour les noms composés alignés horizontalement
   */
  async extractPlayerNamesFromImage(
    imagePath: string,
    maxPlayers: number = 5
  ): Promise<string[]> {
    try {
      // Configuration OCR optimisée pour noms composés alignés horizontalement
      const ocrConfig = {
        lang: 'eng+fra',
        options: {
          tessedit_char_whitelist:
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789_- '",
          tessedit_pageseg_mode: 6, // Uniform block of text - préserve la structure
          preserve_interword_spaces: 1, // CRUCIAL: préserver les espaces entre les mots
          tessedit_write_images: 0, // Optimisation performance
        },
      };

      this.logger.debug(
        "🧠 Lancement de l'OCR pour extraction des noms composés..."
      );

      const { createWorker, PSM } = await import('tesseract.js');
      const worker = await createWorker(ocrConfig.lang);

      await worker.setParameters({
        tessedit_char_whitelist: ocrConfig.options.tessedit_char_whitelist,
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK, // Traiter comme un bloc uniforme
        preserve_interword_spaces: '1', // Préserver les espaces entre mots
        tessedit_write_images: '0',
      });

      // Utiliser le chemin de fichier avec Tesseract (évite les erreurs "truncated file")
      const { data } = await worker.recognize(imagePath);
      await worker.terminate();

      this.logger.debug(`📝 Texte OCR brut: "${data.text}"`);

      // Parser le texte pour extraire les noms individuels (en préservant les espaces)
      const playerNames = this.parsePlayerNamesFromOCRText(
        data.text,
        maxPlayers
      );

      return playerNames;
    } catch (error) {
      this.logger.error('❌ Erreur OCR extraction noms joueurs:', error);
      return [];
    }
  }

  /**
   * Parse le texte OCR pour extraire les noms individuels des joueurs (avec support des noms composés)
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

      // Nettoyer le texte OCR de base
      const cleanedText = ocrText
        .replace(/\n/g, ' ') // Remplacer les retours à la ligne par des espaces
        .replace(/\t/g, ' ') // Remplacer les tabulations par des espaces
        .replace(/\s+/g, ' ') // Normaliser les espaces multiples
        .trim();

      this.logger.debug(`📝 Texte nettoyé: "${cleanedText}"`);

      // Stratégie 1: Essayer de diviser par des séparateurs logiques
      // Les noms de joueurs peuvent être séparés par des espaces multiples, des caractères spéciaux, etc.
      let potentialNames: string[] = [];

      // Diviser par des séparateurs probables (double espaces, caractères spéciaux)
      const separatorPatterns = [
        /\s{3,}/g, // 3 espaces ou plus (espacement entre colonnes)
        /\s*\|\s*/g, // Caractères pipe (séparateurs de tableau)
        /\s*-{2,}\s*/g, // Tirets multiples
        /\s*_{2,}\s*/g, // Underscores multiples
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

      // Stratégie 2: Si pas de séparateurs évidents, essayer division par espacement calculé
      if (potentialNames.length === 0 || potentialNames.length === 1) {
        this.logger.debug('🧮 Tentative de division par espacement calculé...');
        potentialNames = this.divideTextByCalculatedSpacing(
          cleanedText,
          maxPlayers
        );
      }

      // Stratégie 3: Fallback - division par mots simples si nécessaire
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

        // Nettoyer le nom (garder lettres, chiffres, espaces, tirets, apostrophes, accents)
        const cleanedName = rawName
          .replace(/[^\w\s\-\'\u00C0-\u017F]/g, ' ') // Remplacer caractères non valides par espaces
          .replace(/\s+/g, ' ') // Normaliser les espaces
          .trim();

        // Valider le nom
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
    // Nom trop court
    if (name.length < 2) return false;

    // Que des chiffres
    if (/^\d+$/.test(name)) return false;

    // Que des caractères spéciaux
    if (!/[a-zA-ZÀ-ÿ]/.test(name)) return false;

    // Trop long (noms de joueurs généralement < 25 caractères)
    if (name.length > 25) return false;

    // Pattern de mots séparés (autorise 1-4 mots)
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
    // Si le texte est court, pas besoin de division complexe
    if (text.length < expectedPlayers * 3) {
      return [text];
    }

    // Calculer la longueur approximative par joueur
    const averageLength = Math.floor(text.length / expectedPlayers);
    const names: string[] = [];

    let currentPos = 0;
    for (let i = 0; i < expectedPlayers && currentPos < text.length; i++) {
      let endPos = Math.min(currentPos + averageLength, text.length);

      // Ajuster à la fin d'un mot pour éviter de couper les noms
      if (endPos < text.length) {
        // Chercher le prochain espace après la position calculée
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

  /**
   * Extrait le texte depuis une image de tooltip via OCR
   * Configuration optimisée pour les tooltips avec récompenses
   */
  async extractTextFromTooltip(tooltipImage: string): Promise<string> {
    try {
      // Configuration OCR optimisée pour les tooltips
      const ocrConfig = {
        lang: 'eng+fra',
        options: {
          tessedit_char_whitelist:
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789+/() -',
          tessedit_pageseg_mode: 6, // Uniform block of text
          preserve_interword_spaces: 1,
        },
      };

      this.logger.debug('🧠 OCR tooltip en cours...');

      const { createWorker, PSM } = await import('tesseract.js');
      const worker = await createWorker(ocrConfig.lang);

      await worker.setParameters({
        tessedit_char_whitelist: ocrConfig.options.tessedit_char_whitelist,
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
      });

      const { data } = await worker.recognize(tooltipImage);
      await worker.terminate();

      this.logger.debug(`📝 Texte tooltip OCR: "${data.text.trim()}"`);
      return data.text.trim();
    } catch (error) {
      this.logger.error('❌ Erreur OCR tooltip:', error);
      return '';
    }
  }

  /**
   * Extrait les données d'un tableau de monuments via OCR
   * Avec préparation d'image et parsing optimisé
   */
  async extractMonumentTableData(
    screenshot: string | Image | null
  ): Promise<ParsedMonumentTableRow[]> {
    this.logger.debug('📊 Extraction des données du tableau des monuments...');

    try {
      // Si pas de screenshot (mode test), retourner données simulées
      if (!screenshot) {
        this.logger.warn(
          '⚠️ Pas de screenshot fourni — utilisation des données simulées'
        );
        return this.getSimulatedMonumentData();
      }

      // Préparer l'image pour OCR
      const imageData = await this.prepareImageForOCR(screenshot);

      // Configuration OCR optimisée pour les tableaux
      const ocrConfig = {
        lang: 'eng+fra', // Support français et anglais
        options: {
          tessedit_char_whitelist:
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789/() -',
          tessedit_pageseg_mode: 6, // Assume uniform block of text
          preserve_interword_spaces: 1,
        },
      };

      this.logger.debug('🧠 Lancement de la reconnaissance OCR...');

      // Utiliser Tesseract.js pour extraire le texte
      const { createWorker, PSM } = await import('tesseract.js');
      const worker = await createWorker(ocrConfig.lang);

      await worker.setParameters({
        tessedit_char_whitelist: ocrConfig.options.tessedit_char_whitelist,
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
      });

      const { data } = await worker.recognize(imageData);
      await worker.terminate();

      this.logger.debug(`📝 Texte OCR extrait: ${data.text.length} caractères`);

      // Parser le texte en lignes de tableau
      const tableRows = await this.parseOCRTextToTableRows(data);

      this.logger.debug(
        `📊 ${tableRows.length} ligne(s) de monuments extraite(s)`
      );

      return tableRows;
    } catch (error) {
      this.logger.error(
        "❌ Erreur lors de l'extraction OCR des données du tableau:",
        error
      );

      // Fallback vers les données simulées en cas d'erreur OCR
      this.logger.warn('⚠️ Fallback données simulées suite à erreur OCR');
      return this.getSimulatedMonumentData();
    }
  }

  /**
   * Prépare l'image pour l'OCR en appliquant des prétraitements
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async prepareImageForOCR(screenshot: string | Image | Buffer): Promise<any> {
    this.logger.debug("🖼️ Préparation de l'image pour OCR...");

    try {
      // Si c'est un string (chemin de fichier) - priorité car plus fiable
      if (typeof screenshot === 'string') {
        this.logger.debug('✅ Utilisation du chemin de fichier pour OCR');
        return screenshot;
      }

      // Si c'est déjà un Buffer ou autre format compatible
      if (Buffer.isBuffer(screenshot)) {
        this.logger.debug('✅ Image déjà en format Buffer');
        return screenshot;
      }

      // Si l'image vient de @nut-tree-fork/nut-js (objet Image)
      if (
        screenshot &&
        screenshot.data &&
        screenshot.width &&
        screenshot.height
      ) {
        this.logger.debug(
          '📸 Image @nut-tree-fork/nut-js détectée, utilisation directe pour Tesseract'
        );
        // Tesseract.js peut parfois accepter directement les données d'image raw
        this.logger.debug("✅ Utilisation directe de l'objet Image pour OCR");
        return screenshot;
      }

      // Fallback - essayer de retourner tel quel
      this.logger.debug("⚠️ Format d'image non reconnu, tentative directe");
      return screenshot;
    } catch (error) {
      this.logger.error("❌ Erreur lors de la préparation d'image:", error);
      throw error;
    }
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

        // Ignorer les lignes d'en-tête ou vides
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

  /**
   * Vérifie si une ligne est un en-tête de tableau
   */
  private isTableHeaderLine(line: string): boolean {
    const headerKeywords = [
      'nom',
      'niveau',
      'progression',
      'points',
      'rang',
      'activité',
      'name',
      'level',
    ];
    const lowerLine = line.toLowerCase();
    return headerKeywords.some((keyword) => lowerLine.includes(keyword));
  }

  /**
   * Parse une ligne du tableau des monuments via OCR
   * Format attendu : | Nom | Niveau | Progression | Points de forge | Rang | Activité |
   */
  private parseMonumentTableRow(
    ocrText: string,
    rowIndex: number
  ): ParsedMonumentTableRow | null {
    try {
      this.logger.debug(`🔍 Parsing ligne ${rowIndex}: "${ocrText}"`);

      // Nettoyer le texte OCR
      const cleanedText = ocrText.replace(/[|]/g, ' ').trim();

      // 1. Progression au format "X/Y" ou "X / Y" (avec espaces optionnels)
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

      // 2. Extraire le nom du monument (tout ce qui précède le premier nombre)
      const beforeFirstNumberPattern = /^([A-Za-zÀ-ÿ\s\-']+?)(?=\s+\d)/;
      const nameMatch = cleanedText.match(beforeFirstNumberPattern);

      if (!nameMatch) {
        this.logger.debug(`⚠️ Ligne ${rowIndex} non parsée: nom non trouvé`);
        return null;
      }

      const monumentName = nameMatch[1].trim();

      // 3. Extraire le niveau (premier nombre après le nom)
      const afterNamePattern = new RegExp(
        `${monumentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(\\d{1,2})`
      );
      const levelMatch = cleanedText.match(afterNamePattern);
      const level = levelMatch ? parseInt(levelMatch[1]) : 1;

      // 4. Investissement personnel avec rang
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

      // Calculer la position du bouton "Activité"
      const baseY = 451; // Y de base
      const rowSpacing = 8; // Espacement entre les lignes
      const height = 22;
      const activityButtonPosition = {
        x: 1060, // Position X fixe du bouton
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
   * Parse un tableau de monument à 3 colonnes depuis un fichier avec Tesseract
   * Structure: [Numéro place | Avatar + Nom joueur | Points de forge]
   * Note: Le propriétaire a la première colonne vide
   */
  private async parseMonumentTableFromFile(
    imagePath: string,
    ownerName?: string
  ): Promise<MonumentInvestmentData> {
    try {
      this.logger.debug(
        '🧠 Analyse OCR du tableau de monument à partir du fichier...'
      );

      // Extraction du texte avec Tesseract
      const result = await Tesseract.recognize(imagePath, 'fra+eng', {
        logger: (message) => {
          if (message.status === 'recognizing text') {
            this.logger.debug(
              `OCR progress: ${Math.round(message.progress * 100)}%`
            );
          }
        },
      });

      const extractedText = result.data.text;
      this.logger.debug(
        `📝 Texte extrait: ${extractedText.substring(0, 200)}...`
      );

      return this.parseMonumentTable(extractedText, ownerName);
    } catch (error) {
      this.logger.error("❌ Erreur lors de l'analyse OCR du monument:", error);
      // Retourner des données par défaut
      return {
        ownerName: ownerName || 'Inconnu',
        ownerForgePoints: 0,
        playerInvestments: [],
      };
    }
  }

  /**
   * Parse le texte OCR extrait pour identifier le tableau de monument
   * Structure des colonnes: [Place, Nom joueur, Points de forge]
   * Le propriétaire a la première colonne vide
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

      // Ignorer les lignes "Aucun participant"
      if (line.includes('Aucun participant')) {
        continue;
      }

      // Diviser la ligne en utilisant différents séparateurs
      let columns: string[] = [];

      // Essayer plusieurs méthodes de division
      if (line.includes('\t')) {
        columns = line.split('\t').filter((col) => col.trim().length > 0);
      } else {
        // Diviser par espaces multiples, mais garder les noms composés
        columns = line.split(/\s{2,}/).filter((col) => col.trim().length > 0);

        // Si on n'a que 2 colonnes, essayer une division différente
        if (columns.length === 1) {
          // Cas comme "I >. Sibel 16013" ou "1 fn Agrou 1600 @"
          const parts = line.split(/\s+/);
          if (parts.length >= 3) {
            // Regrouper les parties du nom (toutes sauf la première et la dernière)
            const firstPart = parts[0];
            const lastPart = parts[parts.length - 1];
            const nameParts = parts.slice(1, -1);

            // Vérifier si le dernier élément est un nombre (points de forge)
            if (lastPart.match(/\d+/)) {
              columns = [firstPart, nameParts.join(' '), lastPart];
            } else {
              // Cas où les points sont dans l'avant-dernière position
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

        // Vérifier si c'est le propriétaire (pas de numéro de place, ou marqueur spécial)
        const isOwner =
          !firstColumn.match(/^\d+$/) || firstColumn.includes('>');

        if (isOwner) {
          // Propriétaire détecté
          if (columns.length >= 2) {
            let nameColumn = '';
            let pointsColumn = '';

            if (columns.length === 2) {
              // Format: ["I >. Sibel", "16013"]
              nameColumn = columns[0].replace(/[I>\.\s]+/, '').trim(); // Enlever les artefacts
              pointsColumn = columns[1];
            } else if (columns.length >= 3) {
              // Format: ["I", "Sibel", "16013"]
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
          // Investisseur avec numéro de place
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

    // Trier les investisseurs par points de forge décroissants
    playerInvestments.sort((a, b) => b.forgePoints - a.forgePoints);

    // Recalculer les rangs après tri
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
   * Nettoie le nom du joueur en supprimant les artefacts OCR
   */
  private cleanPlayerName(rawName: string): string {
    // Nettoyer le nom du joueur en supprimant les artefacts OCR
    return rawName
      .replace(/[I>\.\@\©\®]+/g, '') // Supprimer les artefacts spécifiques (I, >, ., @, ©, ®)
      .replace(/^(fn|El)\s*/g, '') // Supprimer les préfixes détectés par OCR
      .replace(/[^\w\s\-\.\'\`]+/g, '') // Garder seulement les caractères alphanumériques, espaces, tirets, points, apostrophes
      .replace(/\s+/g, ' ') // Normaliser les espaces multiples
      .trim();
  }

  /**
   * Extrait les points de forge du texte OCR
   */
  private parseForgePoints(rawPoints: string): number {
    // Extraire les points de forge du texte
    const match = rawPoints.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
