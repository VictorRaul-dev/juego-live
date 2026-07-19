import { GAME_HEIGHT, LANE_X } from '../config/GameConfig';

/**
 * Flat, reader-friendly lane math. The track uses three straight, parallel
 * lanes (no vanishing-point convergence) so players can always judge lanes at a
 * glance. We keep a horizon line only so obstacles appear at the top edge of
 * the road instead of floating in the sky. The cinematic background, lighting,
 * shadows and headlight are unaffected.
 *
 * The `_y` parameters are kept so call sites don't need to change if a subtle
 * depth effect is reintroduced later.
 */
export const HORIZON_Y = GAME_HEIGHT * 0.34;

/** Horizontal position of a lane (constant — lanes are parallel). */
export function laneXAt(lane: number, _y = 0): number {
  return LANE_X[lane];
}

/** No perspective shrink: sprites keep their (normalised) size. */
export function depthScale(_y: number, base = 1): number {
  return base;
}

/** True while an entity is still above the road's top edge (keep it hidden). */
export function aboveHorizon(y: number): boolean {
  return y < HORIZON_Y - 4;
}
