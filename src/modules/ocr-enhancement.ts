import { Logger } from '../utils/logger';

/**
 * Base de connaissances des monuments et système de correction OCR
 */

export interface MonumentInfo {
  names: string[]; // Noms possibles (avec variantes)
  aliases: string[]; // Alias et abréviations
  commonOcrErrors: string[]; // Erreurs OCR communes
}

/**
 * Base de données des monuments connus
 */
export const MONUMENTS_DATABASE: Record<string, MonumentInfo> = {
  'transporteur-spatial': {
    names: [
      'Transporteur spatial',
      'Transporteur spatlal',
      'Transporteur spacial',
      'Transporteur spatiai',
      'Transporteur spatlai',
      'Transporteur spatlal',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'ile-volante': {
    names: [
      'Île volante',
      'Ile volante',
      'Île volente',
      'Île volane',
      'Ile volente',
      'Ile volane',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'noyau-ia': {
    names: [
      "Noyau d'I.A.",
      "Noyau d'IA",
      'Noyau d lA',
      "Noyau d'l.A.",
      "Noyau d'lA",
      "Noyau d'IA.",
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'saturne-vi-centaure': {
    names: [
      'Saturne VI porte CENTAURE',
      'Saturne VI porte CENTAURÉ',
      'Saturne VI porte CENTAUR3',
      'Saturne VI porte CENTAURE',
      'Saturne VI porte CENTAURE',
      'Saturne VI porte CENTAURE',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'saturne-vi-pegase': {
    names: [
      'Saturne VI porte PÉGASE',
      'Saturne VI porte PEGASE',
      'Saturne VI porte PÉGASÉ',
      'Saturne VI porte PEGAS3',
      'Saturne VI porte PÉGASE',
      'Saturne VI porte PÉGASE',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'saturne-vi-hydre': {
    names: [
      'Saturne VI porte HYDRE',
      'Saturne VI porte HYDRÉ',
      'Saturne VI porte HYDR3',
      'Saturne VI porte HYDRE',
      'Saturne VI porte HYDRE',
      'Saturne VI porte HYDRE',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'vaisseau-guerre-stellaire': {
    names: [
      'Vaisseau de guerre stellaire',
      'Vaisseau de guerre stellaine',
      'Vaisseau de guerre stellaie',
      'Vaisseau de guerre stellaire',
      'Vaisseau de guerre stellaire',
      'Vaisseau de guerre stellaire',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'catalyseur-cosmique': {
    names: [
      'Catalyseur cosmique',
      'Catalyseur cosmlque',
      'Catalyseur cosmlque',
      'Catalyseur cosmique',
      'Catalyseur cosmique',
      'Catalyseur cosmique',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  observatoire: {
    names: [
      'Observatoire',
      'Observatoir',
      'Obseruatoire',
      'Observatoirc',
      'Obseruatoirc',
      'Observatolre',
      'Obseruatoir',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'temple-des-reliques': {
    names: [
      'Temple des reliques',
      'Temple des reliaues',
      'Temple des reiiques',
      'Temple des reiiques',
      'Temole des reliques',
      'Temple des reliaues',
      'Temple des relisues',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'oracle-de-delphes': {
    names: [
      'Oracle de Delphes',
      'Oracle de Delohes',
      'Oracle de Delohes',
      'Oracle de Delohpes',
      'Oracie de Delphes',
      'Oracle de Delphes',
      'Oracie de Delohes',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'tour-de-babel': {
    names: [
      'Tour de Babel',
      'Tour de Babei',
      'Tour de Babet',
      'Tour de Bable',
      'Tour de Babei',
      'Tour de Bavei',
      'Tour de Bave1',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'statue-de-zeus': {
    names: [
      'Statue de Zeus',
      'Statue de Zevs',
      'Statue de Zeu5',
      'Statue de Zeu',
      'Statue de Zeuz',
      'Statue de Zeu5',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  colisee: {
    names: [
      'Colisée',
      'Colisee',
      'Colise',
      'Colisèe',
      'Colisec',
      'Colis6e',
      'Colisèe',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'phare-dalexandrie': {
    names: [
      "Phare d'Alexandrie",
      "Phare d'Alexandne",
      "Phare d'Alexandriee",
      "Phare d'Alexandrié",
      "Phare d'Alexandri",
      "Phare d'Alexandrié",
      "Phare d'Alexandri3",
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'hagia-sophia': {
    names: [
      'Hagia Sophia',
      'Hagia Sopha',
      'Hagia Sophla',
      'Hagia Sopbia',
      'Hagia Sophi',
      'Hagia Sophiq',
      'Hagia Sophi4',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'cathedrale-aix-la-chapelle': {
    names: [
      "Cathédrale d'Aix-la-Chapelle",
      "Cathedrale d'Aix-la-Chapelle",
      "Cathédrale d'Aix la Chapelle",
      "Cathedrale d'Aix la Chapelle",
      "Cathedrale d'Aix-la-Chapellé",
      "Cathedrale d'Aix la Chapellé",
      "Cathedrale d'Aix la Chapell3",
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'tour-de-galata': {
    names: [
      'Tour de Galata',
      'Tour de Galatà',
      'Tour de Galat',
      'Tour de Galat4',
      'Tour de Galatq',
      'Tour de Galat3',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'basilique-saint-marc': {
    names: [
      'Basilique Saint-Marc',
      'Basilique Saint Marc',
      'Basilique Saint-Mare',
      'Basilique Saint-Marcq',
      'Basilique Saint-Marc4',
      'Basilique Saint-Marc3',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'notre-dame': {
    names: [
      'Notre-Dame',
      'Notre Dame',
      'Notre-Darne',
      'Notre-Damee',
      'Notre-Damé',
      'Notre-Dam3',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'cathedrale-saint-basile': {
    names: [
      'Cathédrale Saint-Basile',
      'Cathedrale Saint-Basile',
      'Cathédrale Saint Basile',
      'Cathedrale Saint Basile',
      'Cathedrale Saint-Basilé',
      'Cathedrale Saint-Basil3',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'castel-del-monte': {
    names: [
      'Castel del Monte',
      'Castel del Monté',
      'Castel del Mont3',
      'Castel del Mont',
      'Castel del M0nte',
      'Castel del M0nt3',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'frauenkirche-dresde': {
    names: [
      'Frauenkirche de Dresde',
      'Frauenkirche de Dresdé',
      'Frauenkirche de Dresd3',
      'Frauenkirche de Dresd',
      'Frauenkirche de Dresde',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'chateau-de-deal': {
    names: [
      'Château de Deal',
      'Chateau de Deal',
      'Château de Dea1',
      'Château de DeaI',
      'Château de Dea',
      'Chateau de Dea1',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'royal-albert-hall': {
    names: [
      'Royal Albert Hall',
      'Royal Albert Hal',
      'Royal Albert Hali',
      'Royal Albert Ha11',
      'Royal Albert Hal1',
      'Royal Albert Hali',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  capitole: {
    names: [
      'Capitole',
      'Capitole',
      'Capit0le',
      'Capitole',
      'Capitole',
      'Capitole',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'chateau-frontenac': {
    names: [
      'Château Frontenac',
      'Chateau Frontenac',
      'Château Frontenac',
      'Chateau Frontenac',
      'Château Frontenac',
      'Chateau Frontenac',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  alcatraz: {
    names: [
      'Alcatraz',
      'Alcatra2',
      'AlcatraZ',
      'Alcatra7',
      'Alcatra',
      'Alcatraz',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'space-needle': {
    names: [
      'Space Needle',
      'Space Needie',
      'Space Needl',
      'Space Need1e',
      'Space NeedIe',
      'Space Need1e',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  atomium: {
    names: ['Atomium', 'Atomiurn', 'Atomlum', 'Atornium', 'Atomium', 'Atomium'],
    aliases: [],
    commonOcrErrors: [],
  },
  'cap-canaveral': {
    names: [
      'Cap Canaveral',
      'Cap Canaverai',
      'Cap Canaveral',
      'Cap Canaverai',
      'Cap Canaveral',
      'Cap Canaveral',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  lhabitat: {
    names: [
      "L'Habitat",
      "L'Habltat",
      "L'Habitat",
      "L'Habltat",
      "L'Habitat",
      "L'Habitat",
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'temple-du-lotus': {
    names: [
      'Temple du lotus',
      'Temple du lotu5',
      'Temple du lotu',
      'Temple du lotus',
      'Temple du lotus',
      'Temple du lotus',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'tour-de-linnovation': {
    names: [
      "Tour de l'innovation",
      "Tour de l'innovetion",
      "Tour de l'inn0vation",
      "Tour de l'innovatlon",
      "Tour de l'innovation",
      "Tour de l'innovation",
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'tour-de-la-treve': {
    names: [
      'Tour de la trêve',
      'Tour de la treve',
      'Tour de la trève',
      'Tour de la trêv3',
      'Tour de la trêv',
      'Tour de la trêve',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'voyager-v1': {
    names: [
      'Voyager V1',
      'Voyager Vl',
      'Voyager V1',
      'Voyager V1',
      'Voyager V1',
      'Voyager V1',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  larche: {
    names: ["L'arche", "L'arche", "L'arche", "L'arche", "L'arche", "L'arche"],
    aliases: [],
    commonOcrErrors: [],
  },
  'foret-tropicale': {
    names: [
      'Forêt tropicale',
      'Foret tropicale',
      'Forêt tropica1e',
      'Forêt tropicàle',
      'Forêt tropicàle',
      'Forêt tropicale',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'statue-de-gaia': {
    names: [
      'Statue de Gaïa',
      'Statue de Gaia',
      'Statue de Ga1a',
      'Statue de Gaïà',
      'Statue de Gaïa',
      'Statue de Gaïa',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'chambre-forte-des-graines': {
    names: [
      'Chambre forte des graines',
      'Chambre forte des graînes',
      'Chambre forte des gra1nes',
      'Chambre forte des graines',
      'Chambre forte des graines',
      'Chambre forte des graines',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'orangerie-arctique': {
    names: [
      'Orangerie arctique',
      'Orangerie arctiquc',
      'Orangerie arctiquc',
      'Orangerie arctiquc',
      'Orangerie arctique',
      'Orangerie arctique',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'musee-atlantide': {
    names: [
      "Musée de l'Atlantide",
      "Musee de l'Atlantide",
      "Musée de l'Atlantidc",
      "Musée de l'Atlantid3",
      "Musée de l'Atlantide",
      "Musée de l'Atlantide",
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  kraken: {
    names: [
      'Le Kraken',
      'Le Kraken',
      'Le Kraken',
      'Le Kraken',
      'Le Kraken',
      'Le Kraken',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'galaxie-bleue': {
    names: [
      'La galaxie bleue',
      'La galaxie bleu',
      'La galaxie bleue',
      'La galaxie bleue',
      'La galaxie bleue',
      'La galaxie bleue',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'armee-terre-cuite': {
    names: [
      'Armée de terre cuite',
      'Armee de terre cuite',
      'Armée de terre cuite',
      'Armée de terre cuite',
      'Armée de terre cuite',
      'Armée de terre cuite',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'chateau-himeji': {
    names: [
      "Château d'Himeji",
      "Chateau d'Himeji",
      "Château d'Himej1",
      "Château d'Himejl",
      "Château d'Himeji",
      "Château d'Himeji",
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'star-gazer': {
    names: [
      'Star Gazer',
      'Star Gazer',
      'Star Gazer',
      'Star Gazer',
      'Star Gazer',
      'Star Gazer',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
  'projet-virgo': {
    names: [
      'Le Projet Virgo',
      'Le Projet Virqo',
      'Le Projet Virgo',
      'Le Projet Virgo',
      'Le Projet Virgo',
      'Le Projet Virgo',
    ],
    aliases: [],
    commonOcrErrors: [],
  },
};

interface RawOCRRow {
  name: string;
  level: number;
  progression: { current: number; maximum: number };
  [key: string]: unknown;
}

/**
 * Service de correction et amélioration OCR
 */
export class OCREnhancementService {
  private monuments: Record<string, MonumentInfo>;
  private logger: Logger;

  constructor() {
    this.monuments = MONUMENTS_DATABASE;
    this.logger = new Logger();
  }

  /**
   * Corrige automatiquement le nom d'un monument basé sur l'OCR
   */
  correctMonumentName(ocrName: string): string {
    const normalizedInput = this.normalizeText(ocrName);

    // Recherche exacte d'abord
    for (const [key, monument] of Object.entries(this.monuments)) {
      for (const name of monument.names) {
        if (this.normalizeText(name) === normalizedInput) {
          return monument.names[0]; // Retourne le nom principal
        }
      }
    }

    // Recherche par alias
    for (const [key, monument] of Object.entries(this.monuments)) {
      for (const alias of monument.aliases) {
        if (normalizedInput.includes(this.normalizeText(alias))) {
          return monument.names[0];
        }
      }
    }

    // Recherche par erreurs OCR communes
    for (const [key, monument] of Object.entries(this.monuments)) {
      for (const error of monument.commonOcrErrors) {
        if (this.normalizeText(error) === normalizedInput) {
          return monument.names[0];
        }
      }
    }

    // Recherche par similarité (distance de Levenshtein)
    let bestMatch = '';
    let bestScore = 0.6; // Seuil minimum de similarité

    for (const [key, monument] of Object.entries(this.monuments)) {
      for (const name of monument.names) {
        const similarity = this.calculateSimilarity(
          normalizedInput,
          this.normalizeText(name)
        );
        if (similarity > bestScore) {
          bestScore = similarity;
          bestMatch = monument.names[0];
        }
      }
    }

    return bestMatch || ocrName; // Retourne le nom original si aucune correction trouvée
  }

  /**
   * Valide qu'un niveau est cohérent pour un monument donné
   */
  validateMonumentLevel(monumentName: string, level: number): boolean {
    // Toujours valide car nous n'avons plus de restrictions de niveau
    return true;
  }

  /**
   * Corrige un niveau incohérent basé sur des heuristiques
   */
  correctLevel(level: number): number {
    // Corrections OCR communes pour les niveaux
    if (level === 0) return 10; // OCR confond souvent 10 avec 0
    if (level > 20) return Math.floor(level / 10); // Chiffre supplémentaire détecté
    if (level < 0) return Math.abs(level);

    return level;
  }

  /**
   * Améliore les données extraites par OCR pour un seul monument
   */
  enhanceSingleMonument(monumentData: {
    name: string;
    level: number;
    progression: string;
  }): { name: string; level: number; progression: string } {
    const correctedName = this.correctMonumentName(monumentData.name);
    const correctedLevel = this.correctLevel(monumentData.level);

    // Valider la cohérence niveau/monument
    if (!this.validateMonumentLevel(correctedName, correctedLevel)) {
      // Log pour debug mais on garde les données
      this.logger.warn(
        `Niveau incohérent: ${correctedName} niveau ${correctedLevel}`
      );
    }

    return {
      name: correctedName,
      level: correctedLevel,
      progression: monumentData.progression,
    };
  }

  /**
   * Améliore les données extraites par OCR
   */
  enhanceOCRData(rawData: RawOCRRow[]): (RawOCRRow & { originalName: string; wasCorreted: boolean })[] {
    return rawData.map((row) => {
      const correctedName = this.correctMonumentName(row.name);
      const correctedLevel = this.correctLevel(row.level);

      // Valider la cohérence niveau/monument
      if (!this.validateMonumentLevel(correctedName, correctedLevel)) {
        // Log pour debug mais on garde les données
        console.warn(
          `⚠️ Niveau incohérent: ${correctedName} niveau ${correctedLevel}`
        );
      }

      return {
        ...row,
        name: correctedName,
        level: correctedLevel,
        originalName: row.name, // Garder l'original pour debug
        wasCorreted: correctedName !== row.name || correctedLevel !== row.level,
      };
    });
  }

  /**
   * Obtient des suggestions de monuments si l'OCR a échoué
   */
  getMonumentSuggestions(partialText: string): string[] {
    const normalized = this.normalizeText(partialText);
    const suggestions: string[] = [];

    for (const [key, monument] of Object.entries(this.monuments)) {
      // Recherche dans les noms et alias
      const allNames = [...monument.names, ...monument.aliases];

      for (const name of allNames) {
        if (
          this.normalizeText(name).includes(normalized) ||
          normalized.includes(this.normalizeText(name))
        ) {
          suggestions.push(monument.names[0]);
          break;
        }
      }
    }

    return [...new Set(suggestions)]; // Retirer les doublons
  }

  /**
   * Analyse la qualité de l'extraction OCR
   */
  analyzeOCRQuality(extractedData: RawOCRRow[]): {
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    let score = 100;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Vérifier le nombre de monuments détectés
    if (extractedData.length === 0) {
      score -= 50;
      issues.push('Aucun monument détecté');
      suggestions.push('Vérifier la position de capture');
      suggestions.push("Améliorer le contraste de l'image");
    }

    // Vérifier la présence de noms de monuments valides
    let validMonuments = 0;
    for (const row of extractedData) {
      if (this.findMonumentByName(row.name)) {
        validMonuments++;
      } else {
        score -= 10;
        issues.push(`Monument non reconnu: ${row.name}`);
      }
    }

    // Vérifier la cohérence des progressions
    for (const row of extractedData) {
      if (row.progression.current > row.progression.maximum) {
        score -= 15;
        issues.push(
          `Progression incohérente: ${row.progression.current}/${row.progression.maximum}`
        );
      }
    }

    // Déterminer la qualité
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) quality = 'excellent';
    else if (score >= 70) quality = 'good';
    else if (score >= 50) quality = 'fair';
    else quality = 'poor';

    // Suggestions basées sur la qualité
    if (quality === 'poor') {
      suggestions.push('Recalibrer les paramètres OCR');
      suggestions.push("Vérifier la résolution d'écran");
    } else if (quality === 'fair') {
      suggestions.push('Optimiser les paramètres de reconnaissance');
      suggestions.push('Améliorer les patterns regex');
    }

    return { quality, score, issues, suggestions };
  }

  /**
   * Normalise le texte pour la comparaison
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
      .replace(/[^\w\s]/g, '') // Retirer la ponctuation
      .trim();
  }

  /**
   * Calcule la similarité entre deux chaînes (distance de Levenshtein normalisée)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);

    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * Trouve un monument par son nom
   */
  private findMonumentByName(name: string): MonumentInfo | undefined {
    const normalized = this.normalizeText(name);

    for (const monument of Object.values(this.monuments)) {
      for (const monumentName of monument.names) {
        if (this.normalizeText(monumentName) === normalized) {
          return monument;
        }
      }
    }

    return undefined;
  }
}
