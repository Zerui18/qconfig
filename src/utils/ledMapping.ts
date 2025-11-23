
// Mapping from LED Matrix Index (0-71) to Application Index (0-71)
// LED Matrix is Column-Major. Application is Hand-Major (Row-Major per hand).

// Left Hand (LED 0-35)
// Col 1 (Outer): 5 keys
// Col 2: 5 keys
// Col 3: 5 keys
// Col 4: 5 keys
// Col 5: 5 keys
// Col 6: 4 keys
// Col 7 (Inner): 3 keys
// Thumb Bottom: 3 keys
// Thumb Top: 1 key

// Right Hand (LED 36-71) - Mirrored order (Outer to Inner)

const LED_TO_APP_MAP = [
    // LEFT HAND
    // Col 1 (Outer)
    0, 7, 14, 21, 27,
    // Col 2
    1, 8, 15, 22, 28,
    // Col 3
    2, 9, 16, 23, 29,
    // Col 4
    3, 10, 17, 24, 30,
    // Col 5
    4, 11, 18, 25, 31,
    // Col 6
    5, 12, 19, 26,
    // Col 7 (Inner)
    6, 13, 20,
    // Thumb Bottom
    33, 34, 35,
    // Thumb Top
    32,

    // RIGHT HAND
    // Col 1 (Outer - Rightmost)
    42, 49, 56, 62, 67,
    // Col 2
    41, 48, 55, 61, 66,
    // Col 3
    40, 47, 54, 60, 65,
    // Col 4
    39, 46, 53, 59, 64,
    // Col 5
    38, 45, 52, 58, 63,
    // Col 6
    37, 44, 51, 57,
    // Col 7 (Inner)
    36, 43, 50,
    // Thumb Bottom
    69, 70, 71,
    // Thumb Top
    68
];

// Inverse mapping: App Index -> LED Index
const APP_TO_LED_MAP = new Array(72).fill(0);
LED_TO_APP_MAP.forEach((appIndex, ledIndex) => {
    APP_TO_LED_MAP[appIndex] = ledIndex;
});

export const mapLedToApp = (ledIndex: number): number => {
    if (ledIndex < 0 || ledIndex >= 72) return -1;
    return LED_TO_APP_MAP[ledIndex];
};

export const mapAppToLed = (appIndex: number): number => {
    if (appIndex < 0 || appIndex >= 72) return -1;
    return APP_TO_LED_MAP[appIndex];
};
