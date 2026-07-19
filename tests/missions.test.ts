import { describe, it, expect } from 'vitest';
import { MissionManager } from '../src/systems/MissionManager';
import { createDefaultSave } from '../src/services/SaveService';
import type { RunStats } from '../src/core/types';

const emptyStats = (): RunStats => ({
  distance: 0,
  coins: 0,
  bones: 0,
  jumps: 0,
  slides: 0,
  laneChanges: 0,
  shieldsUsed: 0,
  hit: false,
});

describe('MissionManager', () => {
  it('generates a deterministic set for a given day', () => {
    const a = createDefaultSave();
    const b = createDefaultSave();
    MissionManager.ensureDaily(a, '2026-07-19');
    MissionManager.ensureDaily(b, '2026-07-19');
    expect(a.missions.map((m) => m.id)).toEqual(b.missions.map((m) => m.id));
    expect(a.missions.length).toBe(3);
  });

  it('regenerates missions on a new day', () => {
    const save = createDefaultSave();
    MissionManager.ensureDaily(save, '2026-07-19');
    const first = save.missions.map((m) => m.id);
    MissionManager.ensureDaily(save, '2026-07-20');
    // Different date => new roll (progress reset).
    expect(save.missionsDate).toBe('2026-07-20');
    expect(save.missions.every((m) => m.progress === 0)).toBe(true);
    expect(first.length).toBe(3);
  });

  it('applies run stats to matching missions', () => {
    const save = createDefaultSave();
    save.missions = [{ id: 'coins-200', progress: 0, completed: false, claimed: false }];
    const stats = emptyStats();
    stats.coins = 200;
    MissionManager.applyRun(save.missions, stats);
    expect(save.missions[0].completed).toBe(true);
    expect(save.missions[0].progress).toBe(200);
  });

  it('claims a completed mission exactly once', () => {
    const save = createDefaultSave();
    save.missions = [{ id: 'coins-200', progress: 200, completed: true, claimed: false }];
    const first = MissionManager.claimCompleted(save.missions);
    const second = MissionManager.claimCompleted(save.missions);
    expect(first).toBeGreaterThan(0);
    expect(second).toBe(0);
    expect(save.missions[0].claimed).toBe(true);
  });

  it('does not overshoot the target', () => {
    const save = createDefaultSave();
    save.missions = [{ id: 'jumps-30', progress: 0, completed: false, claimed: false }];
    const stats = emptyStats();
    stats.jumps = 1000;
    MissionManager.applyRun(save.missions, stats);
    expect(save.missions[0].progress).toBe(30);
  });
});
