import { AutomationService } from './automation-service';
import { ScreenCapture } from './screen-capture';
import { OCRService } from './ocr-service';
import { OpportunityDetector } from './opportunity-detector';
import { OCREnhancementService } from './ocr-enhancement';
import { Logger } from '../utils/logger';
import { loadConfig } from '../config/config';
import { MonumentData, Opportunity } from '../types';
import {
  getHumanLikeClickPosition,
  HumanClickSimulator,
  ButtonCoordinates,
  ClickBehavior,
} from '../utils/button-utils';

/**
 * Représente un monument avec investissement
 */
export interface InvestedMonument {
  name: string;
  hasInvestments: boolean;
  position: { x: number; y: number }; // Position du bouton "Ouvrir"
}

/**
 * Représente un monument détecté via OCR dans le tableau
 */
export interface MonumentTableRow {
  name: string;
  level: number;
  progression: {
    current: number; // PF déjà investis par tous les joueurs
    maximum: number; // PF maximum possible
  };
  myInvestment: number | null; // Mes PF investis (null si aucun)
  myRank: number | null; // Mon rang (null si aucun)
  activityButtonPosition: { x: number; y: number }; // Position du bouton "Activité"
}

/**
 * Représente un monument avec investissements existants mais sans les miens
 */
export interface TargetMonument {
  name: string;
  level: number;
  progression: {
    current: number;
    maximum: number;
  };
  hasOthersInvestments: boolean; // Toujours true pour les monuments ciblés
  hasMyInvestments: boolean; // Toujours false pour les monuments ciblés
  activityButtonPosition: { x: number; y: number };
}

/**
 * Représente un joueur avec ses monuments
 */
export interface Player {
  name: string;
  monuments: InvestedMonument[];
}

/**
 * Service de navigation et d'interaction pour le workflow complet
 */
export class GameNavigationService {
  private automationService: AutomationService;
  private screenCapture: ScreenCapture;
  private ocrService: OCRService;
  private opportunityDetector: OpportunityDetector;
  private ocrEnhancement: OCREnhancementService;
  private logger: Logger;
  private config: any;
  private clickSimulator: HumanClickSimulator;

