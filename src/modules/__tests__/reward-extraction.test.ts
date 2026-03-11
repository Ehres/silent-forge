import { RewardExtractionService } from '../reward-extraction-service';

describe('RewardExtractionService.parseRewardsFromTooltip', () => {
  const service = new RewardExtractionService();

  // We test the public parseRewardsFromTooltip by mocking the OCR layer.
  // Since extractTextFromTooltip is called internally and requires a real file,
  // we test the regex parsing logic directly via a private-access workaround.
  // The method is public per the plan "for testability".

  it('parses forge points from tooltip text', async () => {
    // Mock the ocrService.extractTextFromTooltip to return known text
    const originalExtract = (service as any).ocrService.extractTextFromTooltip;
    (service as any).ocrService.extractTextFromTooltip = async () =>
      '+100 Points Forge';

    const rewards = await service.parseRewardsFromTooltip('dummy-path.png');

    expect(rewards).toHaveLength(1);
    expect(rewards[0].type).toBe('forge_points');
    expect(rewards[0].quantity).toBe(100);

    // Restore
    (service as any).ocrService.extractTextFromTooltip = originalExtract;
  });

  it('parses medals from tooltip text', async () => {
    (service as any).ocrService.extractTextFromTooltip = async () =>
      '+50 Médailles';

    const rewards = await service.parseRewardsFromTooltip('dummy-path.png');

    expect(rewards).toHaveLength(1);
    expect(rewards[0].type).toBe('medal');
    expect(rewards[0].quantity).toBe(50);
  });

  it('parses blueprints from tooltip text', async () => {
    (service as any).ocrService.extractTextFromTooltip = async () =>
      '+10 Plans';

    const rewards = await service.parseRewardsFromTooltip('dummy-path.png');

    expect(rewards).toHaveLength(1);
    expect(rewards[0].type).toBe('blueprint');
    expect(rewards[0].quantity).toBe(10);
  });

  it('parses multiple reward types', async () => {
    (service as any).ocrService.extractTextFromTooltip = async () =>
      '+200 Points Forge\n+30 Médailles\n+5 Plans';

    const rewards = await service.parseRewardsFromTooltip('dummy-path.png');

    expect(rewards).toHaveLength(3);
    expect(rewards.map((r) => r.type).sort()).toEqual([
      'blueprint',
      'forge_points',
      'medal',
    ]);
  });

  it('returns empty for unrecognized text', async () => {
    (service as any).ocrService.extractTextFromTooltip = async () =>
      'random garbage text';

    const rewards = await service.parseRewardsFromTooltip('dummy-path.png');

    expect(rewards).toHaveLength(0);
  });
});
