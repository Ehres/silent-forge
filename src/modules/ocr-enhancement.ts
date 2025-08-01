/**
 * Base de connaissances des monuments et système de correction OCR
 */

export interface MonumentInfo {
  names: string[]; // Noms possibles (avec variantes)
  aliases: string[]; // Alias et abréviations
  commonOcrErrors: string[]; // Erreurs OCR communes
  minLevel: number;
  maxLevel: number;
  category: 'historique' | 'moderne' | 'religieux' | 'naturel';
}

/**
 * Base de données des monuments connus
 */
export const MONUMENTS_DATABASE: Record<string, MonumentInfo> = {
  'arc-triomphe': {
    names: ['Arc de Triomphe', 'Arc de triomphe', 'Arc De Triomphe'],
    aliases: ['Arc', 'Triomphe'],
    commonOcrErrors: [
      'Arc de Tnomphe',
      'Are de Triomphe',
      'Arc de Trlomphe',
      'Anc de Triomphe',
    ],
    minLevel: 1,
    maxLevel: 20,
    category: 'historique',
  },
  'tour-eiffel': {
    names: ['Tour Eiffel', 'tour Eiffel', 'Tour eiffel'],
    aliases: ['Eiffel', 'Tour'],
    commonOcrErrors: [
      'Tour ElFfel',
      'Tour Elffel',
      'Tour Eiffel',
      'Four Eiffel',
      'Tour Eiffei',
    ],
    minLevel: 1,
    maxLevel: 20,
    category: 'moderne',
  },
  'statue-liberte': {
    names: [
      'Statue de la Liberté',
      'statue de la liberté',
      'Statue De La Liberté',
    ],
    aliases: ['Statue', 'Liberté'],
    commonOcrErrors: [
      'Statue de la Liberte',
      'Statue de Ia Liberté',
      'Statue de la Llberté',
    ],
    minLevel: 1,
    maxLevel: 20,
    category: 'moderne',
  },
  colisee: {
    names: ['Colisée', 'colisée', 'Colisee', 'colisee'],
    aliases: ['Colisée'],
    commonOcrErrors: ['Colísée', 'Coiisée', 'Collsée', 'Cofisée'],
    minLevel: 1,
    maxLevel: 20,
    category: 'historique',
  },
  'notre-dame': {
    names: ['Notre-Dame de Paris', 'Notre Dame de Paris', 'Notre-Dame'],
    aliases: ['Notre-Dame', 'Notre Dame'],
    commonOcrErrors: ['Notre-Oame', 'Notre-Dame de Parls', 'Nofre-Dame'],
    minLevel: 1,
    maxLevel: 20,
    category: 'religieux',
  },
  versailles: {
    names: ['Château de Versailles', 'château de Versailles', 'Versailles'],
    aliases: ['Versailles', 'Château'],
    commonOcrErrors: [
      'Chateau de Versailles',
      'Château de Versallles',
      'Château de Versaliles',
    ],
    minLevel: 1,
    maxLevel: 20,
    category: 'historique',
  },
  'big-ben': {
    names: ['Big Ben', 'big Ben', 'Big ben'],
    aliases: ['Ben'],
    commonOcrErrors: ['Blg Ben', 'Big 8en', 'Biq Ben'],
    minLevel: 1,
    maxLevel: 20,
    category: 'moderne',
  },
  pyramides: {
    names: ['Pyramides de Gizeh', 'Pyramides de Giza', 'Pyramides'],
    aliases: ['Pyramides', 'Gizeh', 'Giza'],
    commonOcrErrors: ['Pyramldes', 'Pyrarnides', 'Pyramides de Glzeh'],
    minLevel: 1,
    maxLevel: 20,
    category: 'historique',
  },
};

/**
 * Service de correction et amélioration OCR
 */
export class OCREnhancementService {
  private monuments: Record<string, MonumentInfo>;

  constructor() {
    this.monuments = MONUMENTS_DATABASE;
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
    const monument = this.findMonumentByName(monumentName);
    if (!monument) return true; // Si monument inconnu, on accepte

    return level >= monument.minLevel && level <= monument.maxLevel;
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
      console.warn(
        `⚠️ Niveau incohérent: ${correctedName} niveau ${correctedLevel}`
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
  enhanceOCRData(rawData: any[]): any[] {
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
  analyzeOCRQuality(extractedData: any[]): {
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
