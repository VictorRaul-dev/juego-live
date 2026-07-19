import type { MissionDef } from '../core/types';

/** Pool of daily missions. Three are picked per local day. */
export const MISSION_POOL: MissionDef[] = [
  { id: 'dist-1000', description: 'Recorre 1000 metros', metric: 'distance', target: 1000, reward: 100 },
  { id: 'dist-2000', description: 'Recorre 2000 metros', metric: 'distance', target: 2000, reward: 180 },
  { id: 'coins-200', description: 'Recoge 200 monedas', metric: 'coins', target: 200, reward: 120 },
  { id: 'coins-350', description: 'Recoge 350 monedas', metric: 'coins', target: 350, reward: 200 },
  { id: 'bones-20', description: 'Consigue 20 huesos', metric: 'bones', target: 20, reward: 150 },
  { id: 'jumps-30', description: 'Salta 30 obstáculos', metric: 'jumps', target: 30, reward: 110 },
  { id: 'slides-25', description: 'Deslízate 25 veces', metric: 'slides', target: 25, reward: 110 },
  { id: 'lanes-50', description: 'Cambia de carril 50 veces', metric: 'laneChanges', target: 50, reward: 90 },
  { id: 'shields-3', description: 'Usa 3 escudos', metric: 'shieldsUsed', target: 3, reward: 130 },
  { id: 'nohit-1', description: 'Completa una partida sin golpes', metric: 'runsNoHit', target: 1, reward: 160 },
];

/** Deterministically pick `count` missions for a given day string (YYYY-MM-DD). */
export function pickDailyMissions(dateKey: string, count = 3): MissionDef[] {
  // Simple deterministic hash of the date so the same day yields the same set.
  let seed = 0;
  for (let i = 0; i < dateKey.length; i++) {
    seed = (seed * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  const pool = [...MISSION_POOL];
  const picked: MissionDef[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const idx = seed % pool.length;
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}
