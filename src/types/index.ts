export type Keymap = {
  [layer: number]: string[];
};

export type LedMap = {
  [layer: number]: [number, number, number][];
};

export type PaletteItem = {
  id: number;
  h: number; // Hue 0-255
  s: number; // Saturation 0-255
  v: number; // Value 0-255
  name: string;
};

export type Selection = number[]; // Indices of selected keys

export type KeyType = 'alpha' | 'modifier' | 'layer' | 'system' | 'transparent' | 'special' | 'unknown';
