import { describe, it, expect } from 'vitest';
import { ChunkGenerator } from '../src/systems/ChunkGenerator';
import { CHUNK_LIBRARY } from '../src/data/chunks';
import type { TrackChunk } from '../src/core/types';

/** Deterministic RNG for reproducible tests. */
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

describe('ChunkGenerator safety validation', () => {
  const gen = new ChunkGenerator();

  it('accepts every chunk in the shipped library', () => {
    for (const c of CHUNK_LIBRARY) {
      expect(gen.isChunkSafe(c)).toBe(true);
    }
  });

  it('rejects a chunk that blocks every lane', () => {
    const bad: TrackChunk = {
      id: 'bad',
      minimumDifficulty: 0,
      maximumDifficulty: 10,
      length: 800,
      safeLane: 1,
      obstacles: [
        { type: 'car', lane: 0, avoidWith: ['lane-right'] },
        { type: 'car', lane: 1, avoidWith: ['lane-left'] },
        { type: 'car', lane: 2, avoidWith: ['lane-left'] },
      ],
      collectibles: [],
    };
    expect(gen.isChunkSafe(bad)).toBe(false);
  });

  it('rejects an unavoidable obstacle (empty avoidWith)', () => {
    const bad: TrackChunk = {
      id: 'bad2',
      minimumDifficulty: 0,
      maximumDifficulty: 10,
      length: 800,
      safeLane: 0,
      obstacles: [{ type: 'car', lane: 0, avoidWith: [] }],
      collectibles: [],
    };
    expect(gen.isChunkSafe(bad)).toBe(false);
  });

  it('rejects a safe lane that demands jump AND slide simultaneously', () => {
    const bad: TrackChunk = {
      id: 'bad3',
      minimumDifficulty: 0,
      maximumDifficulty: 10,
      length: 800,
      safeLane: 1,
      obstacles: [
        { type: 'fence', lane: 1, avoidWith: ['jump'] },
        { type: 'barrier-low', lane: 1, avoidWith: ['slide'] },
      ],
      collectibles: [],
    };
    expect(gen.isChunkSafe(bad)).toBe(false);
  });
});

describe('ChunkGenerator selection', () => {
  it('only returns chunks within the difficulty window', () => {
    const gen = new ChunkGenerator(seededRng(1));
    for (let i = 0; i < 50; i++) {
      const c = gen.next(2, 0);
      expect(2).toBeGreaterThanOrEqual(c.minimumDifficulty);
      expect(2).toBeLessThanOrEqual(c.maximumDifficulty);
    }
  });

  it('avoids repeating the same chunk back-to-back when possible', () => {
    const gen = new ChunkGenerator(seededRng(7));
    let prev = '';
    let repeats = 0;
    for (let i = 0; i < 40; i++) {
      const c = gen.next(5, 0);
      if (c.id === prev) repeats++;
      prev = c.id;
    }
    expect(repeats).toBe(0);
  });

  it('injects power-ups when chance is high', () => {
    const gen = new ChunkGenerator(seededRng(3));
    let withPower = 0;
    for (let i = 0; i < 30; i++) {
      const c = gen.next(1, 1); // 100% chance
      if ((c.powerUps ?? []).length > 0) withPower++;
    }
    expect(withPower).toBeGreaterThan(0);
  });

  it('always returns a valid chunk even for out-of-range difficulty', () => {
    const gen = new ChunkGenerator(seededRng(9));
    const c = gen.next(999, 0);
    expect(gen.isChunkSafe(c)).toBe(true);
  });
});
