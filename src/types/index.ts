/**
 * Représente une place dans un Grand Monument
 */
export interface MonumentPlace {
  position: number;
  cost: number; // Coût en PF pour prendre cette place
  return: number; // Retour en PF si on prend cette place
  playerName?: string; // Nom du joueur actuellement à cette place
}

/**
 * Données complètes d'un Grand Monument
 */
export interface MonumentData {
  name: string;
  places: MonumentPlace[];
  timestamp: Date;
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
