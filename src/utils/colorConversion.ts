// HSV to RGB conversion
// QMK uses HSV format with H, S, V in range 0-255
export const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
    // Normalize to 0-1 range
    const hNorm = h / 255;
    const sNorm = s / 255;
    const vNorm = v / 255;

    const c = vNorm * sNorm;
    const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1));
    const m = vNorm - c;

    let r = 0, g = 0, b = 0;
    const hSector = hNorm * 6;

    if (hSector < 1) {
        r = c; g = x; b = 0;
    } else if (hSector < 2) {
        r = x; g = c; b = 0;
    } else if (hSector < 3) {
        r = 0; g = c; b = x;
    } else if (hSector < 4) {
        r = 0; g = x; b = c;
    } else if (hSector < 5) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }

    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];
};

// RGB to HSV conversion
export const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
    // Normalize to 0-1 range
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const v = max;

    if (delta !== 0) {
        s = delta / max;

        if (max === rNorm) {
            h = ((gNorm - bNorm) / delta) % 6;
        } else if (max === gNorm) {
            h = (bNorm - rNorm) / delta + 2;
        } else {
            h = (rNorm - gNorm) / delta + 4;
        }

        h = h / 6;
        if (h < 0) h += 1;
    }

    return [
        Math.round(h * 255),
        Math.round(s * 255),
        Math.round(v * 255)
    ];
};
