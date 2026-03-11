import { AutomationService } from './automation-service';
import { ScreenCapture } from './screen-capture';
import { OCRService } from './ocr-service';
import { OpportunityDetector } from './opportunity-detector';
import { OCREnhancementService } from './ocr-enhancement';
import { RewardExtractionService } from './reward-extraction-service';
import { Logger } from '../utils/logger';
import { Config, loadConfig } from '../config/config';
import {
  MonumentData,
  Opportunity,
  RewardItem,
  InvestedMonument,
  MonumentTableRow,
  TargetMonument,
  Player,
} from '../types';
import {
  HumanClickSimulator,
  ButtonCoordinates,
} from '../utils/button-utils';

// Re-export for backward compatibility
export { InvestedMonument, MonumentTableRow, TargetMonument, Player };

/**
 * Service de traitement des monuments (ouverture, identification, analyse, investissement)
 */
export class MonumentProcessingService {
  private automationService: AutomationService;
  private screenCapture: ScreenCapture;
  private ocrService: OCRService;
  private opportunityDetector: OpportunityDetector;
  private ocrEnhancement: OCREnhancementService;
  private rewardExtractor: RewardExtractionService;
  private logger: Logger;
  private config: Config;
  private clickSimulator: HumanClickSimulator;

  constructor(rewardExtractor: RewardExtractionService) {
    this.automationService = new AutomationService();
    this.screenCapture = new ScreenCapture();
    this.ocrService = new OCRService();
    this.opportunityDetector = new OpportunityDetector();
    this.ocrEnhancement = new OCREnhancementService();
    this.rewardExtractor = rewardExtractor;
    this.logger = new Logger();
    this.config = loadConfig();
    this.clickSimulator = new HumanClickSimulator();
  }

  /**
   * Traite le joueur actuellement sélectionné (workflow complet)
   */
  async processCurrentPlayer(
    playerPosition: number,
    playerName?: string
  ): Promise<void> {
    try {
      const displayName = playerName || `position ${playerPosition}`;
      this.logger.info(`🏛️ Ouverture des monuments pour ${displayName}...`);

      // 1. Ouvrir la liste des grands monuments (avec position dynamique)
      await this.openMonumentsList(playerPosition - 1); // playerPosition est 1-based, index est 0-based

      // 2. Identifier les monuments avec investissements existants mais sans les miens
      const monuments = await this.identifyInvestedMonuments();

      if (monuments.length === 0) {
        this.logger.info(`   ℹ️ Aucun monument ciblé (${displayName})`);
        return;
      }

      this.logger.info(
        `   🏛️ ${monuments.length} monument(s) ciblé(s) détecté(s) (avec investissements mais sans les miens)`
      );

      // 3. Traiter chaque monument avec le nom du propriétaire
      for (const monument of monuments) {
        await this.processMonument(monument, playerName);
      }
    } catch (error) {
      this.logger.error(
        `❌ Erreur traitement ${playerName || `position ${playerPosition}`}:`,
        error
      );
    }
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
      const tableData = await this.ocrService.extractMonumentTableData(
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
  async processMonument(
    monument: InvestedMonument,
    ownerName?: string
  ): Promise<void> {
    this.logger.info(`🏛️ Traitement du monument: ${monument.name}`);

    try {
      // 1. Cliquer sur le bouton "Ouvrir" du monument avec clic naturel
      await this.clickButtonNaturally(
        monument.position,
        `Ouvrir (${monument.name})`
      );
      await this.automationService.randomDelay(1500, 2500);

      // 2. Capturer et analyser les places disponibles avec le nom du propriétaire
      const monumentData = await this.analyzeMonumentOpportunities(ownerName);

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
  async analyzeMonumentOpportunities(
    ownerName?: string
  ): Promise<MonumentData> {
    this.logger.info('🔍 Analyse des opportunités du monument...');

    // Capturer la zone des places du monument
    const screenshot = await this.screenCapture.captureMonument();

    // Sauvegarder l'image pour l'OCR (obligatoire car on doit passer le chemin)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `monument_${timestamp}`;
    await this.screenCapture.saveCapture(screenshot, filename);

    // Construire le chemin complet du fichier sauvegardé
    const path = await import('path');
    const imagePath = path.join(process.cwd(), 'captures', `${filename}.png`);

    this.logger.debug(`📁 Image sauvegardée pour OCR: ${imagePath}`);

    // Analyser avec OCR en passant le chemin de l'image et le nom du propriétaire
    const monumentData = await this.ocrService.analyzeMonument(
      imagePath,
      ownerName
    );

    // Extraire les récompenses pour toutes les places de manière strictement séquentielle
    this.logger.debug(
      `🎁 Extraction séquentielle des récompenses pour ${monumentData.places.length} places...`
    );

    let currentIndex = 0;
    for (const place of monumentData.places) {
      try {
        this.logger.debug(
          `🎁 [${currentIndex + 1}/${monumentData.places.length}] Extraction récompenses place ${place.position}...`
        );

        // Attendre que l'extraction précédente soit complètement terminée
        const rewards = await this.rewardExtractor.extractRewardsForPlace(place.position);
        place.rewards = rewards;

        this.logger.debug(
          `✅ [${currentIndex + 1}/${monumentData.places.length}] ${rewards.length} récompense(s) extraite(s) pour place ${place.position}`
        );

        // Délai obligatoire entre chaque extraction pour garantir la séquentialité
        if (currentIndex < monumentData.places.length - 1) {
          this.logger.debug('⏱️ Attente avant prochaine extraction...');
          await this.automationService.randomDelay(200, 1000);
        }
      } catch (error) {
        this.logger.error(
          `❌ [${currentIndex + 1}/${monumentData.places.length}] Erreur extraction récompenses place ${place.position}:`,
          error
        );
        place.rewards = []; // Valeur par défaut si l'extraction échoue

        // Même en cas d'erreur, attendre avant de continuer pour maintenir la séquentialité
        if (currentIndex < monumentData.places.length - 1) {
          this.logger.debug(
            '⏱️ Attente après erreur avant prochaine extraction...'
          );
          await this.automationService.randomDelay(800, 1500);
        }
      }

      currentIndex++;
    }

    // Supprimer le fichier temporaire si debug désactivé
    if (!this.config.debug.saveCaptures) {
      try {
        const fs = await import('fs');
        await fs.promises.unlink(imagePath);
        this.logger.debug('🗑️ Fichier temporaire supprimé');
      } catch (error) {
        this.logger.debug('Suppression fichier temporaire échouée:', error);
      }
    }

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
   * Filtre les monuments selon nos critères :
   * - Ont des investissements existants (progression.current > 0)
   * - N'ont pas mes investissements (myInvestment === null)
   */
  filterTargetMonuments(
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
   * Méthode de test pour valider la logique de filtrage
   */
  async testMonumentFiltering(): Promise<void> {
    this.logger.info('🧪 Test de la logique de filtrage des monuments...');

    try {
      // Simuler une capture d'écran
      const mockScreenshot = null; // Placeholder

      // Extraire les données (utilisera les données simulées)
      const tableData =
        await this.ocrService.extractMonumentTableData(mockScreenshot);

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
  calculatePlayerCardPosition(playerIndex: number): {
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
}
