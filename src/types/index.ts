/**
 * Représente une place dans un Grand Monument
 */
export interface MonumentPlace {
  position: number;
  cost: number; // Coût en PF pour prendre cette place
  return: number; // Retour en PF si on prend cette place
  playerName?: string; // Nom du joueur actuellement à cette place
  isAvailable: boolean; // Si la place est disponible pour investissement
  currentInvestment?: number; // Montant actuellement investi (si applicable)
  rewards?: RewardItem[]; // Récompenses associées à cette place
}

/**
 * Représente une récompense pour une place de monument
 */
export interface RewardItem {
  type: 'medal' | 'blueprint' | 'forge_points';
  quantity: number;
  description: string; // "+100 Points Forge", "+100 Médailles", "+10 Plans"
}

/**
 * Données d'investissement dans un monument
 */
export interface MonumentInvestmentData {
  ownerName: string; // Nom du propriétaire du monument
  ownerForgePoints: number; // PF du propriétaire
  playerInvestments: PlayerInvestment[]; // Investissements des autres joueurs
}

/**
 * Investissement d'un joueur dans un monument
 */
export interface PlayerInvestment {
  playerName: string;
  forgePoints: number;
  rank: number;
}

/**
 * Récompenses d'une place avec coordonnées pour hover
 */
export interface PlaceReward {
  position: number;
  rewards: RewardItem[];
  coordinatesForHover: { x: number; y: number };
}

/**
 * Données complètes d'un Grand Monument
 */
export interface MonumentData {
  name: string;
  places: MonumentPlace[];
  timestamp: Date;
  hasExistingInvestments: boolean; // Si le joueur a déjà des investissements
  totalInvested?: number; // Total des PF déjà investis
  investmentData?: MonumentInvestmentData; // Données d'investissements détaillées
}

/**
 * Représente une opportunité de snipe détectée
 */
export interface Opportunity {
  position: number;
  cost: number;
  return: number;
  profit: number; // return - cost
  profitability: number; // profit / cost (en pourcentage)
  monumentName: string;
  recommendedInvestment: number; // Montant recommandé à investir
  priority: 'high' | 'medium' | 'low'; // Priorité d'investissement
}

/**
 * Configuration pour la capture d'écran
 */
export interface CaptureConfig {
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  quality?: number;
}

/**
 * Configuration OCR
 */
export interface OCRConfig {
  language: string;
  confidence: number;
  preprocessing?: {
    contrast: number;
    brightness: number;
    blur: number;
  };
}

/**
 * Configuration spécialisée pour l'OCR de tableaux de monuments
 */
export interface MonumentTableOCRConfig extends OCRConfig {
  tableRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rowHeight: number;
  buttonColumnX: number;
  segmentation?: {
    nameColumn: { x: number; width: number };
    levelColumn: { x: number; width: number };
    progressionColumn: { x: number; width: number };
    investmentColumn: { x: number; width: number };
    rankColumn: { x: number; width: number };
  };
}

/**
 * Résultat brut de l'OCR pour une ligne de tableau
 */
export interface OCRTableRowResult {
  rowIndex: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rawText: string;
  confidence: number;
  words: {
    text: string;
    confidence: number;
    bbox: { x: number; y: number; width: number; height: number };
  }[];
}

/**
 * Configuration des zones d'interface utilisateur
 */
export interface UIRegions {
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
    spacing: number; // Espacement entre les places
  };
  buttons: {
    openMonuments: { x: number; y: number };
    openMonument: { x: number; y: number };
    closeMonument: { x: number; y: number };
    validate: { x: number; y: number };
    back: { x: number; y: number };
  };
}

/**
 * Résultat d'un traitement de joueur
 */
export interface PlayerProcessingResult {
  playerName: string;
  monumentsProcessed: number;
  totalInvestments: number;
  totalInvested: number;
  opportunities: Opportunity[];
  errors: string[];
}
