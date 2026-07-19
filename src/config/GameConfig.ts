/** Global gameplay constants. Design resolution is portrait 1080 x 1920 (9:16). */
export const GAME_WIDTH = 1080;
export const GAME_HEIGHT = 1920;

/** Three-lane track. */
export const LANE_COUNT = 3;
export const LANE_X: readonly number[] = [GAME_WIDTH * 0.28, GAME_WIDTH * 0.5, GAME_WIDTH * 0.72];

/** Y position of the player (near the bottom of the screen). */
export const PLAYER_Y = GAME_HEIGHT * 0.78;

/** Time (ms) to interpolate between lanes. */
export const LANE_CHANGE_MS = 140;

/** Jump / slide timings. */
export const JUMP_MS = 620;
export const JUMP_HEIGHT = 260;
export const SLIDE_MS = 560;

/** Speed model (world units per second). */
export const BASE_SPEED = 560;
export const MAX_SPEED = 1500;
export const SPEED_PER_DIFFICULTY = 95;

/** World units per on-screen metre for the distance counter. */
export const UNITS_PER_METRE = 12;

/** Power-up base durations in ms. Upgrades extend these. */
export const POWERUP_DURATION: Record<string, number> = {
  shield: 0, // shield lasts until it absorbs one hit
  magnet: 8000,
  'double-score': 10000,
  'super-jump': 9000,
  turbo: 6000,
  'slow-motion': 5000,
};

export const MAGNET_RADIUS = 260;

/** Score weighting. */
export const SCORE_PER_METRE = 1;
export const SCORE_PER_COIN = 10;
export const SCORE_PER_BONE = 25;

export const SAVE_KEY = 'vaca-aventura-save-v1';
export const SAVE_VERSION = 1;

/** Upgrade tuning: each level adds this fraction of the base value. */
export const UPGRADE_MAX_LEVEL = 5;
