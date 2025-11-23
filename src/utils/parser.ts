import { Keymap, LedMap, PaletteItem } from '../types';
import { getKeyType } from './keycodes';
import { mapLedToApp } from './ledMapping';

export const parseConfig = (code: string): { keymaps: Keymap; leds: LedMap; palette: PaletteItem[] } | null => {
    try {
        const keymaps: Keymap = {};
        const leds: LedMap = {};

        // Helper to extract block content by counting delimiters
        const extractBlock = (source: string, startIdx: number, openChar: string, closeChar: string): { content: string; endIdx: number } | null => {
            let depth = 0;
            let content = '';
            let i = startIdx;

            // Find first open char
            while (i < source.length && source[i] !== openChar) i++;
            if (i >= source.length) return null;

            depth = 1;
            i++; // Skip first open char

            while (i < source.length && depth > 0) {
                if (source[i] === openChar) depth++;
                else if (source[i] === closeChar) depth--;

                if (depth > 0) content += source[i];
                i++;
            }

            return { content, endIdx: i };
        };

        // 1. Parse Keymaps
        // Find all occurrences of "LAYOUT_moonlander"
        let searchIdx = 0;
        while (true) {
            const layoutMarker = "LAYOUT_moonlander";
            const idx = code.indexOf(layoutMarker, searchIdx);
            if (idx === -1) break;

            // Find the layer ID before this: "[0] ="
            // Look backwards from idx
            const prefix = code.substring(Math.max(0, idx - 20), idx);
            const layerMatch = /\[(\d+)\]\s*=\s*$/.exec(prefix);

            if (layerMatch) {
                const layerId = parseInt(layerMatch[1]);
                const block = extractBlock(code, idx + layoutMarker.length, '(', ')');

                if (block) {
                    const content = block.content;

                    // Parse keys
                    const keys: string[] = [];
                    let currentKey = '';
                    let parenDepth = 0;

                    for (let i = 0; i < content.length; i++) {
                        const char = content[i];
                        if (char === '(') parenDepth++;
                        if (char === ')') parenDepth--;

                        if (char === ',' && parenDepth === 0) {
                            keys.push(currentKey.trim());
                            currentKey = '';
                        } else {
                            currentKey += char;
                        }
                    }
                    if (currentKey.trim()) keys.push(currentKey.trim());

                    // Clean up keys
                    const cleanedKeys = keys.map(k => k.replace(/\s+/g, ' ').trim()).filter(k => k !== '');

                    // Ensure we have 72 keys
                    if (cleanedKeys.length < 72) {
                        while (cleanedKeys.length < 72) cleanedKeys.push('KC_TRNS');
                    } else if (cleanedKeys.length > 72) {
                        cleanedKeys.length = 72;
                    }

                    keymaps[layerId] = cleanedKeys;
                    searchIdx = block.endIdx;
                } else {
                    searchIdx = idx + 1;
                }
            } else {
                searchIdx = idx + 1;
            }
        }

        // 2. Parse Color Macros
        const macroPalette = new Map<string, { h: number, s: number, v: number, name: string }>();
        const macroRegex = /#define\s+(COLOR_\w+)\s+\{(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\}/g;
        let macroMatch;
        while ((macroMatch = macroRegex.exec(code)) !== null) {
            const name = macroMatch[1].replace('COLOR_', '').replace(/_/g, ' ').toLowerCase()
                .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
            macroPalette.set(macroMatch[1], {
                h: parseInt(macroMatch[2]),
                s: parseInt(macroMatch[3]),
                v: parseInt(macroMatch[4]),
                name: name
            });
        }

        // 3. Parse LED Maps
        // Find "ledmap" array definition (flexible to handle various formats)
        // Common formats: "ledmap[][DRIVER_LED_TOTAL][3]" or "ledmap[][RGB_MATRIX_LED_COUNT][3]"
        let ledmapIdx = code.indexOf("ledmap");

        // If we found "ledmap", advance to the opening brace
        if (ledmapIdx !== -1) {
            // Skip to "=" sign after ledmap declaration
            const equalsIdx = code.indexOf("=", ledmapIdx);
            if (equalsIdx === -1) {
                ledmapIdx = -1; // Invalid format
            } else {
                ledmapIdx = equalsIdx;
            }
        }

        if (ledmapIdx !== -1) {
            // Find the main block starting with {
            const mainBlock = extractBlock(code, ledmapIdx, '{', '}');

            if (mainBlock) {
                const ledContent = mainBlock.content;
                let ledSearchIdx = 0;

                while (true) {
                    // Find layer blocks: [0] = { ... }
                    const layerMatchRegex = /\[(\d+)\]\s*=\s*/g;
                    layerMatchRegex.lastIndex = ledSearchIdx;
                    const match = layerMatchRegex.exec(ledContent);

                    if (!match) break;

                    const layerId = parseInt(match[1]);
                    const blockStart = match.index + match[0].length;
                    const block = extractBlock(ledContent, blockStart, '{', '}');

                    if (block) {
                        const content = block.content;
                        // Parse tuples {h,s,v} OR macro names
                        // We need to split by commas but respect braces
                        const items: string[] = [];
                        let currentItem = '';
                        let braceDepth = 0;

                        for (let i = 0; i < content.length; i++) {
                            const char = content[i];
                            if (char === '{') braceDepth++;
                            if (char === '}') braceDepth--;

                            if (char === ',' && braceDepth === 0) {
                                if (currentItem.trim()) items.push(currentItem.trim());
                                currentItem = '';
                            } else {
                                currentItem += char;
                            }
                        }
                        if (currentItem.trim()) items.push(currentItem.trim());

                        const parsedLeds: [number, number, number][] = [];

                        items.forEach(item => {
                            // Check for tuple {h,s,v}
                            const tupleMatch = /\{\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\}/.exec(item);
                            if (tupleMatch) {
                                parsedLeds.push([
                                    parseInt(tupleMatch[1]),
                                    parseInt(tupleMatch[2]),
                                    parseInt(tupleMatch[3])
                                ]);
                            } else {
                                // Check for macro
                                const macroName = item.trim();
                                if (macroPalette.has(macroName)) {
                                    const color = macroPalette.get(macroName)!;
                                    parsedLeds.push([color.h, color.s, color.v]);
                                } else if (macroName === 'COLOR_OFF' || macroName === '{0,0,0}') {
                                    parsedLeds.push([0, 0, 0]);
                                } else {
                                    // Unknown or 0
                                    parsedLeds.push([0, 0, 0]);
                                }
                            }
                        });

                        // Ensure 72 LEDs
                        if (parsedLeds.length < 72) {
                            while (parsedLeds.length < 72) parsedLeds.push([0, 0, 0]);
                        } else if (parsedLeds.length > 72) {
                            parsedLeds.length = 72;
                        }

                        leds[layerId] = parsedLeds;
                        ledSearchIdx = block.endIdx; // This is relative to ledContent start? No, extractBlock returns index relative to its input string?
                        // Wait, extractBlock returns endIdx relative to the start of `source`.
                        // Here `source` is `ledContent`. So `block.endIdx` is the index in `ledContent`.
                        // We need to update `ledSearchIdx` to continue searching from there.
                        // `layerMatchRegex.lastIndex` needs to be updated? No, we use `ledSearchIdx` for the next loop.
                        // Actually, `layerMatchRegex` is global, so we can just use it?
                        // But we are manually extracting blocks which advances our position.
                        // Better to just update `ledSearchIdx` to `block.endIdx`.
                        ledSearchIdx = block.endIdx;
                    } else {
                        ledSearchIdx = match.index + 1;
                    }
                }
            }
        }

        // Remap keys from Row-Major (Left+Right) to Hand-Major (Left then Right)
        // Input is expected to be:
        // Row 1: 0-6 (L), 7-13 (R)
        // Row 2: 14-20 (L), 21-27 (R)
        // Row 3: 28-34 (L), 35-41 (R)
        // Row 4: 42-47 (L), 48-53 (R)
        // Row 5: 54-58 (L), 59-63 (R)
        // Thumb: 64-67 (L), 68-71 (R) -- Assuming 4 keys per thumb in LAYOUT macro

        // App Structure (per hand):
        // Row 1: 0-6
        // Row 2: 7-13
        // Row 3: 14-20
        // Row 4: 21-26
        // Row 5: 27-31
        // Thumb: 32 (Big), 33-35 (Small)

        // We need to map Input Index -> App Index
        // Left Hand App Indices: 0-35
        // Right Hand App Indices: 36-71

        const mapInputToApp = (inputIndex: number): number => {
            // Row 1
            if (inputIndex >= 0 && inputIndex <= 6) return inputIndex; // L R1
            if (inputIndex >= 7 && inputIndex <= 13) return 36 + (inputIndex - 7); // R R1

            // Row 2
            if (inputIndex >= 14 && inputIndex <= 20) return 7 + (inputIndex - 14); // L R2
            if (inputIndex >= 21 && inputIndex <= 27) return 36 + 7 + (inputIndex - 21); // R R2

            // Row 3
            if (inputIndex >= 28 && inputIndex <= 34) return 14 + (inputIndex - 28); // L R3
            if (inputIndex >= 35 && inputIndex <= 41) return 36 + 14 + (inputIndex - 35); // R R3

            // Row 4 (6 keys)
            if (inputIndex >= 42 && inputIndex <= 47) return 21 + (inputIndex - 42); // L R4
            if (inputIndex >= 48 && inputIndex <= 53) return 36 + 21 + (inputIndex - 48); // R R4

            // Row 5 (5 + 1 Left Thumb + 1 Right Thumb + 5)
            // Left Hand
            if (inputIndex >= 54 && inputIndex <= 58) return 27 + (inputIndex - 54); // L R5 (Keys 1-5)
            if (inputIndex === 59) return 32; // L Big Thumb (Key 6)

            // Right Hand
            if (inputIndex === 60) return 68; // R Big Thumb (Key 1 of Right block)
            if (inputIndex >= 61 && inputIndex <= 65) return 63 + (inputIndex - 61); // R R5 (Keys 2-6)

            // Row 6 (3 keys in input: Small Thumbs)
            // Left Hand
            if (inputIndex >= 66 && inputIndex <= 68) return 33 + (inputIndex - 66); // L Small Thumbs

            // Right Hand
            if (inputIndex >= 69 && inputIndex <= 71) return 69 + (inputIndex - 69); // R Small Thumbs

            return inputIndex;
        };

        // Apply mapping to keymaps
        Object.keys(keymaps).forEach(layer => {
            const original = keymaps[parseInt(layer)];
            const remapped = new Array(72).fill('KC_TRNS');
            original.forEach((key, i) => {
                const newIndex = mapInputToApp(i);
                if (newIndex >= 0 && newIndex < 72) {
                    remapped[newIndex] = key;
                }
            });
            keymaps[parseInt(layer)] = remapped;
        });

        // Apply mapping to leds
        Object.keys(leds).forEach(layer => {
            const original = leds[parseInt(layer)];
            const remapped = new Array(72).fill([0, 0, 0]);
            original.forEach((led, i) => {
                // Use mapLedToApp for LEDs (Column-Major -> Hand-Major)
                const newIndex = mapLedToApp(i);
                if (newIndex >= 0 && newIndex < 72) {
                    remapped[newIndex] = led;
                }
            });
            leds[parseInt(layer)] = remapped;
        });

        if (Object.keys(keymaps).length === 0) return null;

        // Extract unique colors from LEDs for palette (only for inline colors not in macros)
        // Actually, we should rebuild the palette from:
        // 1. "Off" (Permanent)
        // 2. Macros found in the file
        // 3. Any inline colors that don't match a macro (named "Imported X")

        const finalPalette: PaletteItem[] = [
            { id: 1, h: 0, s: 0, v: 0, name: 'Off' }
        ];

        // Add macros to palette
        let nextId = 2;
        macroPalette.forEach((color, macroName) => {
            // Skip if it's basically black/off
            if (color.h === 0 && color.s === 0 && color.v === 0) return;

            finalPalette.push({
                id: nextId++,
                h: color.h,
                s: color.s,
                v: color.v,
                name: color.name
            });
        });

        // Find inline colors that are NOT covered by the macros
        const existingColorKeys = new Set<string>();
        finalPalette.forEach(p => existingColorKeys.add(`${p.h},${p.s},${p.v}`));

        const inlineColors = new Map<string, [number, number, number]>();
        Object.values(leds).forEach(layerLeds => {
            layerLeds.forEach(([h, s, v]) => {
                const key = `${h},${s},${v}`;
                if (!existingColorKeys.has(key) && !inlineColors.has(key)) {
                    // Skip black
                    if (h === 0 && s === 0 && v === 0) return;
                    inlineColors.set(key, [h, s, v]);
                }
            });
        });

        // Add inline colors to palette
        let importedCount = 1;
        inlineColors.forEach((color) => {
            finalPalette.push({
                id: nextId++,
                h: color[0],
                s: color[1],
                v: color[2],
                name: `Imported ${importedCount++}`
            });
        });

        return { keymaps, leds, palette: finalPalette };


    } catch (e) {
        console.error("Parse error:", e);
        return null;
    }
};
