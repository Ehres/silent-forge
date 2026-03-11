import { AutomationService } from './automation-service';
import { ScreenCapture } from './screen-capture';
import { OCRService } from './ocr-service';
import { Logger } from '../utils/logger';
import { Config, loadConfig } from '../config/config';
import { RewardItem } from '../types';

/**
 * Service d'extraction des récompenses des monuments
 */
export class RewardExtractionService {
  private automationService: AutomationService;
  private screenCapture: ScreenCapture;
  private ocrService: OCRService;
  private logger: Logger;
  private config: Config;

  constructor() {
    this.automationService = new AutomationService();
    this.screenCapture = new ScreenCapture();
    this.ocrService = new OCRService();
    this.logger = new Logger();
    this.config = loadConfig();
  }

  /**
   * Extrait les récompenses pour une place donnée
   */
  async extractRewardsForPlace(
    placePosition: number
  ): Promise<RewardItem[]> {
    try {
      this.logger.debug(`🎁 Extraction récompenses place ${placePosition}...`);

      // 1. Calculer position de l'icône récompense (alignement vertical)
      const rewardIconCoords = this.calculateRewardIconPosition(placePosition);

      // 2. Hover sur l'icône
      await this.automationService.moveMouseToPosition(
        rewardIconCoords.x,
        rewardIconCoords.y,
        this.config.monument.rewardIcons.width,
        this.config.monument.rewardIcons.height
      );
      await this.automationService.randomDelay(100, 500);

      // 3. Capturer tooltip (position dynamique basée sur la souris)
      const tooltipImagePath = await this.captureTooltipAtMousePosition();

      // 4. OCR de la tooltip
      const rewards = await this.parseRewardsFromTooltip(tooltipImagePath);

      // 5. Supprimer le fichier temporaire si debug désactivé
      if (!this.config.debug.saveCaptures) {
        try {
          const fs = await import('fs');
          await fs.promises.unlink(tooltipImagePath);
          this.logger.debug('🗑️ Fichier tooltip temporaire supprimé');
        } catch (error) {
          this.logger.debug('Suppression fichier tooltip échouée:', error);
        }
      }

      this.logger.debug(
        `✅ ${rewards.length} récompense(s) extraite(s) pour place ${placePosition}`
      );
      return rewards;
    } catch (error) {
      this.logger.error(
        `❌ Erreur extraction récompenses place ${placePosition}:`,
        error
      );
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }

  /**
   * Calcule la position de l'icône de récompense pour une place (alignement vertical)
   */
  private calculateRewardIconPosition(placePosition: number): {
    x: number;
    y: number;
  } {
    const baseX = this.config.monument.rewardIcons.baseX;
    const baseY = this.config.monument.rewardIcons.baseY;
    const verticalSpacing = this.config.monument.rewardIcons.verticalSpacing;

    return {
      x: baseX, // X fixe pour alignement vertical
      y: baseY + (placePosition - 1) * verticalSpacing,
    };
  }

  /**
   * Capture la tooltip à la position actuelle de la souris
   */
  private async captureTooltipAtMousePosition(): Promise<string> {
    try {
      // La tooltip apparaît près de la position actuelle de la souris
      const mousePos = await this.automationService.getMousePosition();

      const tooltipRegion = {
        x: mousePos.x + 13, // Décalage standard des tooltips
        y: mousePos.y - 106,
        width: this.config.monument.tooltipRegion.width,
        height: this.config.monument.tooltipRegion.height,
      };

      // Attendre que la tooltip apparaisse
      await this.automationService.randomDelay(300, 500);

      const tooltipScreenshot = await this.screenCapture.captureScreen({
        region: tooltipRegion,
      });

      // Sauvegarder l'image pour l'OCR (obligatoire car on doit passer le chemin)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `tooltip_${timestamp}`;
      await this.screenCapture.saveCapture(tooltipScreenshot, filename);

      // Construire le chemin complet du fichier sauvegardé
      const path = await import('path');
      const imagePath = path.join(process.cwd(), 'captures', `${filename}.png`);

      this.logger.debug(`📁 Tooltip sauvegardée pour OCR: ${imagePath}`);
      return imagePath;
    } catch (error) {
      this.logger.error('❌ Erreur capture tooltip:', error);
      throw error;
    }
  }

  /**
   * Parse les récompenses depuis une tooltip via OCR
   */
  async parseRewardsFromTooltip(
    tooltipImagePath: string
  ): Promise<RewardItem[]> {
    try {
      const ocrText =
        await this.ocrService.extractTextFromTooltip(tooltipImagePath);
      const rewards: RewardItem[] = [];

      // Pattern: "+100 Points Forge"
      const forgePointsPattern = /\+(\d+)\s+Points?\s+Forge/i;
      const forgeMatch = ocrText.match(forgePointsPattern);
      if (forgeMatch) {
        rewards.push({
          type: 'forge_points',
          quantity: parseInt(forgeMatch[1]),
          description: forgeMatch[0],
        });
      }

      // Pattern: "+100 Médailles"
      const medalPattern = /\+(\d+)\s+Médailles?/i;
      const medalMatch = ocrText.match(medalPattern);
      if (medalMatch) {
        rewards.push({
          type: 'medal',
          quantity: parseInt(medalMatch[1]),
          description: medalMatch[0],
        });
      }

      // Pattern: "+10 Plans"
      const blueprintPattern = /\+(\d+)\s+Plans?/i;
      const blueprintMatch = ocrText.match(blueprintPattern);
      if (blueprintMatch) {
        rewards.push({
          type: 'blueprint',
          quantity: parseInt(blueprintMatch[1]),
          description: blueprintMatch[0],
        });
      }

      return rewards;
    } catch (error) {
      this.logger.error('❌ Erreur parsing récompenses tooltip:', error);
      return [];
    }
  }
}
