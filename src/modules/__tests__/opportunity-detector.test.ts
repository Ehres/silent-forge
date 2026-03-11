import { OpportunityDetector } from '../opportunity-detector';
import { MonumentData } from '../../types';

function makeMonument(
  places: Array<{ position: number; cost: number; return: number }>
): MonumentData {
  return {
    name: 'Test Monument',
    places: places.map((p) => ({
      ...p,
      isAvailable: true,
      rewards: [],
    })),
    timestamp: new Date(),
    hasExistingInvestments: true,
  };
}

describe('OpportunityDetector', () => {
  describe('findOpportunities', () => {
    it('returns empty when thresholds are not met', () => {
      const detector = new OpportunityDetector(100, 20);
      const monument = makeMonument([
        { position: 1, cost: 200, return: 210 }, // profit 10, 5% — below both
      ]);

      const result = detector.findOpportunities(monument);

      expect(result).toHaveLength(0);
    });

    it('identifies profitable places correctly', () => {
      const detector = new OpportunityDetector(50, 10);
      const monument = makeMonument([
        { position: 1, cost: 200, return: 280 }, // profit 80, 40%
        { position: 2, cost: 200, return: 210 }, // profit 10, 5% — below threshold
        { position: 3, cost: 100, return: 170 }, // profit 70, 70%
      ]);

      const result = detector.findOpportunities(monument);

      expect(result).toHaveLength(2);
      expect(result.map((o) => o.position)).toEqual([3, 1]); // sorted by profitability desc
    });

    it('sorts by profitability descending', () => {
      const detector = new OpportunityDetector(10, 5);
      const monument = makeMonument([
        { position: 1, cost: 200, return: 260 }, // 30%
        { position: 2, cost: 100, return: 200 }, // 100%
        { position: 3, cost: 300, return: 400 }, // 33%
      ]);

      const result = detector.findOpportunities(monument);

      expect(result[0].position).toBe(2); // 100% first
      expect(result[1].position).toBe(3); // 33% second
      expect(result[2].position).toBe(1); // 30% third
    });

    it('handles zero cost without crashing', () => {
      const detector = new OpportunityDetector(10, 5);
      const monument = makeMonument([
        { position: 1, cost: 0, return: 100 },
      ]);

      // cost=0 → profitability = Infinity or NaN
      const result = detector.findOpportunities(monument);

      // With cost 0, profit/cost produces Infinity — should still not crash
      expect(result).toBeDefined();
    });

    it('rejects negative profit', () => {
      const detector = new OpportunityDetector(10, 5);
      const monument = makeMonument([
        { position: 1, cost: 300, return: 200 }, // -100 profit
      ]);

      const result = detector.findOpportunities(monument);

      expect(result).toHaveLength(0);
    });
  });

  describe('updateThresholds', () => {
    it('changes detection behavior', () => {
      const detector = new OpportunityDetector(100, 20);
      const monument = makeMonument([
        { position: 1, cost: 200, return: 260 }, // profit 60, 30%
      ]);

      // With minProfit=100, this should not be found
      expect(detector.findOpportunities(monument)).toHaveLength(0);

      // Lower thresholds
      detector.updateThresholds(50, 10);

      // Now it should be found
      expect(detector.findOpportunities(monument)).toHaveLength(1);
    });
  });

  describe('analyzeMonumentProfitability', () => {
    it('returns zeroed summary when no opportunities', () => {
      const detector = new OpportunityDetector(1000, 90);
      const monument = makeMonument([
        { position: 1, cost: 200, return: 210 },
      ]);

      const result = detector.analyzeMonumentProfitability(monument);

      expect(result.totalOpportunities).toBe(0);
      expect(result.bestOpportunity).toBeNull();
      expect(result.totalPotentialProfit).toBe(0);
    });

    it('returns correct summary with opportunities', () => {
      const detector = new OpportunityDetector(10, 5);
      const monument = makeMonument([
        { position: 1, cost: 100, return: 200 }, // profit 100
        { position: 2, cost: 100, return: 150 }, // profit 50
      ]);

      const result = detector.analyzeMonumentProfitability(monument);

      expect(result.totalOpportunities).toBe(2);
      expect(result.totalPotentialProfit).toBe(150);
      expect(result.bestOpportunity).not.toBeNull();
      expect(result.bestOpportunity!.position).toBe(1); // highest profitability
    });
  });
});
