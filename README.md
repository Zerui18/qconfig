# Moonlander QMK Configurator

A React-based Single Page Application (SPA) to visually configure the keymap and per-key RGB lighting for the ZSA Moonlander split mechanical keyboard.

## Features

- **Visual Layout**: Accurate rendering of the Moonlander's split layout and thumb clusters.
- **Keymap Editing**: Edit keycodes for each key.
- **RGB Lighting**: Manage a color palette and assign colors to keys.
- **Code Generation**: Real-time generation of `keymap.c` compatible with QMK.
- **Interactions**: Click, Drag Select, and Pan/Zoom support.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Hooks (useState, useRef)

## License

MIT
