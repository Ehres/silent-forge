import { AutomationService } from './automation-service';
import { ScreenCapture } from './screen-capture';
import { OCRService } from './ocr-service';
import { OpportunityDetector } from './opportunity-detector';
import { Logger } from '../utils/logger';
import { loadConfig } from '../config/config';
import { MonumentData, Opportunity } from '../types';

/**
 * Représente un monument avec investissement
 */
export interface InvestedMonument {
  name: string;
  hasInvestments: boolean;
  position: { x: number; y: number }; // Position du bouton "Ouvrir"
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
  private logger: Logger;
  private config: any;

  constructor() {
    this.automationService = new AutomationService();
    this.screenCapture = new ScreenCapture();
    this.ocrService = new OCRService();
    this.opportunityDetector = new OpportunityDetector();
    this.logger = new Logger();
    this.config = loadConfig();
  }

  /**
   * Workflow principal : traite tous les joueurs et leurs monuments avec pagination
   */
  async processAllPlayers(playerList: string[]): Promise<void> {
    this.logger.info('🚀 Démarrage du traitement de tous les joueurs...');

    this.automationService.start();

    try {
      await this.processPlayersWithPagination(playerList);
    } finally {
      this.automationService.stop();
      this.logger.success('✅ Traitement de tous les joueurs terminé!');
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
          `   ℹ️ Aucun monument avec investissement trouvé pour ${playerName}`
        );
        await this.returnToPlayersList();
        return;
      }

      this.logger.info(
        `   🏛️ ${monuments.length} monument(s) avec investissements détecté(s)`
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
   * Ouvrir la liste des grands monuments du joueur
   */
  async openMonumentsList(): Promise<void> {
    this.logger.info('🏛️ Ouverture de la liste des grands monuments...');

    // TODO: Coordonnées du bouton "Grands Monuments" à définir
    const monumentsButtonX = 400; // À calibrer
    const monumentsButtonY = 300; // À calibrer

    await this.automationService.humanClick(monumentsButtonX, monumentsButtonY);
    await this.automationService.randomDelay(1500, 2500);

    this.logger.debug('✅ Liste des monuments ouverte');
  }

  /**
   * Identifier les monuments avec des investissements existants
   */
  async identifyInvestedMonuments(): Promise<InvestedMonument[]> {
    this.logger.info('🔍 Identification des monuments avec investissements...');

    try {
      // Capturer la zone de la liste des monuments
      const screenshot = await this.screenCapture.captureScreen({
        region: {
          x: 100, // À calibrer selon l'interface
          y: 200,
          width: 800,
          height: 500,
        },
      });

      // Sauvegarder pour debug si activé
      if (this.config.debug.saveCaptures) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `monuments_list_${timestamp}`;
        await this.screenCapture.saveCapture(screenshot, filename);
      }

      // TODO: Utiliser OCR pour détecter les monuments avec investissements
      // Chercher des patterns comme "PF investis", "Points actifs", etc.

      // Données simulées pour le développement
      const monuments: InvestedMonument[] = [
        {
          name: 'Arc de Triomphe',
          hasInvestments: true,
          position: { x: 600, y: 250 },
        },
        {
          name: 'Tour Eiffel',
          hasInvestments: true,
          position: { x: 600, y: 350 },
        },
      ];

      this.logger.success(
        `✅ ${monuments.length} monument(s) avec investissements identifié(s)`
      );
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
}
