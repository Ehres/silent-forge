import { AutomationService } from './automation-service';
import { ScreenCapture } from './screen-capture';
import { OCRService } from './ocr-service';
import { OCREnhancementService } from './ocr-enhancement';
import { Logger } from '../utils/logger';
import { Config, loadConfig } from '../config/config';
import {
  HumanClickSimulator,
  ButtonCoordinates,
} from '../utils/button-utils';

/**
 * Callback pour déléguer le traitement d'un joueur (ex: traitement des monuments)
 * @param playerPosition - Position du joueur (1-based pour le mode séquentiel, 0 pour le mode liste)
 * @param playerName - Nom du joueur (optionnel)
 */
export type ProcessPlayerHandler = (
  playerPosition: number,
  playerName?: string
) => Promise<void>;

/**
 * Service de navigation pour les joueurs
 * Gère la navigation, la pagination et le parcours des joueurs
 */
export class PlayerNavigationService {
  private automationService: AutomationService;
  private screenCapture: ScreenCapture;
  private ocrService: OCRService;
  private ocrEnhancement: OCREnhancementService;
  private logger: Logger;
  private config: Config;
  private clickSimulator: HumanClickSimulator;
  private processPlayerHandler: ProcessPlayerHandler;

  constructor(processPlayerHandler: ProcessPlayerHandler) {
    this.automationService = new AutomationService();
    this.screenCapture = new ScreenCapture();
    this.ocrService = new OCRService();
    this.ocrEnhancement = new OCREnhancementService();
    this.logger = new Logger();
    this.config = loadConfig();
    this.clickSimulator = new HumanClickSimulator();
    this.processPlayerHandler = processPlayerHandler;
  }

  /**
   * Récupère la liste complète des joueurs disponibles avec filtrage
   */
  async getAllPlayersFiltered(): Promise<string[]> {
    this.logger.info('🔍 Récupération de la liste complète des joueurs...');

    try {
      // Naviguer vers la liste des joueurs si nécessaire
      await this.navigateToPlayersList();

      // Récupérer tous les joueurs de toutes les pages
      const allPlayers = await this.scanAllPlayersFromAllPages();

      // Appliquer la liste d'exclusion
      const excludeList = this.config.players.excludeList || [];
      const filteredPlayers = allPlayers.filter(
        (player) => !excludeList.includes(player)
      );

      this.logger.info(
        `👥 ${allPlayers.length} joueur(s) trouvé(s), ${filteredPlayers.length} après filtrage`
      );

      if (excludeList.length > 0) {
        this.logger.info(`🚫 Joueurs exclus: ${excludeList.join(', ')}`);
      }

      return filteredPlayers;
    } catch (error) {
      this.logger.error(
        '❌ Erreur lors de la récupération des joueurs:',
        error
      );
      throw error;
    }
  }

  /**
   * Workflow principal : traite tous les joueurs de manière séquentielle
   * Mode aveugle - sans connaître les noms à l'avance
   */
  async processAllPlayersSequential(): Promise<void> {
    this.logger.info(
      '🚀 Démarrage du traitement séquentiel de tous les joueurs...'
    );
    this.logger.info('🔄 Mode aveugle - traitement par position relative');

    this.automationService.start();

    try {
      let totalPlayersProcessed = 0;
      let currentPage = 1;
      const maxPages = this.config.ui.pagination.maxPages;

      // Naviguer vers la première page des joueurs
      await this.navigateToPlayersList();

      while (currentPage <= maxPages) {
        this.logger.info(`📄 Traitement de la page ${currentPage}...`);

        // Traiter tous les joueurs de la page actuelle
        const playersProcessedOnPage =
          await this.processPlayersOnCurrentPage();

        if (playersProcessedOnPage === 0) {
          this.logger.info(
            '📄 Aucun joueur trouvé sur cette page - fin du traitement'
          );
          break;
        }

        totalPlayersProcessed += playersProcessedOnPage;
        this.logger.info(
          `📊 Page ${currentPage}: ${playersProcessedOnPage} joueur(s) traité(s)`
        );

        // Vérifier la limitation de session
        const maxPlayersPerSession =
          this.config.automation.maxPlayersPerSession;
        if (totalPlayersProcessed >= maxPlayersPerSession) {
          this.logger.warn(
            `⚠️ Limite de session atteinte: ${maxPlayersPerSession} joueurs`
          );
          break;
        }

        // Essayer de passer à la page suivante
        const hasNextPage = await this.navigateToNextPlayersPageIfExists();
        if (!hasNextPage) {
          this.logger.info('📄 Plus de pages disponibles');
          break;
        }

        currentPage++;
      }

      this.logger.success(
        `✅ Traitement terminé: ${totalPlayersProcessed} joueur(s) sur ${currentPage} page(s)`
      );
    } finally {
      this.automationService.stop();
    }
  }

