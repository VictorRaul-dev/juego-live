import { UPGRADE_MAX_LEVEL } from '../config/GameConfig';

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  /** Cost of each level, indexed 0..max-1 (paid in bones). */
  costs: number[];
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'speed-control',
    name: 'Control de Velocidad',
    description: 'Empiezas cada partida con mejor manejo.',
    costs: [5, 10, 18, 28, 40],
  },
  {
    id: 'shield-duration',
    name: 'Escudo Reforzado',
    description: 'El escudo aguanta un poco más antes de romperse.',
    costs: [6, 12, 20, 30, 44],
  },
  {
    id: 'magnet-duration',
    name: 'Imán Mejorado',
    description: 'El imán atrae monedas durante más tiempo.',
    costs: [6, 12, 20, 30, 44],
  },
  {
    id: 'turbo-duration',
    name: 'Turbo Extendido',
    description: 'El turbo dura más segundos.',
    costs: [8, 14, 22, 34, 48],
  },
  {
    id: 'multiplier',
    name: 'Multiplicador',
    description: 'Aumenta el multiplicador base de puntuación.',
    costs: [10, 18, 30, 45, 65],
  },
  {
    id: 'powerup-rate',
    name: 'Suerte de Poderes',
    description: 'Aparecen poderes con mayor frecuencia.',
    costs: [8, 16, 26, 40, 60],
  },
];

/** Returns the cost of the next level, or null when maxed out. */
export function nextUpgradeCost(def: UpgradeDef, currentLevel: number): number | null {
  if (currentLevel >= UPGRADE_MAX_LEVEL) return null;
  return def.costs[currentLevel] ?? null;
}
