import { describe, it, expect } from 'vitest';
import { GameState } from '../src/core/GameState';
import { SHOP_ITEMS } from '../src/data/shopItems';

describe('GameState currency and shop', () => {
  it('spends coins only when affordable', () => {
    const gs = new GameState();
    gs.save.coins = 100;
    expect(gs.spendCoins(150)).toBe(false);
    expect(gs.save.coins).toBe(100);
    expect(gs.spendCoins(60)).toBe(true);
    expect(gs.save.coins).toBe(40);
  });

  it('buying and equipping a cosmetic works', () => {
    const gs = new GameState();
    const item = SHOP_ITEMS.find((i) => i.id === 'scooter-blue')!;
    gs.save.coins = item.price + 10;
    expect(gs.owns(item.id)).toBe(false);
    const paid = gs.spendCoins(item.price);
    expect(paid).toBe(true);
    gs.save.ownedItems.push(item.id);
    gs.equip(item.category, item.id);
    expect(gs.owns(item.id)).toBe(true);
    expect(gs.save.equippedItems.scooter).toBe(item.id);
  });

  it('base multiplier grows with the multiplier upgrade', () => {
    const gs = new GameState();
    expect(gs.baseMultiplier).toBe(1);
    gs.save.upgrades['multiplier'] = 2;
    expect(gs.baseMultiplier).toBeCloseTo(1.3, 5);
  });
});

describe('GameState level progression', () => {
  it('level 1 starts unlocked, others locked', () => {
    const gs = new GameState();
    expect(gs.isLevelUnlocked(1)).toBe(true);
    expect(gs.isLevelUnlocked(2)).toBe(false);
  });

  it('completing a level unlocks the next and stores best/stars', () => {
    const gs = new GameState();
    gs.recordLevelResult(1, 600, 2);
    expect(gs.isLevelUnlocked(2)).toBe(true);
    expect(gs.save.levelBest[1]).toBe(600);
    expect(gs.save.levelStars[1]).toBe(2);
  });

  it('keeps the best distance and star count across runs', () => {
    const gs = new GameState();
    gs.recordLevelResult(1, 600, 2);
    gs.recordLevelResult(1, 400, 1); // worse run must not overwrite
    expect(gs.save.levelBest[1]).toBe(600);
    expect(gs.save.levelStars[1]).toBe(2);
  });
});
