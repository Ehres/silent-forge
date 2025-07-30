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
      openMonuments: { x: number; y: number; width: number; height: number };
      openMonument: { x: number; y: number; width: number; height: number };
      closeMonument: { x: number; y: number; width: number; height: number };
      validate: { x: number; y: number; width: number; height: number };
      back: { x: number; y: number; width: number; height: number };
      nextPlayers: { x: number; y: number; width: number; height: number };
      previousPlayers: { x: number; y: number; width: number; height: number };
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
    cardLayout: {
      startX: number; // Position X de la première carte
      startY: number; // Position Y de la première carte
      cardWidth: number; // Largeur d'une carte de joueur
      cardHeight: number; // Hauteur d'une carte de joueur
      spacing: number; // Espacement horizontal entre les cartes
      monumentsButtonOffset: {
        x: number; // Décalage X du bouton "Grands Monuments" dans la carte
        y: number; // Décalage Y du bouton "Grands Monuments" dans la carte
        width: number; // Largeur du bouton
        height: number; // Hauteur du bouton
      };
    };
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
      openMonuments: { x: 813, y: 948, width: 20, height: 20 },
      openMonument: { x: 600, y: 250, width: 30, height: 30 },
      closeMonument: { x: 750, y: 100, width: 25, height: 25 },
      validate: { x: 600, y: 250, width: 80, height: 30 },
      back: { x: 100, y: 100, width: 60, height: 30 },
      nextPlayers: { x: 650, y: 550, width: 40, height: 30 }, // Bouton "Suivant" pour la pagination des joueurs
      previousPlayers: { x: 150, y: 550, width: 40, height: 30 }, // Bouton "Précédent" pour revenir en arrière
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
    cardLayout: {
      startX: 279,
      startY: 892,
      cardWidth: 104,
      cardHeight: 126,
      spacing: 60,
      monumentsButtonOffset: {
        x: 80, // Décalage relatif depuis le bord gauche de la carte (359 - 279 = 80)
        y: 60, // Décalage relatif depuis le bord haut de la carte (952 - 892 = 60)
        width: 20, // Largeur du bouton "Grands Monuments"
        height: 20, // Hauteur du bouton "Grands Monuments"
      },
    },
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
