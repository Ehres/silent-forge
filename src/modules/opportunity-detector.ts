import { MonumentData, Opportunity } from '../types';
import { Logger } from '../utils/logger';

/**
 * Service de détection d'opportunités de snipe
 */
export class OpportunityDetector {
  private logger: Logger;
  private minProfitThreshold: number;
  private minProfitabilityPercent: number;

  constructor(
    minProfitThreshold: number = 50,
    minProfitabilityPercent: number = 10
  ) {
    this.logger = new Logger();
    this.minProfitThreshold = minProfitThreshold;
    this.minProfitabilityPercent = minProfitabilityPercent;
  }

  /**
   * Trouve toutes les opportunités rentables dans un monument
   */
  findOpportunities(monumentData: MonumentData): Opportunity[] {
    this.logger.info(
      `🔍 Recherche d'opportunités dans ${monumentData.name}...`
    );

    const opportunities: Opportunity[] = [];

    for (const place of monumentData.places) {
      const profit = place.return - place.cost;
      const profitability = (profit / place.cost) * 100;

      // Vérifier si c'est une opportunité rentable
      if (this.isOpportunity(profit, profitability)) {
        const opportunity: Opportunity = {
          position: place.position,
          cost: place.cost,
          return: place.return,
          profit,
          profitability,
          monumentName: monumentData.name,
        };

        opportunities.push(opportunity);
        this.logger.debug(
          `💰 Opportunité trouvée: Place ${place.position} (${profit}PF profit, ${profitability.toFixed(1)}%)`
        );
      }
    }

    // Trier par rentabilité décroissante
    opportunities.sort((a, b) => b.profitability - a.profitability);

    this.logger.info(`🎯 ${opportunities.length} opportunité(s) détectée(s)`);
    return opportunities;
  }

  /**
   * Détermine si une place représente une opportunité rentable
   */
  private isOpportunity(profit: number, profitability: number): boolean {
    return (
      profit >= this.minProfitThreshold &&
      profitability >= this.minProfitabilityPercent
    );
  }

  /**
   * Analyse la rentabilité globale d'un monument
   */
  analyzeMonumentProfitability(monumentData: MonumentData): {
    totalOpportunities: number;
    averageProfitability: number;
    bestOpportunity: Opportunity | null;
    totalPotentialProfit: number;
  } {
    const opportunities = this.findOpportunities(monumentData);

    if (opportunities.length === 0) {
      return {
        totalOpportunities: 0,
        averageProfitability: 0,
        bestOpportunity: null,
        totalPotentialProfit: 0,
      };
    }

    const totalPotentialProfit = opportunities.reduce(
      (sum, opp) => sum + opp.profit,
      0
    );
    const averageProfitability =
      opportunities.reduce((sum, opp) => sum + opp.profitability, 0) /
      opportunities.length;

    return {
      totalOpportunities: opportunities.length,
      averageProfitability,
      bestOpportunity: opportunities[0], // Le premier est le plus rentable (trié)
      totalPotentialProfit,
    };
  }

  /**
   * Met à jour les seuils de rentabilité
   */
  updateThresholds(minProfit: number, minProfitabilityPercent: number): void {
    this.minProfitThreshold = minProfit;
    this.minProfitabilityPercent = minProfitabilityPercent;
    this.logger.info(
      `🎯 Seuils mis à jour: ${minProfit}PF minimum, ${minProfitabilityPercent}% minimum`
    );
  }
}
