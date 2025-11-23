import { KeyType } from '../types';

export const getKeyType = (code: string): KeyType => {
    const c = code.toUpperCase();

    if (c === 'KC_TRANSPARENT' || c === '_______' || c === 'XXXXXXX' || c === 'KC_NO') {
        return 'transparent';
    }

    if (
        c.startsWith('MO(') ||
        c.startsWith('TG(') ||
        c.startsWith('TO(') ||
        c.startsWith('TT(') ||
        c.startsWith('DF(') ||
        c.startsWith('OSL(') ||
        c.startsWith('LT(') // LT is now a layer key
    ) {
        return 'layer';
    }

    if (c.startsWith('TD(') || c === 'CW_TOGG' || c === 'QK_BOOT') {
        return 'special';
    }

    if (c === 'KC_T') return 'alpha';

    if (
        c.includes('GUI') ||
        c.includes('CTL') ||
        c.includes('ALT') ||
        c.includes('SFT') ||
        c.startsWith('MT(') ||
        c.endsWith('_T') ||
        c === 'KC_HYPR' ||
        c === 'KC_MEH'
    ) {
        return 'modifier';
    }

    if (c === 'RESET' || c.startsWith('RGB_') || c.startsWith('AU_')) {
        return 'system';
    }

    // Default to alpha for standard keys
    return 'alpha';
};

const SYMBOLS: Record<string, string> = {
    // Modifiers
    'KC_LCTL': '⌃', 'KC_RCTL': '⌃', 'KC_LCTRL': '⌃', 'KC_RCTRL': '⌃',
    'KC_LSFT': '⇧', 'KC_RSFT': '⇧', 'KC_LSHIFT': '⇧', 'KC_RSHIFT': '⇧',
    'KC_LALT': '⌥', 'KC_RALT': '⌥', 'KC_LEFT_ALT': '⌥', 'KC_RIGHT_ALT': '⌥',
    'KC_LGUI': '⌘', 'KC_RGUI': '⌘', 'KC_GUI': '⌘', 'KC_LEFT_GUI': '⌘', 'KC_RIGHT_GUI': '⌘',
    'KC_HYPR': 'HYPR', 'KC_MEH': 'MEH',

    // Navigation
    'KC_LEFT': '←', 'KC_RIGHT': '→', 'KC_UP': '↑', 'KC_DOWN': '↓',
    'KC_HOME': '↖', 'KC_END': '↘', 'KC_PGUP': '⇞', 'KC_PGDN': '⇟',

    // Editing
    'KC_BSPC': '⌫', 'KC_BSPACE': '⌫',
    'KC_DEL': '⌦', 'KC_DELETE': '⌦',
    'KC_ENT': '⏎', 'KC_ENTER': '⏎',
    'KC_TAB': '⇥',
    'KC_ESC': '⎋', 'KC_ESCAPE': '⎋',
    'KC_SPC': '␣', 'KC_SPACE': '␣',

    // Symbols
    'KC_EXLM': '!', 'KC_AT': '@', 'KC_HASH': '#', 'KC_DLR': '$', 'KC_PERC': '%',
    'KC_CIRC': '^', 'KC_AMPR': '&', 'KC_ASTR': '*', 'KC_LPRN': '(', 'KC_RPRN': ')',
    'KC_MINS': '-', 'KC_MINUS': '-', 'KC_EQL': '=', 'KC_EQUAL': '=',
    'KC_LBRC': '[', 'KC_RBRC': ']', 'KC_LCBR': '{', 'KC_RCBR': '}',
    'KC_BSLS': '\\', 'KC_NUHS': '#', 'KC_NUBS': '\\',
    'KC_SCLN': ';', 'KC_COLN': ':', 'KC_QUOT': "'", 'KC_DQUO': '"', 'KC_QUOTE': "'",
    'KC_GRV': '`', 'KC_TILD': '~', 'KC_GRAVE': '`',
    'KC_COMM': ',', 'KC_COMMA': ',', 'KC_DOT': '.', 'KC_SLSH': '/', 'KC_SLASH': '/',
    'KC_UNDS': '_', 'KC_PLUS': '+', 'KC_PIPE': '|',

    // Function Keys
    'KC_F1': 'F1', 'KC_F2': 'F2', 'KC_F3': 'F3', 'KC_F4': 'F4',
    'KC_F5': 'F5', 'KC_F6': 'F6', 'KC_F7': 'F7', 'KC_F8': 'F8',
    'KC_F9': 'F9', 'KC_F10': 'F10', 'KC_F11': 'F11', 'KC_F12': 'F12',

    // System
    'KC_CAPS': '⇪', 'KC_PSCR': '⎙', 'KC_SLCK': '⇳', 'KC_PAUS': '⎉', 'KC_INS': '⎀', 'KC_APP': '☰',
    'QK_BOOT': 'BOOT', 'RESET': 'RST',
    'CW_TOGG': 'CAPS WORD',
};

export const formatKeycode = (code: string): string => {
    if (!code) return '';
    const c = code.trim();

    // Handle Transparent
    if (c === 'KC_TRNS' || c === 'KC_TRANSPARENT' || c === '_______' || c === 'XXXXXXX') return '';

    // Direct Symbol Map
    if (SYMBOLS[c]) return SYMBOLS[c];

    // Handle TD(DANCE_i) -> TDi
    const tdMatch = /^TD\(DANCE_(\d+)\)$/.exec(c);
    if (tdMatch) {
        return `TD${tdMatch[1]}`;
    }

    // Handle Macros recursively
    // MT(MOD, KEY) -> MOD \n KEY (Stacked)
    if (c.startsWith('MT(') && c.endsWith(')')) {
        const inner = c.slice(3, -1);
        const parts = inner.split(',').map(p => p.trim());
        if (parts.length === 2) {
            const mod = parts[0].replace('MOD_', 'KC_'); // Normalize MOD_LCTL -> KC_LCTL
            const key = parts[1];
            return `${formatKeycode(mod)}\n${formatKeycode(key)}`;
        }
    }

    // LT(LAYER, KEY) -> L(LAYER) \n KEY (Stacked)
    if (c.startsWith('LT(') && c.endsWith(')')) {
        const inner = c.slice(3, -1);
        const parts = inner.split(',').map(p => p.trim());
        if (parts.length === 2) {
            return `L${parts[0]}\n${formatKeycode(parts[1])}`;
        }
    }

    // TG(LAYER) -> TG(LAYER)
    if (c.startsWith('TG(') && c.endsWith(')')) {
        const layer = c.slice(3, -1);
        return `TG${layer}`;
    }

    // Modifiers: LCTL(KEY), LSFT(KEY), etc.
    const modMatch = /^(LCTL|RCTL|LSFT|RSFT|LALT|RALT|LGUI|RGUI)\((.+)\)$/.exec(c);
    if (modMatch) {
        const mod = modMatch[1];
        const inner = modMatch[2];
        const modKey = `KC_${mod}`;
        return `${formatKeycode(modKey)}${formatKeycode(inner)}`;
    }

    // Handle nested modifiers like LALT(LCTL(KC_LEFT))
    // The regex above handles one level. If inner has more parens, it might fail if we don't match balanced parens.
    // But since we are using a simple regex `(.+)`, it captures everything inside.
    // Wait, `(.+)` is greedy. `LALT(LCTL(KC_LEFT))` -> mod="LALT", inner="LCTL(KC_LEFT)".
    // This works for simple nesting.

    // Handle standard KC_ prefix removal
    if (c.startsWith('KC_')) {
        return c.replace('KC_', '');
    }

    return c;
};
