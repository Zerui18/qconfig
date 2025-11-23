# Fix Export Format

## Goal
Update the code generation to produce a "column-stacked" format (Left and Right hands on the same row), remove unnecessary includes, and use the correct LED count constant.

## User Review Required
> [!IMPORTANT]
> The export format will be changed to combine Left and Right hand keys on the same line for each row.
> `#include QMK_KEYBOARD_H` will be removed.
> `DRIVER_LED_TOTAL` will be replaced with `RGB_MATRIX_LED_COUNT`.

## Proposed Changes

### `src/utils/codegen.ts`

#### [MODIFY] [codegen.ts](file:///Users/zeruichen/Desktop/qconfig/src/utils/codegen.ts)
- Remove `#include QMK_KEYBOARD_H`.
- Change `DRIVER_LED_TOTAL` to `RGB_MATRIX_LED_COUNT`.
- Update `formatMatrix` (or the logic calling it) to construct rows by concatenating Left and Right hand segments.
  - Row 1: Indices 0-6 + 36-42
  - Row 2: Indices 7-13 + 43-49
  - Row 3: Indices 14-20 + 50-56
  - Row 4: Indices 21-26 + 57-62
  - Row 5: Indices 27-31 + 63-67
  - Thumb: Indices 32-35 + 68-71

## Verification Plan

### Automated Tests
- None.

### Manual Verification
1.  Open the app.
2.  Click "Code" tab.
3.  Verify the generated code:
    - Does NOT start with `#include QMK_KEYBOARD_H`.
    - Uses `RGB_MATRIX_LED_COUNT` in `ledmap` declaration.
    - `keymaps` and `ledmap` arrays show rows with 14 keys (for first 3 rows), then 12, then 10, then 8 (thumbs), combining Left and Right hands.
