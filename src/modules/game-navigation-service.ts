import { Logger } from '../utils/logger';
import {
  InvestedMonument,
  MonumentTableRow,
  TargetMonument,
  Player,
} from '../types';
import { PlayerNavigationService } from './player-navigation-service';
import { MonumentProcessingService } from './monument-processing-service';
import { RewardExtractionService } from './reward-extraction-service';

// Re-export interfaces for backward compatibility
export { InvestedMonument, MonumentTableRow, TargetMonument, Player };

/**
 * Façade orchestrant le workflow complet de navigation et traitement.
 * Compose PlayerNavigationService, MonumentProcessingService et RewardExtractionService.
 */
export class GameNavigationService {
  private playerNavigation: PlayerNavigationService;
  private monumentProcessing: MonumentProcessingService;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();

    const rewardExtractor = new RewardExtractionService();
    this.monumentProcessing = new MonumentProcessingService(rewardExtractor);

    // Wire the player handler: delegates monument processing to MonumentProcessingService
    this.playerNavigation = new PlayerNavigationService(
      (playerPosition: number, playerName?: string) =>
        this.monumentProcessing.processCurrentPlayer(playerPosition, playerName)
    );
  }

  /**
   * Récupère la liste complète des joueurs disponibles avec filtrage
   */
  async getAllPlayersFiltered(): Promise<string[]> {
    return this.playerNavigation.getAllPlayersFiltered();
  }

  /**
   * Workflow principal : traite tous les joueurs de manière séquentielle
   */
  async processAllPlayersSequential(): Promise<void> {
    return this.playerNavigation.processAllPlayersSequential();
  }

  /**
   * Workflow avec liste de joueurs prédéfinie
   */
  async processAllPlayers(playerList: string[]): Promise<void> {
    return this.playerNavigation.processAllPlayers(playerList);
  }

  /**
   * Traite un joueur spécifique (navigation + monuments)
   */
  async processPlayer(playerName: string): Promise<void> {
    await this.playerNavigation.navigateToPlayer(playerName);
    await this.monumentProcessing.openMonumentsList();
    const monuments = await this.monumentProcessing.identifyInvestedMonuments();

    if (monuments.length === 0) {
      this.logger.info(`   ℹ️ Aucun monument ciblé trouvé pour ${playerName}`);
      await this.playerNavigation.returnToPlayersList();
      return;
    }

    this.logger.info(
      `   🏛️ ${monuments.length} monument(s) ciblé(s) détecté(s)`
    );

    for (const monument of monuments) {
      await this.monumentProcessing.processMonument(monument);
    }

    await this.playerNavigation.returnToPlayersList();
  }

  /**
   * Méthode de test pour valider la logique de filtrage
   */
  async testMonumentFiltering(): Promise<void> {
    return this.monumentProcessing.testMonumentFiltering();
  }
}
