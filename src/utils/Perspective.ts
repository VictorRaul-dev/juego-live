import { GAME_HEIGHT, GAME_WIDTH, LANE_X, PLAYER_Y } from '../config/GameConfig';

/**
 * Fake-3D perspective helpers. The track is drawn as a trapezoid that narrows
 * toward a vanishing point at the horizon; entities converge toward the centre
 * and shrink as they recede, then spread out and grow as they approach the
 * player. This gives the endless runner a strong sense of depth and speed
 * without any 3D engine — and it works identically for procedural textures or
 * real image sprites.
 */
export const HORIZON_Y = GAME_HEIGHT * 0.34;
export const ROAD_BOTTOM_Y = GAME_HEIGHT;
const CENTER_X = GAME_WIDTH / 2;

/** Lane spread at the horizon (fraction of the full near-player spread). */
const NEAR_SPREAD = 1;
const FAR_SPREAD = 0.14;
/** Sprite scale at the horizon vs. at the player line. */
const FAR_SCALE = 0.25;
const NEAR_SCALE = 1;
/** Allow a little extra growth for things that rush past below the player. */
const MAX_T = 1.25;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Normalised depth: 0 at the horizon, 1 at the player line, up to MAX_T below. */
export function depthT(y: number): number {
  return clamp((y - HORIZON_Y) / (PLAYER_Y - HORIZON_Y), 0, MAX_T);
}

/** Horizontal position of a lane at a given screen depth. */
export function laneXAt(lane: number, y: number): number {
  const t = depthT(y);
  const spread = FAR_SPREAD + (NEAR_SPREAD - FAR_SPREAD) * t;
  return CENTER_X + (LANE_X[lane] - CENTER_X) * spread;
}

/** Half-width of the road surface at a given screen depth. */
export function roadHalfWidthAt(y: number): number {
  const t = depthT(y);
  const near = GAME_WIDTH * 0.4;
  const far = GAME_WIDTH * 0.07;
  return far + (near - far) * t;
}

/** Depth scale multiplier applied to a sprite at a given screen depth. */
export function depthScale(y: number, base = 1): number {
  const t = depthT(y);
  return base * (FAR_SCALE + (NEAR_SCALE - FAR_SCALE) * t);
}

/** True while an entity is still above the horizon (should stay hidden). */
export function aboveHorizon(y: number): boolean {
  return y < HORIZON_Y - 4;
}

export { CENTER_X };
