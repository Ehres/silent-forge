import { describe, it, expect } from 'bun:test';
import {
  getButtonCenter,
  isPointInButton,
  getHumanLikeClickPosition,
  ButtonCoordinates,
} from '../button-utils';

const button: ButtonCoordinates = { x: 100, y: 200, width: 60, height: 30 };

describe('getButtonCenter', () => {
  it('computes center correctly', () => {
    const center = getButtonCenter(button);

    expect(center.x).toBe(130); // 100 + 60/2
    expect(center.y).toBe(215); // 200 + 30/2
  });

  it('handles odd dimensions', () => {
    const oddButton: ButtonCoordinates = { x: 0, y: 0, width: 11, height: 7 };
    const center = getButtonCenter(oddButton);

    expect(center.x).toBe(5); // Math.floor(11/2)
    expect(center.y).toBe(3); // Math.floor(7/2)
  });
});

describe('isPointInButton', () => {
  it('returns true for point inside', () => {
    expect(isPointInButton(130, 215, button)).toBe(true);
  });

  it('returns true on left edge', () => {
    expect(isPointInButton(100, 215, button)).toBe(true);
  });

  it('returns true on right edge', () => {
    expect(isPointInButton(160, 215, button)).toBe(true);
  });

  it('returns true on top edge', () => {
    expect(isPointInButton(130, 200, button)).toBe(true);
  });

  it('returns true on bottom edge', () => {
    expect(isPointInButton(130, 230, button)).toBe(true);
  });

  it('returns false outside left', () => {
    expect(isPointInButton(99, 215, button)).toBe(false);
  });

  it('returns false outside right', () => {
    expect(isPointInButton(161, 215, button)).toBe(false);
  });

  it('returns false outside top', () => {
    expect(isPointInButton(130, 199, button)).toBe(false);
  });

  it('returns false outside bottom', () => {
    expect(isPointInButton(130, 231, button)).toBe(false);
  });
});

describe('getHumanLikeClickPosition', () => {
  it('returns position within button bounds', () => {
    // Run multiple times to account for randomness
    for (let i = 0; i < 50; i++) {
      const pos = getHumanLikeClickPosition(button, 'casual');

      expect(pos.x).toBeGreaterThanOrEqual(button.x);
      expect(pos.x).toBeLessThanOrEqual(button.x + button.width);
      expect(pos.y).toBeGreaterThanOrEqual(button.y);
      expect(pos.y).toBeLessThanOrEqual(button.y + button.height);
    }
  });

  it('works with all behavior types', () => {
    const behaviors = ['precise', 'casual', 'hurried', 'careful'] as const;

    for (const behavior of behaviors) {
      const pos = getHumanLikeClickPosition(button, behavior);
      expect(pos.x).toBeGreaterThanOrEqual(button.x);
      expect(pos.x).toBeLessThanOrEqual(button.x + button.width);
      expect(pos.y).toBeGreaterThanOrEqual(button.y);
      expect(pos.y).toBeLessThanOrEqual(button.y + button.height);
    }
  });
});
