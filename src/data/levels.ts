import type { LevelDef } from '../core/types';

/** Level 1-9 plus the endless mode entry (level 10). */
export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: 'Paseo inicial',
    scenario: 'Barrio residencial',
    targetDistance: 500,
    difficulty: 0,
    reward: 150,
    objectives: ['Recorre 500 metros', 'Recoge 50 monedas', 'No choques'],
  },
  {
    id: 2,
    name: 'Calles activas',
    scenario: 'Ciudad',
    targetDistance: 800,
    difficulty: 1,
    reward: 200,
    objectives: ['Recorre 800 metros', 'Recoge 80 monedas', 'Salta 5 obstáculos'],
  },
  {
    id: 3,
    name: 'Tráfico urbano',
    scenario: 'Centro histórico',
    targetDistance: 1100,
    difficulty: 3,
    reward: 260,
    objectives: ['Recorre 1100 metros', 'Recoge 120 monedas', 'Consigue 5 huesos'],
  },
  {
    id: 4,
    name: 'Zona de obras',
    scenario: 'Zona industrial',
    targetDistance: 1400,
    difficulty: 4,
    reward: 320,
    objectives: ['Recorre 1400 metros', 'Deslízate 8 veces', 'No choques'],
  },
  {
    id: 5,
    name: 'Hora punta',
    scenario: 'Carretera',
    targetDistance: 1700,
    difficulty: 6,
    reward: 400,
    objectives: ['Recorre 1700 metros', 'Cambia de carril 20 veces', 'Recoge 160 monedas'],
  },
  {
    id: 6,
    name: 'Noche en la ciudad',
    scenario: 'Noche',
    targetDistance: 2000,
    difficulty: 7,
    reward: 480,
    objectives: ['Recorre 2000 metros', 'Usa 2 escudos', 'Recoge 10 huesos'],
  },
  {
    id: 7,
    name: 'Lluvia',
    scenario: 'Lluvia',
    targetDistance: 2300,
    difficulty: 8,
    reward: 560,
    objectives: ['Recorre 2300 metros', 'Deslízate 12 veces', 'No choques'],
  },
  {
    id: 8,
    name: 'Ruta extrema',
    scenario: 'Montaña',
    targetDistance: 2600,
    difficulty: 10,
    reward: 640,
    objectives: ['Recorre 2600 metros', 'Salta 20 obstáculos', 'Recoge 200 monedas'],
  },
  {
    id: 9,
    name: 'Aventura total',
    scenario: 'Bosque',
    targetDistance: 3000,
    difficulty: 12,
    reward: 800,
    objectives: ['Recorre 3000 metros', 'Consigue 20 huesos', 'No choques'],
  },
  {
    id: 10,
    name: 'Modo infinito',
    scenario: 'Aventura sin límites',
    targetDistance: Number.POSITIVE_INFINITY,
    difficulty: 13,
    reward: 0,
    objectives: ['Sobrevive lo más lejos posible', 'Supera tu récord', '¡Sin final!'],
  },
];

export function getLevel(id: number): LevelDef {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}
