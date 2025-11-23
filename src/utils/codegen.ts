import { Keymap, LedMap, PaletteItem } from '../types';
import { mapAppToLed } from './ledMapping';

export const generateCode = (keymaps: Keymap, leds: LedMap, palette: PaletteItem[] = []): string => {
    const layers = Object.keys(keymaps).map(Number).sort((a, b) => a - b);

    let code = '';

    // Generate color macros from palette
    if (palette.length > 0) {
        palette.forEach(p => {
            // Convert name to valid macro name (uppercase, underscores)
            const macroName = `COLOR_${p.name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')}`;
            code += `#define ${macroName.padEnd(24)} {${p.h},${p.s},${p.v}}\n`;
        });
        code += '\n';
    }

    // Helper to format a matrix with column alignment
    const formatMatrix = (items: string[], rowBreaks: number[]) => {
        // 1. Calculate max width for each column
        // We assume a standard grid structure for alignment purposes.
        // Moonlander has 72 keys.
        // Left: 36, Right: 36.
        // Rows 1-3: 7 keys. Row 4: 6 keys. Row 5: 5 keys. Thumb: 4 keys.
        // This is irregular.
        // However, for "neat matrix" look, we usually align index-wise across rows if possible, 
        // or just align within the row.
        // "align both column wise with the longest cell so each column matches width throughout"
        // This implies we treat the whole thing as a grid where column N has width W_N.
        // But rows have different lengths.
        // Let's assume we align based on the visual rows defined in `rowBreaks`.

        // Actually, to make it "match width throughout", we need to find the max width of ANY item in the entire set?
        // Or max width of column i across all rows?
        // Since rows differ in length, column i might not exist in all rows.
        // But let's try to align column i across all rows that have column i.

        // Let's split items into rows first.
        const rows: string[][] = [];
        let currentIndex = 0;

        // Combine Left and Right hands into single rows
        rows.push([...items.slice(0, 7), ...items.slice(36, 43)]);   // Row 1 (14 keys)
        rows.push([...items.slice(7, 14), ...items.slice(43, 50)]);  // Row 2 (14 keys)
        rows.push([...items.slice(14, 21), ...items.slice(50, 57)]); // Row 3 (14 keys)
        rows.push([...items.slice(21, 27), ...items.slice(57, 63)]); // Row 4 (12 keys)

        // Row 5: 5 keys + Big Thumb (Left) | Big Thumb + 5 keys (Right) = 12 keys
        rows.push([
            ...items.slice(27, 32), items[32],
            items[68], ...items.slice(63, 68)
        ]);

        // Row 6: 3 Small Thumbs (Left) | 3 Small Thumbs (Right) = 6 keys
        rows.push([
            ...items.slice(33, 36),
            ...items.slice(69, 72)
        ]);

        // Calculate max width for each column index (0 to 6)
        // Calculate max width for each column index (0 to 13)
        const colWidths: number[] = [];
        for (let i = 0; i < 14; i++) {
            let max = 0;
            rows.forEach(row => {
                if (i < row.length) {
                    max = Math.max(max, row[i].length);
                }
            });
            colWidths[i] = max;
        }

        // Build string
        let result = '';
        rows.forEach((row, rowIndex) => {
            result += '    '; // Indent
            row.forEach((item, colIndex) => {
                const width = colWidths[colIndex];
                const isLastInRow = colIndex === row.length - 1;
                const isLastTotal = rowIndex === rows.length - 1 && isLastInRow;

                // Pad item
                result += item.padEnd(width, ' ');
                if (!isLastTotal) {
                    result += ', ';
                }
            });
            result += '\n';
        });

        return result;
    };

    // Keymaps
    code += 'const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {\n';

    layers.forEach((layer) => {
        let keys = keymaps[layer] || [];
        // Pad to 72 keys
        if (keys.length < 72) {
            keys = [...keys, ...Array(72 - keys.length).fill('KC_TRNS')];
        }

        code += `  [${layer}] = LAYOUT_moonlander(\n`;
        code += formatMatrix(keys.map(k => k || 'KC_TRNS'), []);
        code += '  ),\n';
    });

    code += '};\n\n';

    // LED Maps
    // LED Maps
    code += 'const uint8_t PROGMEM ledmap[][RGB_MATRIX_LED_COUNT][3] = {\n';

    layers.forEach((layer) => {
        let layerLeds = leds[layer];
        // Default to all zeros if missing
        if (!layerLeds) {
            layerLeds = Array(72).fill([0, 0, 0]);
        }
        // Pad to 72 LEDs
        if (layerLeds.length < 72) {
            layerLeds = [...layerLeds, ...Array(72 - layerLeds.length).fill([0, 0, 0])];
        }

        code += `  [${layer}] = {\n`;

        // Create a map from color values to macro names
        const colorToMacro = new Map<string, string>();
        palette.forEach(p => {
            const key = `${p.h},${p.s},${p.v}`;
            const macroName = `COLOR_${p.name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')}`;
            colorToMacro.set(key, macroName);
        });

        // Reorder LEDs from App (Row-Major) to LED Matrix (Column-Major)
        const reorderedLeds = new Array(72).fill([0, 0, 0]);
        layerLeds.forEach((led, appIndex) => {
            const ledIndex = mapAppToLed(appIndex);
            if (ledIndex >= 0 && ledIndex < 72) {
                reorderedLeds[ledIndex] = led;
            }
        });

        // Format LEDs using macros where possible
        const ledStrings = reorderedLeds.map(hsv => {
            const key = `${hsv[0]},${hsv[1]},${hsv[2]}`;
            const macroName = colorToMacro.get(key);
            return macroName || `{${hsv[0]},${hsv[1]},${hsv[2]}}`;
        });

        // Format as a simple list since it's column-major and doesn't map cleanly to rows
        // But we can still wrap it nicely. 72 items. Maybe 6 per line?
        let ledCode = '';
        for (let i = 0; i < ledStrings.length; i++) {
            if (i % 6 === 0) ledCode += '    ';
            ledCode += ledStrings[i];
            if (i < ledStrings.length - 1) ledCode += ', ';
            if ((i + 1) % 6 === 0) ledCode += '\n';
        }
        code += ledCode;

        code += '  },\n';
    });

    code += '};\n';

    return code;
};
