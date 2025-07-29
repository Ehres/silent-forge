import { mouse, keyboard, Point } from '@nut-tree-fork/nut-js';
import { Logger } from '../utils/logger';

/**
 * Service d'automatisation avec mouvements humains
 */
export class AutomationService {
  private logger: Logger;
  private isRunning: boolean = false;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Démarre l'automatisation
   */
  start(): void {
    this.isRunning = true;
    this.logger.info("🤖 Service d'automatisation démarré");
  }

  /**
   * Arrête l'automatisation
   */
  stop(): void {
    this.isRunning = false;
    this.logger.info("⏹️ Service d'automatisation arrêté");
  }

  /**
   * Clic humain avec mouvement irrégulier
   */
  async humanClick(x: number, y: number): Promise<void> {
    if (!this.isRunning) return;

    try {
      this.logger.debug(`🖱️ Clic humain vers (${x}, ${y})`);

      // Mouvement irrégulier vers la cible
      await this.moveMouseHumanlike(x, y);

      // Délai aléatoire avant le clic
      await this.randomDelay(50, 150);

      // Clic
      await mouse.leftClick();

      // Petit délai après le clic
      await this.randomDelay(100, 300);
    } catch (error) {
      this.logger.error('Erreur lors du clic humain:', error);
      throw error;
    }
  }

  /**
   * Mouvement de souris avec trajectoire humaine
   */
  private async moveMouseHumanlike(
    targetX: number,
    targetY: number
  ): Promise<void> {
    const currentPos = await mouse.getPosition();
    const distance = Math.sqrt(
      Math.pow(targetX - currentPos.x, 2) + Math.pow(targetY - currentPos.y, 2)
    );

    // Calculer le nombre d'étapes basé sur la distance
    const steps = Math.max(3, Math.floor(distance / 100));

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;

      // Courbe de Bézier pour un mouvement plus naturel
      const bezierProgress = this.easeInOutCubic(progress);

      // Ajouter un peu de variation aléatoire
      const randomX = (Math.random() - 0.5) * 10;
      const randomY = (Math.random() - 0.5) * 10;

      const x =
        currentPos.x + (targetX - currentPos.x) * bezierProgress + randomX;
      const y =
        currentPos.y + (targetY - currentPos.y) * bezierProgress + randomY;

      await mouse.setPosition(new Point(Math.round(x), Math.round(y)));
      await this.randomDelay(200, 1000);
    }

    // S'assurer d'arriver exactement à la cible
    await mouse.setPosition(new Point(targetX, targetY));
  }

  /**
   * Fonction d'easing pour des mouvements plus naturels
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Délai aléatoire entre min et max millisecondes
   */
  async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Saisie de texte avec délais humains
   */
  async humanType(text: string): Promise<void> {
    if (!this.isRunning) return;

    this.logger.debug(`⌨️ Saisie humaine: ${text}`);

    for (const char of text) {
      await keyboard.type(char);
      await this.randomDelay(300, 1200);
    }
  }

  /**
   * Scroll humain
   */
  async humanScroll(
    direction: 'up' | 'down',
    amount: number = 3
  ): Promise<void> {
    if (!this.isRunning) return;

    this.logger.debug(`📜 Scroll ${direction} (${amount})`);

    for (let i = 0; i < amount; i++) {
      if (direction === 'up') {
        await mouse.scrollUp(1);
      } else {
        await mouse.scrollDown(1);
      }
      await this.randomDelay(100, 200);
    }
  }

  /**
   * Navigation vers un ami/voisin (placeholder)
   */
  async navigateToFriend(friendIndex: number): Promise<void> {
    this.logger.info(`🔄 Navigation vers l'ami ${friendIndex}`);

    // TODO: Implémenter la navigation spécifique au jeu
    // Ceci est un placeholder qui devra être adapté selon l'interface

    // Exemple de séquence:
    // 1. Clic sur liste des amis
    // 2. Scroll vers l'ami
    // 3. Clic sur l'ami
    // 4. Clic sur "Visiter"

    await this.randomDelay(1000, 2000);
    this.logger.debug(`✅ Navigation vers l'ami ${friendIndex} terminée`);
  }

  /**
   * Retour au menu principal (placeholder)
   */
  async returnToMainMenu(): Promise<void> {
    this.logger.info('🏠 Retour au menu principal');

    // TODO: Implémenter selon l'interface du jeu
    await this.randomDelay(1000, 1500);
    this.logger.debug('✅ Retour au menu principal terminé');
  }
}
