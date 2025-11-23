
import { parseConfig } from './src/utils/parser.js';

const sampleCode = `
const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
  [0] = LAYOUT_moonlander(
    KC_A, KC_B, KC_C, KC_D, KC_E, KC_F, KC_G,
    KC_H, KC_I, KC_J, KC_K, KC_L, KC_M, KC_N,
    KC_O, KC_P, KC_Q, KC_R, KC_S, KC_T, KC_U,
    KC_V, KC_W, KC_X, KC_Y, KC_Z, KC_1, KC_2,
    KC_3, KC_4, KC_5, KC_6, KC_7, KC_8, KC_9,
    KC_0, KC_ENT, KC_SPC, KC_BSPC,
    
    KC_A, KC_B, KC_C, KC_D, KC_E, KC_F, KC_G,
    KC_H, KC_I, KC_J, KC_K, KC_L, KC_M, KC_N,
    KC_O, KC_P, KC_Q, KC_R, KC_S, KC_T, KC_U,
    KC_V, KC_W, KC_X, KC_Y, KC_Z, KC_1, KC_2,
    KC_3, KC_4, KC_5, KC_6, KC_7, KC_8, KC_9,
    KC_0, KC_ENT, KC_SPC, KC_BSPC
  ),
};

const uint8_t PROGMEM ledmap[][DRIVER_LED_TOTAL][3] = {
  [0] = {
    {255,0,0}, {0,255,0}, {0,0,255},
    {10, 20, 30},
    { 100, 100, 100 }
  },
};
`;

const result = parseConfig(sampleCode);
console.log('Keymaps:', result?.keymaps ? Object.keys(result.keymaps) : 'None');
console.log('LEDs:', result?.leds ? Object.keys(result.leds) : 'None');
if (result?.leds && result.leds[0]) {
    console.log('Layer 0 LED count:', result.leds[0].length);
    console.log('First LED:', result.leds[0][0]);
} else {
    console.log('Layer 0 LEDs missing');
}
