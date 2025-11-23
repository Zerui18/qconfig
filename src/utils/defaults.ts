import { Keymap, LedMap, PaletteItem } from '../types';

export const DEFAULT_PALETTE: PaletteItem[] = [
    { id: 1, h: 0, s: 255, v: 255, name: 'Red' },        // RGB(255,0,0)
    { id: 2, h: 85, s: 255, v: 255, name: 'Green' },     // RGB(0,255,0)
    { id: 3, h: 170, s: 255, v: 255, name: 'Blue' },     // RGB(0,0,255)
    { id: 4, h: 43, s: 255, v: 255, name: 'Yellow' },    // RGB(255,255,0)
    { id: 5, h: 191, s: 128, v: 128, name: 'Purple' },   // RGB(128,0,128)
    { id: 6, h: 128, s: 255, v: 255, name: 'Cyan' },     // RGB(0,255,255)
    { id: 7, h: 0, s: 0, v: 255, name: 'White' },        // RGB(255,255,255)
    { id: 8, h: 0, s: 0, v: 0, name: 'Off' },            // RGB(0,0,0)
];

const EMPTY_KEYMAP = Array(72).fill('KC_TRANSPARENT');
const DEFAULT_LAYER_0 = [
    // Left Hand
    'KC_ESC', 'KC_1', 'KC_2', 'KC_3', 'KC_4', 'KC_5', 'KC_LEFT',
    'KC_TAB', 'KC_Q', 'KC_W', 'KC_E', 'KC_R', 'KC_T', 'KC_PGUP',
    'KC_CAPS', 'KC_A', 'KC_S', 'KC_D', 'KC_F', 'KC_G', 'KC_PGDN',
    'KC_LSFT', 'KC_Z', 'KC_X', 'KC_C', 'KC_V', 'KC_B',
    'KC_LCTL', 'KC_LGUI', 'KC_LALT', 'KC_GRV', 'KC_BSPC',
    'KC_SPC', // Big Thumb
    'KC_ENT', 'KC_HOME', 'KC_END', // Small Thumb

    // Right Hand (Mirrored roughly for example)
    'KC_RGHT', 'KC_6', 'KC_7', 'KC_8', 'KC_9', 'KC_0', 'KC_BSPC',
    'KC_PGUP', 'KC_Y', 'KC_U', 'KC_I', 'KC_O', 'KC_P', 'KC_BSLS',
    'KC_PGDN', 'KC_H', 'KC_J', 'KC_K', 'KC_L', 'KC_SCLN', 'KC_QUOT',
    'KC_N', 'KC_M', 'KC_COMM', 'KC_DOT', 'KC_SLSH', 'KC_RSFT',
    'KC_LEFT', 'KC_DOWN', 'KC_UP', 'KC_RGHT', 'KC_DEL',
    'KC_ENT', // Big Thumb
    'KC_SPC', 'KC_PGUP', 'KC_PGDN', // Small Thumb
];

export const DEFAULT_KEYMAPS: Keymap = {
    0: DEFAULT_LAYER_0,
};

const EMPTY_LEDS = Array(72).fill([0, 0, 0]);

export const DEFAULT_LEDS: LedMap = {
    0: [...EMPTY_LEDS],
};
