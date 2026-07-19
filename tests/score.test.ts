import { describe, it, expect } from 'vitest';
import { ScoreManager } from '../src/systems/ScoreManager';
import { SCORE_PER_BONE, SCORE_PER_COIN } from '../src/config/GameConfig';

describe('ScoreManager', () => {
  it('combines distance, coins and bones', () => {
    const s = new ScoreManager(1);
    s.setDistance(100);
    s.addCoin(5);
    s.addBone(2);
    expect(s.score).toBe(100 + 5 * SCORE_PER_COIN + 2 * SCORE_PER_BONE);
  });

  it('applies the base multiplier', () => {
    const s = new ScoreManager(1.5);
    s.setDistance(200);
    expect(s.score).toBe(Math.round(200 * 1.5));
  });

  it('double-score temp multiplier stacks with base', () => {
    const s = new ScoreManager(2);
    s.setDistance(100);
    s.setTempMultiplier(2);
    expect(s.multiplier).toBe(4);
    expect(s.score).toBe(400);
  });

  it('resets cleanly', () => {
    const s = new ScoreManager(1);
    s.setDistance(500);
    s.addCoin(10);
    s.reset();
    expect(s.score).toBe(0);
    expect(s.coinCount).toBe(0);
  });
});
