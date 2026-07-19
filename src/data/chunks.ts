import type { TrackChunk } from '../core/types';

/**
 * Pre-authored, hand-validated track chunks. The procedural generator combines
 * these instead of placing obstacles with free randomness, guaranteeing that
 * every generated section always has at least one passable route.
 *
 * Convention: lanes are 0 (left), 1 (centre), 2 (right).
 * `offset` for collectibles is 0 (far edge of chunk) .. 1 (near edge).
 */
export const CHUNK_LIBRARY: TrackChunk[] = [
  // ---- Warm-up / easy (difficulty 0-2) ----
  {
    id: 'empty-runway',
    minimumDifficulty: 0,
    maximumDifficulty: 3,
    length: 900,
    safeLane: 1,
    obstacles: [],
    collectibles: [
      { type: 'coin', lane: 1, offset: 0.2 },
      { type: 'coin', lane: 1, offset: 0.4 },
      { type: 'coin', lane: 1, offset: 0.6 },
      { type: 'coin', lane: 1, offset: 0.8 },
    ],
  },
  {
    id: 'single-cone-left',
    minimumDifficulty: 0,
    maximumDifficulty: 4,
    length: 800,
    safeLane: 1,
    obstacles: [{ type: 'cone', lane: 0, avoidWith: ['lane-right', 'lane-left', 'jump'] }],
    collectibles: [
      { type: 'coin', lane: 2, offset: 0.3 },
      { type: 'coin', lane: 2, offset: 0.5 },
      { type: 'coin', lane: 1, offset: 0.7 },
    ],
  },
  {
    id: 'low-barrier-center',
    minimumDifficulty: 1,
    maximumDifficulty: 5,
    length: 850,
    safeLane: 0,
    obstacles: [{ type: 'barrier-high', lane: 1, avoidWith: ['lane-left', 'lane-right'] }],
    collectibles: [
      { type: 'coin', lane: 0, offset: 0.3 },
      { type: 'coin', lane: 0, offset: 0.5 },
      { type: 'bone', lane: 2, offset: 0.6 },
    ],
  },
  {
    id: 'jump-fence',
    minimumDifficulty: 1,
    maximumDifficulty: 6,
    length: 820,
    safeLane: 0,
    obstacles: [{ type: 'fence', lane: 1, avoidWith: ['jump', 'lane-left', 'lane-right'] }],
    collectibles: [
      { type: 'coin', lane: 1, offset: 0.45, elevated: true },
      { type: 'coin', lane: 1, offset: 0.55, elevated: true },
    ],
  },
  {
    id: 'slide-sign',
    minimumDifficulty: 2,
    maximumDifficulty: 7,
    length: 820,
    safeLane: 2,
    obstacles: [{ type: 'barrier-low', lane: 1, avoidWith: ['slide', 'lane-left', 'lane-right'] }],
    collectibles: [
      { type: 'coin', lane: 1, offset: 0.5 },
      { type: 'coin', lane: 1, offset: 0.7 },
    ],
  },

  // ---- Medium (difficulty 3-6) ----
  {
    id: 'two-cones-gap',
    minimumDifficulty: 3,
    maximumDifficulty: 7,
    length: 900,
    safeLane: 1,
    obstacles: [
      { type: 'cone', lane: 0, avoidWith: ['lane-right', 'jump'] },
      { type: 'cone', lane: 2, avoidWith: ['lane-left', 'jump'] },
    ],
    collectibles: [
      { type: 'coin', lane: 1, offset: 0.3 },
      { type: 'coin', lane: 1, offset: 0.5 },
      { type: 'coin', lane: 1, offset: 0.7 },
    ],
    powerUps: [{ type: 'magnet', lane: 1, offset: 0.9 }],
  },
  {
    id: 'car-in-center',
    minimumDifficulty: 3,
    maximumDifficulty: 8,
    length: 950,
    safeLane: 0,
    obstacles: [{ type: 'car', lane: 1, avoidWith: ['lane-left', 'lane-right'] }],
    collectibles: [
      { type: 'coin', lane: 0, offset: 0.4 },
      { type: 'coin', lane: 0, offset: 0.6 },
      { type: 'bone', lane: 0, offset: 0.8 },
    ],
  },
  {
    id: 'box-barrier-combo',
    minimumDifficulty: 4,
    maximumDifficulty: 8,
    length: 1000,
    safeLane: 2,
    obstacles: [
      { type: 'box', lane: 0, avoidWith: ['lane-right', 'jump'] },
      { type: 'barrier-high', lane: 1, avoidWith: ['lane-right'] },
    ],
    collectibles: [
      { type: 'coin', lane: 2, offset: 0.3 },
      { type: 'coin', lane: 2, offset: 0.5 },
    ],
  },
  {
    id: 'puddle-slide',
    minimumDifficulty: 4,
    maximumDifficulty: 9,
    length: 900,
    safeLane: 0,
    obstacles: [{ type: 'barrier-low', lane: 2, avoidWith: ['slide', 'lane-left'] }],
    collectibles: [
      { type: 'coin', lane: 0, offset: 0.3 },
      { type: 'coin', lane: 1, offset: 0.5 },
      { type: 'coin', lane: 2, offset: 0.7 },
    ],
    powerUps: [{ type: 'shield', lane: 0, offset: 0.85 }],
  },

  // ---- Hard (difficulty 6-10) ----
  {
    id: 'bus-lane-block',
    minimumDifficulty: 6,
    maximumDifficulty: 12,
    length: 1050,
    safeLane: 2,
    obstacles: [
      { type: 'bus', lane: 0, avoidWith: ['lane-right'] },
      { type: 'cone', lane: 1, avoidWith: ['lane-right', 'jump'] },
    ],
    collectibles: [
      { type: 'coin', lane: 2, offset: 0.3 },
      { type: 'coin', lane: 2, offset: 0.5 },
      { type: 'coin', lane: 2, offset: 0.7 },
    ],
  },
  {
    id: 'zigzag-cones',
    minimumDifficulty: 6,
    maximumDifficulty: 13,
    length: 1150,
    safeLane: 1,
    obstacles: [
      { type: 'cone', lane: 0, avoidWith: ['lane-right', 'lane-left', 'jump'] },
      { type: 'cone', lane: 2, avoidWith: ['lane-left', 'lane-right', 'jump'] },
      { type: 'cone', lane: 0, avoidWith: ['lane-right', 'lane-left', 'jump'] },
    ],
    collectibles: [
      { type: 'coin', lane: 1, offset: 0.25 },
      { type: 'coin', lane: 1, offset: 0.5 },
      { type: 'coin', lane: 1, offset: 0.75 },
      { type: 'bone', lane: 1, offset: 0.95 },
    ],
  },
  {
    id: 'truck-and-fence',
    minimumDifficulty: 7,
    maximumDifficulty: 14,
    length: 1100,
    safeLane: 2,
    obstacles: [
      { type: 'truck', lane: 0, avoidWith: ['lane-right', 'lane-left'] },
      { type: 'fence', lane: 1, avoidWith: ['jump', 'lane-right'] },
    ],
    collectibles: [
      { type: 'coin', lane: 2, offset: 0.4 },
      { type: 'coin', lane: 2, offset: 0.6 },
    ],
    powerUps: [{ type: 'double-score', lane: 2, offset: 0.9 }],
  },
  {
    id: 'construction-run',
    minimumDifficulty: 8,
    maximumDifficulty: 16,
    length: 1250,
    safeLane: 1,
    obstacles: [
      { type: 'construction', lane: 0, avoidWith: ['lane-right', 'lane-left'] },
      { type: 'barrier-high', lane: 2, avoidWith: ['lane-left'] },
      { type: 'barrier-low', lane: 1, avoidWith: ['slide'] },
    ],
    collectibles: [
      { type: 'coin', lane: 1, offset: 0.3, elevated: true },
      { type: 'coin', lane: 1, offset: 0.6 },
      { type: 'bone', lane: 1, offset: 0.85 },
    ],
  },
];