  /**
   * Workflow avec liste de joueurs prédéfinie (méthode originale)
   */
  async processAllPlayers(playerList: string[]): Promise<void> {
    this.logger.info('🚀 Démarrage du traitement avec liste prédéfinie...');

    this.automationService.start();

    try {
      await this.processPlayersWithPagination(playerList);
    } finally {
      this.automationService.stop();
      this.logger.success('✅ Traitement de tous les joueurs terminé!');
    }
  }

  /**
   * Naviguer vers un joueur spécifique dans la liste
   */
  async navigateToPlayer(playerName: string): Promise<void> {
    this.logger.info(`🔍 Navigation vers le joueur ${playerName}...`);

    // TODO: Implémenter selon l'interface du jeu
    // 1. Capturer la liste des joueurs
    // 2. Utiliser OCR pour trouver le nom du joueur
    // 3. Cliquer sur le joueur

    await this.automationService.randomDelay(1000, 2000);
    this.logger.debug(`✅ Navigation vers ${playerName} simulée`);
  }

  /**
   * Retourner à la liste des joueurs
   */
  async returnToPlayersList(): Promise<void> {
    this.logger.debug('🔙 Retour à la liste des joueurs...');

    // TODO: Séquence de clics pour retourner au menu principal
    // Peut nécessiter plusieurs clics selon l'interface

    await this.automationService.randomDelay(1000, 1500);
    this.logger.debug('✅ Retour à la liste des joueurs');
  }

  /**
   * Scanne tous les joueurs de toutes les pages disponibles
   */
  private async scanAllPlayersFromAllPages(): Promise<string[]> {
    const allPlayers: string[] = [];
    const maxPages = this.config.ui.pagination.maxPages;
    let currentPage = 1;
    let hasMorePages = true;

    this.logger.info('📄 Scan de toutes les pages de joueurs...');

    while (hasMorePages && currentPage <= maxPages) {
      this.logger.info(`📄 Scan de la page ${currentPage}...`);

      // Capturer et analyser la page actuelle
      const playersOnPage = await this.extractPlayersFromCurrentPage();

      if (playersOnPage.length === 0) {
        this.logger.info(
          '📄 Aucun joueur trouvé sur cette page - fin du scan'
        );
        hasMorePages = false;
        break;
      }

      allPlayers.push(...playersOnPage);
      this.logger.info(
        `📄 ${playersOnPage.length} joueur(s) trouvé(s) sur la page ${currentPage}`
      );

      // Vérifier s'il y a une page suivante
      if (currentPage < maxPages) {
        hasMorePages = await this.navigateToNextPlayersPageIfExists();
        if (hasMorePages) {
          currentPage++;
          await this.automationService.randomDelay(1000, 2000);
        }
      } else {
        hasMorePages = false;
      }
    }

    this.logger.success(
      `✅ Scan terminé: ${allPlayers.length} joueur(s) trouvé(s) sur ${currentPage} page(s)`
    );
    return allPlayers;
  }

