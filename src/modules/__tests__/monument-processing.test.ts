import { MonumentProcessingService } from '../monument-processing-service';
import { RewardExtractionService } from '../reward-extraction-service';
import { MonumentTableRow } from '../../types';

// Access the public filterTargetMonuments method
function createService(): MonumentProcessingService {
  const rewardExtractor = new RewardExtractionService();
  return new MonumentProcessingService(rewardExtractor);
}

function makeRow(overrides: Partial<MonumentTableRow> = {}): MonumentTableRow {
  return {
    name: 'Test Monument',
    level: 10,
    progression: { current: 500, maximum: 1000 },
    myInvestment: null,
    myRank: null,
    activityButtonPosition: { x: 0, y: 0, width: 100, height: 30 },
    ...overrides,
  };
}

describe('MonumentProcessingService.filterTargetMonuments', () => {
  const service = createService();

  it('selects monuments with others investments but not mine', () => {
    const data: MonumentTableRow[] = [
      makeRow({ name: 'A', progression: { current: 500, maximum: 1000 }, myInvestment: null }),
      makeRow({ name: 'B', progression: { current: 300, maximum: 800 }, myInvestment: 50, myRank: 2 }),
      makeRow({ name: 'C', progression: { current: 0, maximum: 600 }, myInvestment: null }),
    ];

    const result = service.filterTargetMonuments(data);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('A');
    expect(result[0].hasOthersInvestments).toBe(true);
    expect(result[0].hasMyInvestments).toBe(false);
  });

  it('returns empty when all monuments have my investments', () => {
    const data: MonumentTableRow[] = [
      makeRow({ progression: { current: 500, maximum: 1000 }, myInvestment: 100, myRank: 1 }),
    ];

    expect(service.filterTargetMonuments(data)).toHaveLength(0);
  });

  it('returns empty when no monuments have any investments', () => {
    const data: MonumentTableRow[] = [
      makeRow({ progression: { current: 0, maximum: 1000 }, myInvestment: null }),
    ];

    expect(service.filterTargetMonuments(data)).toHaveLength(0);
  });

  it('returns empty for empty input', () => {
    expect(service.filterTargetMonuments([])).toHaveLength(0);
  });
});