  constructor() {
    this.automationService = new AutomationService();
    this.screenCapture = new ScreenCapture();
    this.ocrService = new OCRService();
    this.opportunityDetector = new OpportunityDetector();
    this.ocrEnhancement = new OCREnhancementService();
    this.logger = new Logger();
    this.config = loadConfig();
    this.clickSimulator = new HumanClickSimulator();
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
        this.logger.info('📄 Aucun joueur trouvé sur cette page - fin du scan');
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
      this.logger.error("❌ Erreur lors de l'extraction des joueurs:", error);
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
      const playersPerPage = this.config.ui.pagination.playersPerPage;

      // Naviguer vers la première page des joueurs
      await this.navigateToPlayersList();

      while (currentPage <= maxPages) {
        this.logger.info(`📄 Traitement de la page ${currentPage}...`);

        // Traiter tous les joueurs de la page actuelle
        const playersProcessedOnPage = await this.processPlayersOnCurrentPage();

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
          this.logger.info('� Plus de pages disponibles');
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
   * Traite tous les joueurs visibles sur la page actuelle
   */
  private async processPlayersOnCurrentPage(): Promise<number> {
    const playersPerPage = this.config.ui.pagination.playersPerPage;
    let playersProcessed = 0;

    for (let playerIndex = 0; playerIndex < playersPerPage; playerIndex++) {
      try {
        this.logger.info(
          `👤 Traitement du joueur à la position ${playerIndex + 1}...`
        );

        // Vérifier si le joueur existe à cette position
        // @TODO: Implémenter la logique de vérification du joueur
        // const playerExists = await this.clickOnPlayerAtPosition(playerIndex);
        // if (!playerExists) {
        //   this.logger.info(
        //     `   ℹ️ Pas de joueur à la position ${playerIndex + 1}`
        //   );
        //   break; // Fin de la page
        // }

        // Traiter ce joueur (sans connaître son nom)
        await this.processCurrentPlayer(playerIndex + 1);
        playersProcessed++;

        // Délai entre joueurs pour paraître humain
        await this.automationService.randomDelay(2000, 4000);

        // Retourner à la liste des joueurs pour le suivant
        await this.returnToPlayersList();
      } catch (error) {
        this.logger.error(
          `❌ Erreur joueur position ${playerIndex + 1}:`,
          error
        );
        // Continuer avec le joueur suivant
        await this.returnToPlayersList();
      }
    }

    return playersProcessed;
  }

  /**
   * Clique sur un joueur à une position spécifique dans la liste
   */
  private async clickOnPlayerAtPosition(playerIndex: number): Promise<boolean> {
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
   * Traite le joueur actuellement sélectionné (workflow complet)
   */
  private async processCurrentPlayer(playerPosition: number): Promise<void> {
    try {
      this.logger.info(
        `🏛️ Ouverture des monuments pour joueur position ${playerPosition}...`
      );

      // 1. Ouvrir la liste des grands monuments (avec position dynamique)
      await this.openMonumentsList(playerPosition - 1); // playerPosition est 1-based, index est 0-based

      // 2. Identifier les monuments avec investissements existants mais sans les miens
      const monuments = await this.identifyInvestedMonuments();

      if (monuments.length === 0) {
        this.logger.info(
          `   ℹ️ Aucun monument ciblé (position ${playerPosition})`
        );
        return;
      }

      this.logger.info(
        `   🏛️ ${monuments.length} monument(s) ciblé(s) détecté(s) (avec investissements mais sans les miens)`
      );

      // 3. Traiter chaque monument
      for (const monument of monuments) {
        await this.processMonument(monument);
      }
    } catch (error) {
      this.logger.error(
        `❌ Erreur traitement joueur position ${playerPosition}:`,
        error
      );
    }
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
   * Navigation vers la page suivante de joueurs
   */
  private async navigateToNextPlayersPage(): Promise<void> {
    this.logger.info('📄 Navigation vers la page suivante de joueurs...');

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

  /**
   * Traite un joueur spécifique
   */
  async processPlayer(playerName: string): Promise<void> {
    try {
      // 1. Naviguer vers le joueur dans la liste
      await this.navigateToPlayer(playerName);

      // 2. Ouvrir la liste des grands monuments
      await this.openMonumentsList();

      // 3. Identifier les monuments avec investissements
      const monuments = await this.identifyInvestedMonuments();

      if (monuments.length === 0) {
        this.logger.info(
          `   ℹ️ Aucun monument ciblé trouvé pour ${playerName}`
        );
        await this.returnToPlayersList();
        return;
      }

      this.logger.info(
        `   🏛️ ${monuments.length} monument(s) ciblé(s) détecté(s) (avec investissements mais sans les miens)`
      );

      // 4. Traiter chaque monument
      for (const monument of monuments) {
        await this.processMonument(monument);
      }

      // 5. Retourner à la liste des joueurs
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
   * Ouvrir la liste des grands monuments du joueur actuellement sélectionné
   */
  async openMonumentsList(playerIndex?: number): Promise<void> {
    this.logger.info('🏛️ Ouverture de la liste des grands monuments...');

    let clickCoordinates: { x: number; y: number };
    const suggestedBehavior = this.clickSimulator.suggestBehavior();

    if (playerIndex !== undefined) {
      // Mode séquentiel - calculer la position basée sur l'index du joueur
      const cardLayout = this.calculatePlayerCardPosition(playerIndex);

      const monumentsButton: ButtonCoordinates = {
        x: cardLayout.monumentsButtonX,
        y: cardLayout.monumentsButtonY,
        width: cardLayout.monumentsButtonWidth,
        height: cardLayout.monumentsButtonHeight,
      };

      // Utiliser le simulateur de clic humain intelligent
      clickCoordinates = this.clickSimulator.generateClickPosition(
        monumentsButton,
        suggestedBehavior
      );

      this.logger.debug(
        `🎯 Bouton joueur ${playerIndex + 1}: taille ${monumentsButton.width}x${monumentsButton.height}, clic naturel (${suggestedBehavior}): (${clickCoordinates.x}, ${clickCoordinates.y})`
      );
    } else {
      // Mode classique - utiliser les coordonnées de la configuration
      const monumentsButton: ButtonCoordinates =
        this.config.ui.buttons.openMonuments;
      clickCoordinates = this.clickSimulator.generateClickPosition(
        monumentsButton,
        suggestedBehavior
      );

      this.logger.debug(
        `🎯 Bouton depuis config: taille ${monumentsButton.width}x${monumentsButton.height}, clic naturel (${suggestedBehavior}): (${clickCoordinates.x}, ${clickCoordinates.y})`
      );
    }

    await this.automationService.humanClick(
      clickCoordinates.x,
      clickCoordinates.y
    );
    await this.automationService.randomDelay(1500, 2500);

    this.logger.debug('✅ Liste des monuments ouverte');
  }

  /**
   * Effectue un clic naturel sur un bouton de l'interface
   */
  private async clickButtonNaturally(
    button: ButtonCoordinates,
    buttonName: string = 'bouton'
  ): Promise<void> {
    const suggestedBehavior = this.clickSimulator.suggestBehavior();
    const clickCoordinates = this.clickSimulator.generateClickPosition(
      button,
      suggestedBehavior
    );

    this.logger.debug(
      `🎯 Clic naturel sur ${buttonName}: taille ${button.width}x${button.height}, comportement ${suggestedBehavior}, position (${clickCoordinates.x}, ${clickCoordinates.y})`
    );

    await this.automationService.humanClick(
      clickCoordinates.x,
      clickCoordinates.y
    );
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
   * Identifier les monuments avec des investissements existants mais sans les miens
   */
  async identifyInvestedMonuments(): Promise<InvestedMonument[]> {
    this.logger.info('🔍 Identification des monuments avec investissements...');

    try {
      // Capturer la zone de la liste des monuments
      const screenshot = await this.screenCapture.captureScreen({
        region: {
          x: 550,
          y: 450,
          width: 475,
          height: 315,
        },
      });

      // Sauvegarder pour debug si activé ET pour utiliser le fichier avec OCR
      let imagePath: string | null = null;
      if (this.config.debug.saveCaptures) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `monuments_list_${timestamp}`;
        await this.screenCapture.saveCapture(screenshot, filename);

        // Construire le chemin complet du fichier sauvegardé
        const path = await import('path');
        imagePath = path.join(process.cwd(), 'captures', `${filename}.png`);
        this.logger.debug(`📁 Fichier image sauvegardé: ${imagePath}`);
      }

      // Extraire les données du tableau via OCR (utiliser le fichier plutôt que l'objet)
      const tableData = await this.extractMonumentTableData(
        imagePath || screenshot
      );

      // Filtrer selon nos critères : investissements existants MAIS pas les miens
      const targetMonuments = this.filterTargetMonuments(tableData);

      // Convertir en format InvestedMonument pour compatibilité
      const monuments: InvestedMonument[] = targetMonuments.map(
        (monument: TargetMonument) => ({
          name: monument.name,
          hasInvestments: monument.hasOthersInvestments,
          position: monument.activityButtonPosition,
        })
      );

      this.logger.success(
        `✅ ${monuments.length} monument(s) ciblé(s) identifié(s) (avec investissements mais sans les miens)`
      );

      // Log détaillé des monuments filtrés
      if (monuments.length > 0) {
        this.logger.info('🎯 Monuments ciblés:');
        targetMonuments.forEach((monument: TargetMonument) => {
          this.logger.info(
            `   • ${monument.name} (Niv.${monument.level}) - ${monument.progression.current}/${monument.progression.maximum} PF`
          );
        });
      }

      return monuments;
    } catch (error) {
      this.logger.error(
        "❌ Erreur lors de l'identification des monuments:",
        error
      );
      return [];
    }
  }

  /**
   * Traiter un monument spécifique
   */
  async processMonument(monument: InvestedMonument): Promise<void> {
    this.logger.info(`🏛️ Traitement du monument: ${monument.name}`);

    try {
      // 1. Cliquer sur le bouton "Ouvrir" du monument
      await this.automationService.humanClick(
        monument.position.x,
        monument.position.y
      );
      await this.automationService.randomDelay(1500, 2500);

      // 2. Capturer et analyser les places disponibles
      const monumentData = await this.analyzeMonumentOpportunities();

      // 3. Identifier les opportunités
      const opportunities =
        this.opportunityDetector.findOpportunities(monumentData);

      if (opportunities.length > 0) {
        this.logger.info(
          `💰 ${opportunities.length} opportunité(s) trouvée(s) dans ${monument.name}`
        );

        // 4. Investir dans les meilleures opportunités
        await this.investInOpportunities(opportunities);
      } else {
        this.logger.info(
          `   ℹ️ Aucune opportunité intéressante dans ${monument.name}`
        );
      }

      // 5. Fermer le monument et retourner à la liste
      await this.closeMonument();
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors du traitement du monument ${monument.name}:`,
        error
      );
      await this.closeMonument(); // Tentative de fermeture
    }
  }

  /**
   * Analyser les opportunités dans un monument ouvert
   */
  async analyzeMonumentOpportunities(): Promise<MonumentData> {
    this.logger.info('🔍 Analyse des opportunités du monument...');

    // Capturer la zone des places du monument
    const screenshot = await this.screenCapture.captureMonument();

    // Sauvegarder pour debug si activé
    if (this.config.debug.saveCaptures) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `monument_${timestamp}`;
      await this.screenCapture.saveCapture(screenshot, filename);
    }

    // Analyser avec OCR
    const monumentData = await this.ocrService.analyzeMonument(screenshot);

    this.logger.info(`📊 ${monumentData.places.length} place(s) analysée(s)`);
    return monumentData;
  }

  /**
   * Investir dans les opportunités sélectionnées
   */
  async investInOpportunities(opportunities: Opportunity[]): Promise<void> {
    this.logger.info(
      `💰 Investissement dans ${opportunities.length} opportunité(s)...`
    );

    // Trier par rentabilité décroissante et prendre les meilleures
    const bestOpportunities = opportunities.slice(0, 3); // Max 3 par monument

    for (const opportunity of bestOpportunities) {
      await this.investInPlace(opportunity);
    }
  }

  /**
   * Investir dans une place spécifique
   */
  async investInPlace(opportunity: Opportunity): Promise<void> {
    this.logger.info(
      `💰 Investissement place ${opportunity.position}: ${opportunity.cost}PF`
    );

    try {
      // 1. Cliquer sur l'input de la place (coordonnées à calibrer)
      const inputX = 500; // À calibrer selon la position de la place
      const inputY = 200 + opportunity.position * 50; // Approximation

      await this.automationService.humanClick(inputX, inputY);
      await this.automationService.randomDelay(500, 1000);

      // 2. Saisir le montant
      await this.automationService.humanType(opportunity.cost.toString());
      await this.automationService.randomDelay(500, 1000);

      // 3. Valider (Entrée ou bouton de validation)
      await this.automationService.humanClick(inputX + 100, inputY); // Bouton valider
      await this.automationService.randomDelay(1000, 2000);

      this.logger.success(
        `✅ Investissement réalisé: ${opportunity.cost}PF dans place ${opportunity.position}`
      );
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de l'investissement place ${opportunity.position}:`,
        error
      );
    }
  }

  /**
   * Fermer le monument actuel
   */
  async closeMonument(): Promise<void> {
    this.logger.debug('🔙 Fermeture du monument...');

    // TODO: Coordonnées du bouton de fermeture à calibrer
    const closeButtonX = 750; // À calibrer
    const closeButtonY = 100; // À calibrer

    await this.automationService.humanClick(closeButtonX, closeButtonY);
    await this.automationService.randomDelay(1000, 1500);
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
   * Extrait les données du tableau des monuments via OCR
   */
  private async extractMonumentTableData(
    screenshot: any
  ): Promise<MonumentTableRow[]> {
    this.logger.debug('📊 Extraction des données du tableau des monuments...');

    try {
      // Si pas de screenshot (mode test), utiliser directement les données simulées
      if (!screenshot) {
        this.logger.debug(
          '⚠️ Pas de screenshot fourni - utilisation des données simulées'
        );
        return this.getSimulatedMonumentData();
      }

      // Convertir l'image pour Tesseract si nécessaire
      const imageData = await this.prepareImageForOCR(screenshot);

      // Configuration OCR optimisée pour les tableaux
      const ocrConfig = {
        lang: 'eng+fra', // Support français et anglais
        options: {
          tessedit_char_whitelist:
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789/() -',
          tessedit_pageseg_mode: 6, // Assume uniform block of text
          preserve_interword_spaces: 1,
        },
      };

      this.logger.debug('🧠 Lancement de la reconnaissance OCR...');

      // Utiliser Tesseract.js pour extraire le texte
      const { createWorker, PSM } = await import('tesseract.js');
      const worker = await createWorker(ocrConfig.lang);

      await worker.setParameters({
        tessedit_char_whitelist: ocrConfig.options.tessedit_char_whitelist,
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
      });

      const { data } = await worker.recognize(imageData);
      await worker.terminate();

      this.logger.debug(`📝 Texte OCR extrait: ${data.text.length} caractères`);

      // Parser le texte en lignes de tableau
      const tableRows = await this.parseOCRTextToTableRows(data);

      // Appliquer l'amélioration OCR sur chaque ligne
      const enhancedTableRows = tableRows.map((row) => {
        const enhancedData = this.ocrEnhancement.enhanceSingleMonument({
          name: row.name,
          level: row.level,
          progression: `${row.progression.current}/${row.progression.maximum}`,
        });

        return {
          ...row,
          name: enhancedData.name,
          level: enhancedData.level,
        };
      });

      this.logger.debug(
        `📊 ${enhancedTableRows.length} ligne(s) de monuments extraite(s) et améliorée(s)`
      );

      return enhancedTableRows;
    } catch (error) {
      this.logger.error(
        "❌ Erreur lors de l'extraction OCR des données du tableau:",
        error
      );

      // Fallback vers les données simulées en cas d'erreur OCR
      this.logger.warn('⚠️ Utilisation des données simulées en fallback');
      return this.getSimulatedMonumentData();
    }
  }

  /**
   * Filtre les monuments selon nos critères :
   * - Ont des investissements existants (progression.current > 0)
   * - N'ont pas mes investissements (myInvestment === null)
   */
  private filterTargetMonuments(
    tableData: MonumentTableRow[]
  ): TargetMonument[] {
    this.logger.debug('🎯 Filtrage des monuments cibles...');

    const targetMonuments = tableData
      .filter((row) => {
        const hasOthersInvestments = row.progression.current > 0;
        const hasMyInvestments = row.myInvestment !== null;

        // Critères : investissements existants MAIS pas les miens
        return hasOthersInvestments && !hasMyInvestments;
      })
      .map((row) => ({
        name: row.name,
        level: row.level,
        progression: row.progression,
        hasOthersInvestments: true,
        hasMyInvestments: false,
        activityButtonPosition: row.activityButtonPosition,
      }));

    this.logger.debug(
      `🎯 ${targetMonuments.length} monument(s) correspondent aux critères`
    );

    // Log détaillé du filtrage
    tableData.forEach((row) => {
      const hasOthers = row.progression.current > 0;
      const hasMine = row.myInvestment !== null;
      const isTarget = hasOthers && !hasMine;

      this.logger.debug(
        `   ${isTarget ? '✅' : '❌'} ${row.name}: autres=${hasOthers ? 'OUI' : 'NON'}, moi=${hasMine ? 'OUI' : 'NON'}`
      );
    });

    return targetMonuments;
  }

  /**
   * Parse une ligne du tableau des monuments via OCR
   * Format attendu : | Nom | Niveau | Progression | Points de forge | Rang | Activité |
   */
  private parseMonumentTableRow(
    ocrText: string,
    rowIndex: number
  ): MonumentTableRow | null {
    try {
      this.logger.debug(`🔍 Parsing ligne ${rowIndex}: "${ocrText}"`);

      // Nettoyer le texte OCR
      const cleanedText = ocrText.replace(/[|]/g, ' ').trim();

      // Patterns regex pour extraire les différentes colonnes

      // 1. Progression au format "X/Y" ou "X / Y" (avec espaces optionnels)
      const progressionPattern = /(\d+)\s*\/\s*(\d+)/;
      const progressionMatch = cleanedText.match(progressionPattern);

      if (!progressionMatch) {
        this.logger.debug(
          `⚠️ Ligne ${rowIndex} non parsée: pas de progression trouvée`
        );
        return null;
      }

      const progressionCurrent = parseInt(progressionMatch[1]);
      const progressionMaximum = parseInt(progressionMatch[2]);

      // 2. Extraire le nom du monument (tout ce qui précède le premier nombre)
      const beforeFirstNumberPattern = /^([A-Za-zÀ-ÿ\s\-']+?)(?=\s+\d)/;
      const nameMatch = cleanedText.match(beforeFirstNumberPattern);

      if (!nameMatch) {
        this.logger.debug(`⚠️ Ligne ${rowIndex} non parsée: nom non trouvé`);
        return null;
      }

      const monumentName = nameMatch[1].trim();

      // 3. Extraire le niveau (premier nombre après le nom)
      const afterNamePattern = new RegExp(
        `${monumentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(\\d{1,2})`
      );
      const levelMatch = cleanedText.match(afterNamePattern);
      const level = levelMatch ? parseInt(levelMatch[1]) : 1;

      // 4. Investissement personnel avec rang - pattern plus robuste
      // Chercher: nombre + "PF" + quelque chose + "rang" + nombre
      const investmentPattern = /(\d+)\s*PF.*?rang\s*(\d+)/i;
      const investmentMatch = cleanedText.match(investmentPattern);

      let myInvestment: number | null = null;
      let myRank: number | null = null;

      if (investmentMatch) {
        // Vérifier que ce n'est pas le nombre de la progression
        const potentialInvestment = parseInt(investmentMatch[1]);
        if (
          potentialInvestment !== progressionCurrent &&
          potentialInvestment !== progressionMaximum
        ) {
          myInvestment = potentialInvestment;
          myRank = parseInt(investmentMatch[2]);
        }
      }

      // Calculer la position du bouton "Activité" basée sur la position de la ligne
      const baseY = 500; // Y de base (à calibrer selon l'interface)
      const rowSpacing = 40; // Espacement entre les lignes
      const activityButtonPosition = {
        x: 1150, // Position X fixe du bouton (à calibrer)
        y: baseY + rowIndex * rowSpacing,
      };

      const result: MonumentTableRow = {
        name: monumentName,
        level,
        progression: {
          current: progressionCurrent,
          maximum: progressionMaximum,
        },
        myInvestment,
        myRank,
        activityButtonPosition,
      };

      this.logger.debug(
        `✅ Ligne ${rowIndex} parsée: ${monumentName} (Niv.${level}) - ${progressionCurrent}/${progressionMaximum} PF`
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Erreur parsing ligne ${rowIndex}:`, error);
      return null;
    }
  }

  /**
   * Méthode de test pour valider la logique de filtrage
   */
  async testMonumentFiltering(): Promise<void> {
    this.logger.info('🧪 Test de la logique de filtrage des monuments...');

    try {
      // Simuler une capture d'écran
      const mockScreenshot = null; // Placeholder

      // Extraire les données (utilisera les données simulées)
      const tableData = await this.extractMonumentTableData(mockScreenshot);

      this.logger.info(
        `📊 ${tableData.length} monument(s) extraits du tableau:`
      );
      tableData.forEach((row: MonumentTableRow) => {
        const statusMoi = row.myInvestment
          ? `${row.myInvestment}PF (rang ${row.myRank})`
          : 'Aucun';
        this.logger.info(
          `   • ${row.name} (Niv.${row.level}): ${row.progression.current}/${row.progression.maximum} PF - Moi: ${statusMoi}`
        );
      });

      // Appliquer le filtrage
      const targetMonuments = this.filterTargetMonuments(tableData);

      this.logger.success(
        `🎯 ${targetMonuments.length} monument(s) correspondent aux critères de ciblage`
      );

      if (targetMonuments.length > 0) {
        this.logger.info('✅ Monuments sélectionnés pour investissement:');
        targetMonuments.forEach((monument: TargetMonument) => {
          this.logger.info(
            `   → ${monument.name}: ${monument.progression.current}/${monument.progression.maximum} PF déjà investis par d'autres`
          );
        });
      } else {
        this.logger.info(
          'ℹ️ Aucun monument ne correspond aux critères actuellement'
        );
      }
    } catch (error) {
      this.logger.error('❌ Erreur lors du test de filtrage:', error);
    }
  }

  /**
   * Prépare l'image pour l'OCR en appliquant des prétraitements
   */
  private async prepareImageForOCR(screenshot: any): Promise<any> {
    this.logger.debug("🖼️ Préparation de l'image pour OCR...");

    try {
      // Si c'est un string (chemin de fichier) - priorité car plus fiable
      if (typeof screenshot === 'string') {
        this.logger.debug('✅ Utilisation du chemin de fichier pour OCR');
        return screenshot;
      }

      // Si c'est déjà un Buffer ou autre format compatible
      if (Buffer.isBuffer(screenshot)) {
        this.logger.debug('✅ Image déjà en format Buffer');
        return screenshot;
      }

      // Si l'image vient de @nut-tree-fork/nut-js (objet Image)
      if (
        screenshot &&
        screenshot.data &&
        screenshot.width &&
        screenshot.height
      ) {
        this.logger.debug(
          '📸 Image @nut-tree-fork/nut-js détectée, utilisation directe pour Tesseract'
        );

        // Tesseract.js peut parfois accepter directement les données d'image raw
        // Essayons d'abord de retourner l'objet tel quel
        this.logger.debug("✅ Utilisation directe de l'objet Image pour OCR");
        return screenshot;
      }

      // Fallback - essayer de retourner tel quel
      this.logger.debug("⚠️ Format d'image non reconnu, tentative directe");
      return screenshot;
    } catch (error) {
      this.logger.error("❌ Erreur lors de la préparation d'image:", error);
      throw error;
    }
  }

  /**
   * Convertit une image @nut-tree-fork/nut-js vers Jimp
   * (Copie de la méthode dans ScreenCapture pour éviter les dépendances circulaires)
   */
  private async createJimpFromNutImage(nutImage: any): Promise<any> {
    const { width, height, data, channels } = nutImage;

    // Créer un buffer RGBA standard (4 channels)
    const rgbaBuffer = Buffer.alloc(width * height * 4);

    for (let i = 0; i < width * height; i++) {
      const srcIndex = i * channels;
      const dstIndex = i * 4;

      if (channels >= 3) {
        rgbaBuffer[dstIndex] = data[srcIndex]; // R
        rgbaBuffer[dstIndex + 1] = data[srcIndex + 1]; // G
        rgbaBuffer[dstIndex + 2] = data[srcIndex + 2]; // B
        rgbaBuffer[dstIndex + 3] = channels === 4 ? data[srcIndex + 3] : 255; // A
      } else if (channels === 1) {
        // Grayscale vers RGBA
        const gray = data[srcIndex];
        rgbaBuffer[dstIndex] = gray; // R
        rgbaBuffer[dstIndex + 1] = gray; // G
        rgbaBuffer[dstIndex + 2] = gray; // B
        rgbaBuffer[dstIndex + 3] = 255; // A
      }
    }

    // Utiliser la méthode create de Jimp avec un objet de configuration
    const jimp = await import('jimp');
    return new jimp.Jimp({
      data: rgbaBuffer,
      width,
      height,
    });
  }

  /**
   * Parse le texte OCR brut en lignes de tableau structurées
   */
  private async parseOCRTextToTableRows(
    ocrData: any
  ): Promise<MonumentTableRow[]> {
    this.logger.debug('📝 Parsing du texte OCR en lignes de tableau...');

    try {
      const rows: MonumentTableRow[] = [];
      const lines = ocrData.text
        .split('\n')
        .filter((line: string) => line.trim().length > 0);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Ignorer les lignes d'en-tête ou vides
        if (this.isTableHeaderLine(line)) {
          continue;
        }

        const parsedRow = this.parseMonumentTableRow(line, i);
        if (parsedRow) {
          rows.push(parsedRow);
        }
      }

      this.logger.debug(`📊 ${rows.length} ligne(s) de monuments parsée(s)`);
      return rows;
    } catch (error) {
      this.logger.error('❌ Erreur lors du parsing OCR:', error);
      throw error;
    }
  }

  /**
   * Vérifie si une ligne est un en-tête de tableau
   */
  private isTableHeaderLine(line: string): boolean {
    const headerKeywords = [
      'nom',
      'niveau',
      'progression',
      'points',
      'rang',
      'activité',
      'name',
      'level',
    ];
    const lowerLine = line.toLowerCase();

    return headerKeywords.some((keyword) => lowerLine.includes(keyword));
  }

  /**
   * Données simulées pour fallback
   */
  private getSimulatedMonumentData(): MonumentTableRow[] {
    return [
      {
        name: 'Arc de Triomphe',
        level: 12,
        progression: { current: 450, maximum: 1000 },
        myInvestment: null,
        myRank: null,
        activityButtonPosition: { x: 1150, y: 500 },
      },
      {
        name: 'Tour Eiffel',
        level: 15,
        progression: { current: 200, maximum: 800 },
        myInvestment: 50,
        myRank: 3,
        activityButtonPosition: { x: 1150, y: 540 },
      },
      {
        name: 'Statue de la Liberté',
        level: 8,
        progression: { current: 0, maximum: 600 },
        myInvestment: null,
        myRank: null,
        activityButtonPosition: { x: 1150, y: 580 },
      },
      {
        name: 'Colisée',
        level: 18,
        progression: { current: 750, maximum: 1200 },
        myInvestment: null,
        myRank: null,
        activityButtonPosition: { x: 1150, y: 620 },
      },
    ];
  }
}
