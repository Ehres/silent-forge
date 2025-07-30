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
 * Génère une position de clic aléatoire naturelle dans un bouton
 * en évitant les bords et en favorisant une distribution gaussienne
 */
export function getRandomClickPosition(
  button: ButtonCoordinates,
  marginPercentage: number = 0.15
): { x: number; y: number } {
  // Marges pour éviter de cliquer trop près des bords
  const marginX = Math.floor(button.width * marginPercentage);
  const marginY = Math.floor(button.height * marginPercentage);

  // Zone cliquable (sans les marges)
  const clickableWidth = button.width - marginX * 2;
  const clickableHeight = button.height - marginY * 2;

  // Distribution gaussienne pour un comportement plus naturel
  const gaussianRandom = () => {
    // Box-Muller transform pour une distribution normale
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random(); // Éviter 0
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  // Position gaussienne centrée avec écart-type = 1/6 de la zone
  const gaussianX = gaussianRandom() * (clickableWidth / 6);
  const gaussianY = gaussianRandom() * (clickableHeight / 6);

  // Position finale avec contraintes
  const x = Math.max(
    marginX,
    Math.min(button.width - marginX, Math.floor(button.width / 2 + gaussianX))
  );

  const y = Math.max(
    marginY,
    Math.min(button.height - marginY, Math.floor(button.height / 2 + gaussianY))
  );

  return {
    x: button.x + x,
    y: button.y + y,
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

/**
 * Types de comportement de clic humain
 */
export type ClickBehavior = 'precise' | 'casual' | 'hurried' | 'careful';

/**
 * Génère une position de clic en fonction du comportement humain simulé
 */
export function getHumanLikeClickPosition(
  button: ButtonCoordinates,
  behavior: ClickBehavior = 'casual'
): { x: number; y: number } {
  switch (behavior) {
    case 'precise':
      // Utilisateur précis - clique près du centre avec peu de variation
      return getButtonCenterWithRandomOffset(button, 0.1);

    case 'casual':
      // Utilisateur décontracté - distribution gaussienne naturelle
      return getRandomClickPosition(button, 0.15);

    case 'hurried':
      // Utilisateur pressé - clics plus dispersés, peut aller près des bords
      return getRandomClickPosition(button, 0.05);

    case 'careful':
      // Utilisateur prudent - évite les bords, reste au centre
      return getRandomClickPosition(button, 0.25);

    default:
      return getRandomClickPosition(button);
  }
}

/**
 * Simule un pattern de clic humain réaliste avec historique
 */
export class HumanClickSimulator {
  private lastClickPositions: Array<{
    x: number;
    y: number;
    timestamp: number;
  }> = [];
  private readonly maxHistory = 10;

  /**
   * Génère une position de clic en tenant compte de l'historique
   */
  generateClickPosition(
    button: ButtonCoordinates,
    behavior: ClickBehavior = 'casual'
  ): { x: number; y: number } {
    const basePosition = getHumanLikeClickPosition(button, behavior);

    // Si c'est le même bouton que le dernier clic récent, ajouter de la variation
    const recentSimilarClicks = this.lastClickPositions
      .filter((click) => Date.now() - click.timestamp < 5000) // 5 secondes
      .filter(
        (click) =>
          Math.abs(click.x - basePosition.x) < 20 &&
          Math.abs(click.y - basePosition.y) < 20
      );

    if (recentSimilarClicks.length > 0) {
      // Ajouter plus de variation si on clique souvent au même endroit
      const extraVariation = recentSimilarClicks.length * 2;
      basePosition.x += (Math.random() - 0.5) * extraVariation;
      basePosition.y += (Math.random() - 0.5) * extraVariation;

      // S'assurer qu'on reste dans le bouton
      basePosition.x = Math.max(
        button.x,
        Math.min(button.x + button.width, basePosition.x)
      );
      basePosition.y = Math.max(
        button.y,
        Math.min(button.y + button.height, basePosition.y)
      );
    }

    // Enregistrer cette position
    this.lastClickPositions.push({
      x: basePosition.x,
      y: basePosition.y,
      timestamp: Date.now(),
    });

    // Garder seulement les derniers clics
    if (this.lastClickPositions.length > this.maxHistory) {
      this.lastClickPositions.shift();
    }

    return basePosition;
  }

  /**
   * Suggère un comportement basé sur la fréquence des clics
   */
  suggestBehavior(): ClickBehavior {
    const recentClicks = this.lastClickPositions.filter(
      (click) => Date.now() - click.timestamp < 10000
    );

    if (recentClicks.length > 5) {
      return 'hurried'; // Beaucoup de clics récents = pressé
    } else if (recentClicks.length === 0) {
      return 'careful'; // Premier clic ou long délai = prudent
    } else {
      return 'casual'; // Comportement normal
    }
  }
}