  /**
   * Extrait la liste des joueurs de la page actuellement affichée
   */
  private async extractPlayersFromCurrentPage(): Promise<string[]> {
    try {
      // Capturer la zone de la liste des joueurs
      const screenshot = await this.screenCapture.captureScreen({
        region: this.config.ui.playersList,
      });

      // Sauvegarder pour debug si activé
      if (this.config.debug.saveCaptures) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `players_list_page_${timestamp}`;
        await this.screenCapture.saveCapture(screenshot, filename);
      }

      // TODO: Utiliser OCR pour extraire les noms des joueurs
      // Pour l'instant, retourner une liste simulée
      const simulatedPlayers = [
        `SimulatedPlayer${Math.floor(Math.random() * 1000)}`,
        `SimulatedPlayer${Math.floor(Math.random() * 1000)}`,
        `SimulatedPlayer${Math.floor(Math.random() * 1000)}`,
        `SimulatedPlayer${Math.floor(Math.random() * 1000)}`,
        `SimulatedPlayer${Math.floor(Math.random() * 1000)}`,
      ];

      return simulatedPlayers;
    } catch (error) {
      this.logger.error(
        "❌ Erreur lors de l'extraction des joueurs:",
        error
      );
      return [];
    }
  }

  /**
   * Navigue vers la page suivante de joueurs si elle existe
   */
  private async navigateToNextPlayersPageIfExists(): Promise<boolean> {
    try {
      // TODO: Vérifier si le bouton "Suivant" est disponible/cliquable
      // Pour l'instant, simuler la navigation

      await this.automationService.humanClick(
        this.config.ui.buttons.nextPlayers.x,
        this.config.ui.buttons.nextPlayers.y
      );

      await this.automationService.randomDelay(1000, 2000);
      return true; // Simuler qu'il y a toujours une page suivante pour les tests
    } catch (error) {
      this.logger.debug('📄 Pas de page suivante disponible');
      return false;
    }
  }

  /**
   * Traite tous les joueurs visibles sur la page actuelle
   */
  private async processPlayersOnCurrentPage(): Promise<number> {
    let playersProcessed = 0;

    try {
      // 1. Extraire tous les noms des joueurs de la page en une seule fois
      this.logger.info(
        '📋 Extraction de la liste complète des joueurs de la page...'
      );
      const playerNames =
        await this.extractAllPlayerNamesFromCurrentPage();

      if (playerNames.length === 0) {
        this.logger.info('ℹ️ Aucun joueur trouvé sur cette page');
        return 0;
      }

      this.logger.info(
        `👥 ${playerNames.length} joueur(s) détecté(s) sur la page`
      );

      // 2. Traiter chaque joueur individuellement
      for (
        let playerIndex = 0;
        playerIndex < playerNames.length;
        playerIndex++
      ) {
        try {
          const playerName = playerNames[playerIndex];

          this.logger.info(
            `👤 Traitement du joueur ${playerIndex + 1}/${playerNames.length}: ${playerName}`
          );

          // Vérifier la liste d'exclusion (liste noire)
          if (this.isPlayerExcluded(playerName)) {
            this.logger.info(`🚫 Joueur exclu: ${playerName}`);
            continue; // Passer au joueur suivant
          }

          this.logger.info(`✅ Traitement du joueur: ${playerName}`);

          // Déléguer le traitement au handler (ex: traitement des monuments)
          await this.processPlayerHandler(playerIndex + 1, playerName);
          playersProcessed++;

          // Délai entre joueurs pour paraître humain
          await this.automationService.randomDelay(2000, 4000);

          // Retourner à la liste des joueurs pour le suivant
          await this.returnToPlayersList();
        } catch (error) {
          this.logger.error(
            `❌ Erreur joueur ${playerIndex + 1} (${playerNames[playerIndex]}):`,
            error
          );
          // Continuer avec le joueur suivant
          await this.returnToPlayersList();
        }
      }
    } catch (error) {
      this.logger.error(
        "❌ Erreur lors de l'extraction des joueurs de la page:",
        error
      );
      return 0;
    }

    return playersProcessed;
  }

  /**
   * Traite les joueurs en gérant la pagination (5 par 5)
   */
  private async processPlayersWithPagination(
    playerList: string[]
  ): Promise<void> {
    const playersPerPage = this.config.ui.pagination.playersPerPage;
    const maxPages = this.config.ui.pagination.maxPages;

    // Diviser la liste en pages de 5 joueurs
    const pages: string[][] = [];
    for (let i = 0; i < playerList.length; i += playersPerPage) {
      pages.push(playerList.slice(i, i + playersPerPage));
    }

    // Limiter le nombre de pages pour la sécurité
    if (pages.length > maxPages) {
      this.logger.warn(
        `⚠️ Limitation: ${maxPages} pages max (${maxPages * playersPerPage} joueurs)`
      );
      pages.splice(maxPages);
    }

    this.logger.info(`📄 ${pages.length} page(s) de joueurs à traiter`);

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const currentPage = pages[pageIndex];
      this.logger.info(
        `📄 Traitement de la page ${pageIndex + 1}/${pages.length} (${currentPage.length} joueurs)`
      );

      // Traiter tous les joueurs de la page actuelle
      for (const playerName of currentPage) {
        this.logger.info(`👤 Traitement du joueur: ${playerName}`);
        await this.processPlayer(playerName);

        // Délai entre joueurs pour paraître humain
        await this.automationService.randomDelay(2000, 4000);
      }

      // Passer à la page suivante si ce n'est pas la dernière
      if (pageIndex < pages.length - 1) {
        await this.navigateToNextPlayersPage();
      }
    }
  }

  /**
   * Traite un joueur spécifique : navigation, délégation du traitement, retour
   */
  private async processPlayer(playerName: string): Promise<void> {
    try {
      // 1. Naviguer vers le joueur dans la liste
      await this.navigateToPlayer(playerName);

      // 2. Déléguer le traitement au handler (ex: traitement des monuments)
      await this.processPlayerHandler(0, playerName);

      // 3. Retourner à la liste des joueurs
      await this.returnToPlayersList();
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors du traitement de ${playerName}:`,
        error
      );
      // Tentative de retour à l'état initial
      await this.returnToPlayersList();
    }
  }

  /**
   * Clique sur un joueur à une position spécifique dans la liste
   */
  private async clickOnPlayerAtPosition(
    playerIndex: number
  ): Promise<boolean> {
    try {
      // Calculer la position Y du joueur basée sur l'index
      const playersList = this.config.ui.playersList;
      const playerHeight = 40; // Hauteur approximative d'une ligne de joueur
      const startY = playersList.y + 20; // Marge du haut

      const playerX = playersList.x + playersList.width / 2; // Centre horizontalement
      const playerY = startY + playerIndex * playerHeight;

      // Vérifier si la position est dans les limites de la zone des joueurs
      if (playerY > playersList.y + playersList.height) {
        return false; // Position en dehors de la zone
      }

      this.logger.debug(
        `🖱️ Clic sur joueur position ${playerIndex + 1} (${playerX}, ${playerY})`
      );

      await this.automationService.humanClick(playerX, playerY);
      await this.automationService.randomDelay(1000, 2000);

      return true;
    } catch (error) {
      this.logger.error(
        `❌ Erreur clic joueur position ${playerIndex + 1}:`,
        error
      );
      return false;
    }
  }

  /**
   * Vérifie si un joueur est dans la liste d'exclusion (liste noire)
   */
  private isPlayerExcluded(playerName: string): boolean {
    const excludeList = this.config.players.excludeList || [];
    return excludeList.includes(playerName);
  }

  /**
   * Navigue vers la liste des joueurs (première page)
   */
  private async navigateToPlayersList(): Promise<void> {
    this.logger.debug('🔍 Navigation vers la liste des joueurs...');

    // TODO: Implémenter la navigation vers la liste des joueurs
    // Cela dépend de l'interface du jeu
    await this.automationService.randomDelay(10, 1000);

    this.logger.debug('✅ Navigation vers la liste des joueurs terminée');
  }

  /**
   * Extrait tous les noms des joueurs de la page actuelle en une seule capture
   */
  private async extractAllPlayerNamesFromCurrentPage(): Promise<string[]> {
    try {
      this.logger.debug('📸 Capture de la zone complète des joueurs...');

      // Calculer une zone élargie qui couvre tous les joueurs
      const nameRegion = this.config.players.nameExtractionRegion;
      const playersPerPage = this.config.ui.pagination.playersPerPage;

      // Zone élargie couvrant tous les joueurs horizontalement
      const fullPlayersRegion = {
        x: Math.max(0, nameRegion.x), // Marge à gauche
        y: Math.max(0, nameRegion.y), // Marge en haut
        width:
          playersPerPage * nameRegion.width +
          nameRegion.horizontalSpacing * (playersPerPage - 1), // Largeur totale + marges
        height: nameRegion.height, // Hauteur + marges
      };

      this.logger.debug(
        `🖼️ Zone de capture élargie: (${fullPlayersRegion.x}, ${fullPlayersRegion.y}) ${fullPlayersRegion.width}x${fullPlayersRegion.height}`
      );

      // Capturer la zone complète
      const playersScreenshot = await this.screenCapture.captureScreen({
        region: fullPlayersRegion,
      });

      // Sauvegarder pour debug si activé ET pour utiliser le chemin de fichier avec OCR
      let imagePath: string | null = null;
      if (this.config.debug.saveCaptures) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `all_players_names_${timestamp}`;
        await this.screenCapture.saveCapture(playersScreenshot, filename);

        // Construire le chemin complet du fichier sauvegardé pour OCR
        const path = await import('path');
        imagePath = path.join(
          process.cwd(),
          'captures',
          `${filename}.png`
        );

        // Extraire tous les noms via OCR en utilisant le service dédié
        const playerNames =
          await this.ocrService.extractPlayerNamesFromImage(
            imagePath,
            playersPerPage
          );

        this.logger.debug(
          `✅ ${playerNames.length} nom(s) de joueur(s) extraits`
        );
        return playerNames;
      } else {
        // Si pas de debug, sauvegarder temporairement pour OCR (car on doit passer un chemin de fichier)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `temp_players_names_${timestamp}`;
        await this.screenCapture.saveCapture(playersScreenshot, filename);

        const path = await import('path');
        imagePath = path.join(
          process.cwd(),
          'captures',
          `${filename}.png`
        );

        // Extraire les noms via OCR en utilisant le service dédié
        const playerNames =
          await this.ocrService.extractPlayerNamesFromImage(
            imagePath,
            playersPerPage
          );

        // Supprimer le fichier temporaire
        try {
          const fs = await import('fs');
          await fs.promises.unlink(imagePath);
        } catch (error) {
          // Ignorer les erreurs de suppression
        }

        this.logger.debug(
          `✅ ${playerNames.length} nom(s) de joueur(s) extraits`
        );
        return playerNames;
      }
    } catch (error) {
      this.logger.error(
        "❌ Erreur lors de l'extraction des noms de joueurs:",
        error
      );
      return [];
    }
  }

  /**
   * Calcule la position des éléments d'interface pour une carte de joueur spécifique
   */
  private calculatePlayerCardPosition(playerIndex: number): {
    cardX: number;
    cardY: number;
    cardWidth: number;
    cardHeight: number;
    monumentsButtonX: number;
    monumentsButtonY: number;
    monumentsButtonWidth: number;
    monumentsButtonHeight: number;
  } {
    // Utiliser la configuration centralisée pour le layout des cartes
    const layout = this.config.players.cardLayout;

    // Calculer la position de la carte pour ce joueur
    const cardX =
      layout.startX + playerIndex * (layout.cardWidth + layout.spacing);
    const cardY = layout.startY;

    // Calculer la position du bouton "Grands Monuments" dans cette carte
    const monumentsButtonX = cardX + layout.monumentsButtonOffset.x;
    const monumentsButtonY = cardY + layout.monumentsButtonOffset.y;

    this.logger.debug(
      `📊 Carte joueur ${playerIndex + 1}: position (${cardX}, ${cardY}), taille ${layout.cardWidth}x${layout.cardHeight}`
    );

    return {
      cardX,
      cardY,
      cardWidth: layout.cardWidth,
      cardHeight: layout.cardHeight,
      monumentsButtonX,
      monumentsButtonY,
      monumentsButtonWidth: layout.monumentsButtonOffset.width,
      monumentsButtonHeight: layout.monumentsButtonOffset.height,
    };
  }

  /**
   * Navigation vers la page suivante de joueurs
   */
  private async navigateToNextPlayersPage(): Promise<void> {
    this.logger.info(
      '📄 Navigation vers la page suivante de joueurs...'
    );

    try {
      // Cliquer sur le bouton "Suivant"
      await this.automationService.humanClick(
        this.config.ui.buttons.nextPlayers.x,
        this.config.ui.buttons.nextPlayers.y
      );

      // Attendre que la nouvelle page se charge
      await this.automationService.randomDelay(1000, 2000);

      this.logger.debug('✅ Page suivante chargée');
    } catch (error) {
      this.logger.error(
        '❌ Erreur lors de la navigation vers la page suivante:',
        error
      );
      throw error;
    }
  }
}
