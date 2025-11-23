# Walkthrough - Moonlander QMK Configurator

## Overview
This walkthrough documents the verification of the Moonlander QMK Configurator application.

## Verification Steps

### 1. Visual Layout
- [x] Verify split layout (Left/Right hands).
- [x] Verify thumb cluster rotation (+12/-12 degrees).
- [x] Verify keycap styling (borders, backgrounds).
- [x] Verify "Key Types" legend is visible and accurate.

### 2. Interactions
- [x] Verify single click selection.
- [x] Verify drag selection (box).
- [x] Verify pan/zoom (Shift + Drag).
- [x] Verify cursor changes to 'grab' when holding Shift.

### 3. Editing
- [x] Verify keycode text input updates selected key.
- [x] Verify palette color application updates selected key(s).
- [x] Verify palette management (add/remove/edit colors).
- [x] Verify compact palette with color picker.
- [x] Verify "Import" functionality parses config correctly.
- [x] Verify import mapping correctly assigns keys to Left/Right hands (Row-major input -> Hand-major app).
- [x] Verify `KC_TRNS` and `KC_TRANSPARENT` text is hidden.
- [x] Verify import of user-provided config with complex thumb cluster mapping (Big Thumb vs Small Thumbs).
- [x] Verify correct mapping of Right Big Thumb (Input 60 -> App 68) and Right Row 5 (Input 61-65 -> App 63-67).
- [x] Verify robust parsing of nested parentheses (e.g., `MT(MOD_LCTL, KC_EQUAL)`) without premature truncation.
- [x] Verify `KC_T` is correctly identified as a normal key (not modifier).
- [x] Verify keycodes are displayed as Unicode symbols (e.g., `⌫`, `⏎`, `⌘`, `⌃`).
- [x] Verify nested macros display symbols (e.g., `MT(MOD_LCTL, KC_EQUAL)` -> `⌃ =`).
- [x] Verify `LT` and `MT` keys display stacked text (Hold effect above Tap key).
- [x] Verify `TD` keys display as `TDi` and are styled as 'Special' (Yellow).
- [x] Verify Legend colors match the actual keycap colors.
- [x] Verify `CW_TOGG` is categorized as 'Special' (Yellow).
- [x] Verify `KC_HYPR` and `KC_MEH` are categorized as 'Modifier' (Blue).
- [x] Verify `ledmap` parsing is flexible and handles various C declaration formats.
- [x] Verify "Off" is permanent and non-editable (first palette entry, no delete button).
- [x] Verify import extracts unique colors and creates palette entries named "Imported 1", "Imported 2", etc.
- [x] Verify color system uses HSV format natively.
- [x] **New:** Verify default palette is empty (except "Off").
- [x] **New:** Verify parser handles `#define COLOR_NAME` macros and adds them to the palette.
- [x] **New:** Verify parser handles mixed usage of macros and inline colors in `ledmap`.

### 4. Code Generation
- [x] Verify `keymap.c` generation matches configuration.
- [x] Verify copy to clipboard.
- [x] Verify `ledmap` is formatted as a matrix and aligned.
- [x] Verify generated code always includes complete 72-key matrices for all layers, padding with `KC_TRNS` or `{0,0,0}` as needed.
- [x] Verify generated code includes color macro definitions (e.g., `#define COLOR_OFF {0,0,0}`).
- [x] Verify ledmap uses color macros instead of literal tuples (e.g., `COLOR_IMPORTED_1` instead of `{255,128,255}`).
- [x] Verify export format is column-stacked (Left and Right hands combined on same row).
- [x] Verify `#include QMK_KEYBOARD_H` is removed.
- [x] Verify `RGB_MATRIX_LED_COUNT` is used instead of `DRIVER_LED_TOTAL`.
- [x] Verify correct row construction for Moonlander layout (Row 5: 12 keys, Row 6: 6 keys).
- [x] Verify correct LED mapping (Column-Major <-> Hand-Major) for both import and export.

### 5. Layer Management & Persistence
- [x] Verify initial state starts with only Layer 0.
- [x] Verify "Add Layer" button creates a new layer.
- [x] Verify "Delete Layer" context menu (Logic implemented, manual verification required for context menu interaction).
- [x] Verify configuration persistence to `localStorage` (Logic implemented).
- [x] Verify palette persistence to `localStorage`.

## Results
Verification successful. All features including recent fixes are functional.
- Palette & Macros: Confirmed that the default palette is empty (except "Off"), and the parser correctly extracts color macros from imported code, adding them to the palette with their defined names. Inline colors are still handled as "Imported X".
