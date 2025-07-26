/**
 * Configuration générale de Silent Forge
 */
export interface Config {
  // Seuils de détection d'opportunités
  opportunity: {
    minProfit: number; // Profit minimum en PF
    minProfitability: number; // Rentabilité minimum en %
  };

  // Configuration OCR
  ocr: {
    language: string;
    confidence: number;
    preprocess: boolean;
  };

  // Configuration de capture d'écran
  capture: {
    monumentRegion: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    saveCaptures: boolean;
  };

  // Configuration de debug
  debug: {
    saveCaptures: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };

  // Configuration d'automatisation
  automation: {
    enabled: boolean;
    humanLikeDelays: boolean;
    minDelay: number;
    maxDelay: number;
  };

  // Configuration de logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    colorOutput: boolean;
    saveToFile: boolean;
  };
}

/**
 * Configuration par défaut
 */
export const defaultConfig: Config = {
  opportunity: {
    minProfit: 50,
    minProfitability: 10,
  },
  ocr: {
    language: 'eng',
    confidence: 75,
    preprocess: true,
  },
  capture: {
    monumentRegion: {
      x: 100,
      y: 100,
      width: 800,
      height: 600,
    },
    saveCaptures: true,
  },
  debug: {
    saveCaptures: true,
    logLevel: 'info',
  },
  automation: {
    enabled: true,
    humanLikeDelays: true,
    minDelay: 100,
    maxDelay: 300,
  },
  logging: {
    level: 'info',
    colorOutput: true,
    saveToFile: false,
  },
};

/**
 * Charge la configuration (peut être étendue pour lire depuis un fichier)
 */
export function loadConfig(): Config {
  // Pour l'instant, retourne la config par défaut
  // TODO: Ajouter la lecture depuis un fichier config.json
  return { ...defaultConfig };
}
