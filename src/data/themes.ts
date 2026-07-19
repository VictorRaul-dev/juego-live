export interface Theme {
  sky: number;
  horizon: number;
  building: number;
  road: number;
  sidewalk: number;
  night: boolean;
  rain: boolean;
}

const THEMES: Record<string, Theme> = {
  'Barrio residencial': {
    sky: 0x9fd8ff,
    horizon: 0x7fc4ff,
    building: 0xe08f6a,
    road: 0x4a4a55,
    sidewalk: 0x9a9aa8,
    night: false,
    rain: false,
  },
  Ciudad: {
    sky: 0x8fc9ff,
    horizon: 0x6fa8d8,
    building: 0x8a93b5,
    road: 0x45454f,
    sidewalk: 0x8f8f9c,
    night: false,
    rain: false,
  },
  'Centro histórico': {
    sky: 0xffd9a0,
    horizon: 0xf0b070,
    building: 0xc98a5a,
    road: 0x50483f,
    sidewalk: 0xb0a58f,
    night: false,
    rain: false,
  },
  'Zona industrial': {
    sky: 0xbfc4cc,
    horizon: 0x9aa0a8,
    building: 0x6b7078,
    road: 0x40424a,
    sidewalk: 0x7a7d85,
    night: false,
    rain: false,
  },
  Carretera: {
    sky: 0x88c8ff,
    horizon: 0x66a0e0,
    building: 0x5a8a4a,
    road: 0x42424c,
    sidewalk: 0x7f8a6a,
    night: false,
    rain: false,
  },
  Noche: {
    sky: 0x140630,
    horizon: 0x241050,
    building: 0x2a2350,
    road: 0x2a2a33,
    sidewalk: 0x3a3a48,
    night: true,
    rain: false,
  },
  Lluvia: {
    sky: 0x5a6a7a,
    horizon: 0x48555f,
    building: 0x3f4750,
    road: 0x33363d,
    sidewalk: 0x5a5f68,
    night: false,
    rain: true,
  },
  Montaña: {
    sky: 0xaee0ff,
    horizon: 0x88b8d8,
    building: 0x6a8a5a,
    road: 0x4a4a44,
    sidewalk: 0x8a8a72,
    night: false,
    rain: false,
  },
  Bosque: {
    sky: 0xbfeaa0,
    horizon: 0x8fc470,
    building: 0x4a7a3a,
    road: 0x45463f,
    sidewalk: 0x6f7a5a,
    night: false,
    rain: false,
  },
  'Aventura sin límites': {
    sky: 0x2b1055,
    horizon: 0x5a2a9a,
    building: 0x7b2ff7,
    road: 0x3a3548,
    sidewalk: 0x5a4a7a,
    night: true,
    rain: false,
  },
};

export function getTheme(scenario: string): Theme {
  return THEMES[scenario] ?? THEMES['Ciudad'];
}
