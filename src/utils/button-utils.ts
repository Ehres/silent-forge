/**
 * Utilitaires pour la gestion des boutons et de leurs coordonnées
 */

export interface ButtonCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calcule les coordonnées du centre d'un bouton
 */
export function getButtonCenter(button: ButtonCoordinates): {
  x: number;
  y: number;
} {
  return {
    x: button.x + Math.floor(button.width / 2),
    y: button.y + Math.floor(button.height / 2),
  };
}

/**
 * Calcule les coordonnées du centre avec un léger décalage aléatoire
 * pour simuler un comportement humain plus naturel
 */
export function getButtonCenterWithRandomOffset(
  button: ButtonCoordinates,
  maxOffsetPercentage: number = 0.3
): { x: number; y: number } {
  const center = getButtonCenter(button);

  // Calcule le décalage maximum autorisé (30% de la taille du bouton par défaut)
  const maxOffsetX = Math.floor(button.width * maxOffsetPercentage);
  const maxOffsetY = Math.floor(button.height * maxOffsetPercentage);

  // Applique un décalage aléatoire
  const offsetX = Math.floor(Math.random() * (maxOffsetX * 2 + 1)) - maxOffsetX;
  const offsetY = Math.floor(Math.random() * (maxOffsetY * 2 + 1)) - maxOffsetY;

  return {
    x: center.x + offsetX,
    y: center.y + offsetY,
  };
}

/**
 * Vérifie si des coordonnées sont dans les limites d'un bouton
 */
export function isPointInButton(
  x: number,
  y: number,
  button: ButtonCoordinates
): boolean {
  return (
    x >= button.x &&
    x <= button.x + button.width &&
    y >= button.y &&
    y <= button.y + button.height
  );
}
