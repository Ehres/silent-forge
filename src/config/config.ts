/**
 * Configuration générale de Silent Forge
 */
export interface Config {
  // Seuils de détection d'opportunités
  opportunity: {
    minProfit: number; // Profit minimum en PF
    minProfitability: number; // Rentabilité minimum en %
    maxInvestmentPerMonument: number; // Investissement max par monument
    maxInvestmentPerPlayer: number; // Investissement max par joueur
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

  // Configuration des zones d'interface
  ui: {
    playersList: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    monumentsList: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    monumentDetails: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    investmentInputs: {
      startX: number;
      startY: number;
      spacing: number;
    };
    pagination: {
      playersPerPage: number; // Nombre de joueurs par page
      maxPages: number; // Limite de pages à parcourir (sécurité)
    };
    buttons: {
      openMonuments: { x: number; y: number };
      openMonument: { x: number; y: number };
      closeMonument: { x: number; y: number };
      validate: { x: number; y: number };
      back: { x: number; y: number };
      nextPlayers: { x: number; y: number };
      previousPlayers: { x: number; y: number };
    };
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
    maxPlayersPerSession: number; // Limite pour éviter la détection
    delayBetweenPlayers: { min: number; max: number };
  };

  // Configuration des joueurs
  players: {
    excludeList: string[]; // Liste des joueurs à exclure
    scanAllPlayers: boolean; // Si true, parcourt tous les joueurs disponibles
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
    maxInvestmentPerMonument: 1000, // Max 1000 PF par monument
    maxInvestmentPerPlayer: 5000, // Max 5000 PF par joueur
  },
  ocr: {
    language: 'eng',
    confidence: 75,
    preprocess: true,
  },
  capture: {
    monumentRegion: {
      x: 813,
      y: 948,
      width: 24,
      height: 24,
    },
    saveCaptures: true,
  },
  ui: {
    // @TODO: maybe need to remove player list
    playersList: {
      x: 50,
      y: 100,
      width: 300,
      height: 500,
    },
    monumentsList: {
      x: 813,
      y: 948,
      width: 24,
      height: 24,
    },
    monumentDetails: {
      x: 200,
      y: 200,
      width: 800,
      height: 500,
    },
    investmentInputs: {
      startX: 500,
      startY: 250,
      spacing: 50, // 50px entre chaque place
    },
    pagination: {
      playersPerPage: 5, // 5 joueurs par page
      maxPages: 20, // Maximum 20 pages (100 joueurs) par sécurité
    },
    buttons: {
      openMonuments: { x: 813, y: 948 },
      openMonument: { x: 600, y: 250 },
      closeMonument: { x: 750, y: 100 },
      validate: { x: 600, y: 250 },
      back: { x: 100, y: 100 },
      nextPlayers: { x: 650, y: 550 }, // Bouton "Suivant" pour la pagination des joueurs
      previousPlayers: { x: 150, y: 550 }, // Bouton "Précédent" pour revenir en arrière
    },
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
    maxPlayersPerSession: 10, // Max 10 joueurs par session
    delayBetweenPlayers: { min: 3000, max: 8000 }, // 3-8 secondes entre joueurs
  },
  players: {
    excludeList: [
      // Exemples de joueurs à exclure
      // 'JoueurAEviter1',
      // 'JoueurAEviter2',
    ],
    scanAllPlayers: false, // Mode séquentiel par défaut (plus fiable)
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
