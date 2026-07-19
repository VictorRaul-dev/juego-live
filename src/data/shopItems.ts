import type { ShopItem } from '../core/types';

/** Cosmetic shop catalogue. No real-money purchases in this version. */
export const SHOP_ITEMS: ShopItem[] = [
  // Scooter colours
  {
    id: 'scooter-pink',
    name: 'Scooter Rosa',
    category: 'scooter',
    currency: 'coins',
    price: 0,
    tint: 0xff5db1,
    description: 'El clásico scooter rosado de VACA.',
  },
  {
    id: 'scooter-blue',
    name: 'Scooter Azul',
    category: 'scooter',
    currency: 'coins',
    price: 400,
    tint: 0x4dd0ff,
    description: 'Un scooter azul eléctrico con detalles turquesa.',
  },
  {
    id: 'scooter-gold',
    name: 'Scooter Dorado',
    category: 'scooter',
    currency: 'coins',
    price: 1200,
    tint: 0xffcc33,
    description: 'Brilla como un campeón con este scooter dorado.',
  },
  {
    id: 'scooter-purple',
    name: 'Scooter Púrpura',
    category: 'scooter',
    currency: 'bones',
    price: 40,
    tint: 0x7b2ff7,
    description: 'Estilo nocturno con acabado púrpura.',
  },

  // Wheels
  {
    id: 'wheels-neon',
    name: 'Ruedas Neón',
    category: 'wheels',
    currency: 'coins',
    price: 300,
    tint: 0x39ff14,
    description: 'Ruedas con luces neón para presumir de noche.',
  },
  {
    id: 'wheels-fire',
    name: 'Ruedas de Fuego',
    category: 'wheels',
    currency: 'bones',
    price: 25,
    tint: 0xff6a00,
    description: 'Deja una estela ardiente a tu paso.',
  },

  // Collars
  {
    id: 'collar-purple',
    name: 'Collar Morado',
    category: 'collar',
    currency: 'coins',
    price: 0,
    tint: 0x7b2ff7,
    description: 'El collar morado de siempre.',
  },
  {
    id: 'collar-red',
    name: 'Collar Rojo',
    category: 'collar',
    currency: 'coins',
    price: 250,
    tint: 0xff3b3b,
    description: 'Un toque de color para VACA.',
  },

  // Hats
  {
    id: 'hat-cap',
    name: 'Gorra Deportiva',
    category: 'hat',
    currency: 'coins',
    price: 500,
    tint: 0x4dd0ff,
    description: 'Una gorra fresca para la aventura.',
  },
  {
    id: 'hat-crown',
    name: 'Corona',
    category: 'hat',
    currency: 'bones',
    price: 60,
    tint: 0xffcc33,
    description: 'Para la reina de la ciudad.',
  },

  // Glasses
  {
    id: 'glasses-cool',
    name: 'Gafas de Sol',
    category: 'glasses',
    currency: 'coins',
    price: 350,
    tint: 0x111111,
    description: 'Gafas de sol con mucho estilo.',
  },

  // Trails
  {
    id: 'trail-rainbow',
    name: 'Estela Arcoíris',
    category: 'trail',
    currency: 'bones',
    price: 35,
    tint: 0xff5db1,
    description: 'Deja un rastro de colores brillantes.',
  },
];

/** Items granted for free from the start. */
export const DEFAULT_OWNED = ['scooter-pink', 'collar-purple'];
export const DEFAULT_EQUIPPED = {
  scooter: 'scooter-pink',
  collar: 'collar-purple',
} as const;
