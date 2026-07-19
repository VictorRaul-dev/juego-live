/**
 * Optional real-art assets.
 *
 * The game ships with 100% procedural placeholder graphics, but you can replace
 * any of them with real images (e.g. AI-generated PNGs) WITHOUT touching game
 * code. Two steps:
 *
 *   1. Put your image in `public/assets/images/` (transparent PNG recommended).
 *   2. Add an entry below whose `key` matches the in-game texture key.
 *
 * When a real image loads under a given key, the matching procedural texture is
 * automatically skipped (see PreloadScene + TextureFactory), so the image wins.
 *
 * Texture keys you can override:
 *   Character:  'player' (upright), 'player-slide' (crouched)
 *   Pickups:    'coin', 'bone', 'key'
 *   Power-ups:  'pu-shield', 'pu-magnet', 'pu-double-score',
 *               'pu-super-jump', 'pu-turbo', 'pu-slow-motion'
 *   Obstacles:  'ob-cone', 'ob-box', 'ob-barrier-low', 'ob-barrier-high',
 *               'ob-fence', 'ob-hole', 'ob-puddle', 'ob-car', 'ob-taxi',
 *               'ob-bus', 'ob-truck', 'ob-sign', 'ob-construction'
 *   Scenery:    'bg-buildings' (tileable skyline strip)
 *
 * See ASSETS.md for recommended sizes and art direction.
 */
export interface RealAsset {
  key: string;
  file: string;
}

export const REAL_IMAGES: RealAsset[] = [
  // Examples — uncomment and drop the matching files into public/assets/images/:
  // { key: 'player', file: 'vaca.png' },
  // { key: 'player-slide', file: 'vaca-slide.png' },
  // { key: 'ob-car', file: 'car.png' },
  // { key: 'coin', file: 'coin.png' },
];
