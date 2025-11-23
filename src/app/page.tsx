'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { KeyboardHand } from '../components/KeyboardHand';
import { EditorSidebar } from '../components/EditorSidebar';
import { Legend } from '../components/Legend';
import { DEFAULT_KEYMAPS, DEFAULT_LEDS, DEFAULT_PALETTE } from '../utils/defaults';
import { generateCode } from '../utils/codegen';
import { parseConfig } from '../utils/parser';
import { Keymap, LedMap, PaletteItem, Selection } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export default function Home() {
  // State
  const [keymaps, setKeymaps] = useState<Keymap>(DEFAULT_KEYMAPS);
  const [leds, setLeds] = useState<LedMap>(DEFAULT_LEDS);
  const [palette, setPalette] = useState<PaletteItem[]>(DEFAULT_PALETTE);
  const [activeLayer, setActiveLayer] = useState(0);
  const [selection, setSelection] = useState<Selection>([]);

  // Canvas State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Selection Box State
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; layer: number } | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('moonlander_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.keymaps) setKeymaps(parsed.keymaps);
        if (parsed.leds) setLeds(parsed.leds);
        if (parsed.palette) setPalette(parsed.palette);
      } catch (e) {
        console.error('Failed to load config', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('moonlander_config', JSON.stringify({ keymaps, leds, palette }));
  }, [keymaps, leds, palette]);

  // Derived State
  const currentKeycodes = keymaps[activeLayer] || [];
  const currentLeds = leds[activeLayer] || [];
  const generatedCode = generateCode(keymaps, leds, palette);

  // Global Event Listeners (Shift Key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftHeld(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftHeld(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handlers
  const handleAddLayer = () => {
    const layers = Object.keys(keymaps).map(Number);
    const newLayerId = Math.max(...layers) + 1;
    setKeymaps(prev => ({ ...prev, [newLayerId]: Array(72).fill('KC_TRNS') }));
    setLeds(prev => ({ ...prev, [newLayerId]: Array(72).fill([0, 0, 0]) }));
    setActiveLayer(newLayerId);
  };

  const handleLayerContextMenu = (e: React.MouseEvent, layer: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, layer });
  };

  const handleDeleteLayer = () => {
    if (!contextMenu) return;
    const { layer } = contextMenu;

    // Prevent deleting the last layer
    if (Object.keys(keymaps).length <= 1) {
      setContextMenu(null);
      return;
    }

    const newKeymaps = { ...keymaps };
    delete newKeymaps[layer];
    const newLeds = { ...leds };
    delete newLeds[layer];

    setKeymaps(newKeymaps);
    setLeds(newLeds);

    if (activeLayer === layer) {
      setActiveLayer(Number(Object.keys(newKeymaps)[0]));
    }
    setContextMenu(null);
  };

  const handleKeycodeChange = (newCode: string) => {
    if (selection.length === 0) return;

    // Only update the first selected key for text input
    // (Spec says: "Text input field updates the QMK code for the first selected key")
    const firstIndex = selection[0];
    const newKeymaps = { ...keymaps };
    newKeymaps[activeLayer] = [...(newKeymaps[activeLayer] || [])];
    newKeymaps[activeLayer][firstIndex] = newCode;
    setKeymaps(newKeymaps);
  };

  const handlePaletteUpdate = (newPalette: PaletteItem[]) => {
    setPalette(newPalette);
  };

  const handleColorApply = (color: [number, number, number]) => {
    if (selection.length === 0) return;

    const newLeds = { ...leds };
    newLeds[activeLayer] = [...(newLeds[activeLayer] || [])];

    selection.forEach((index) => {
      newLeds[activeLayer][index] = color;
    });

    setLeds(newLeds);
  };

  const handleImportConfig = (code: string) => {
    const result = parseConfig(code);
    if (result) {
      setKeymaps(result.keymaps);
      setLeds(result.leds);
      setPalette(result.palette);
    } else {
      alert('Failed to parse configuration. Please ensure it contains valid keymaps and ledmap definitions.');
    }
  };

  // Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else {
      // Start selection box if clicking on background
      // (Key clicks are handled by KeyCap propagation stop or separate handler)
      // Actually KeyCap onClick will fire, but we need to handle background click to clear selection or start box
      if ((e.target as HTMLElement).closest('.keycap-container')) return;

      setIsSelecting(true);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setSelectionStart({ x, y });
        setSelectionEnd({ x, y });
        if (!e.ctrlKey && !e.metaKey) {
          setSelection([]); // Clear selection if not adding
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else if (isSelecting) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setSelectionEnd({ x, y });
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);

    if (isSelecting) {
      setIsSelecting(false);
      // Calculate intersection
      if (containerRef.current) {
        const selectRect = {
          left: Math.min(selectionStart.x, selectionEnd.x),
          top: Math.min(selectionStart.y, selectionEnd.y),
          right: Math.max(selectionStart.x, selectionEnd.x),
          bottom: Math.max(selectionStart.y, selectionEnd.y),
        };

        // If box is very small, treat as click (clear selection)
        if (Math.abs(selectRect.right - selectRect.left) < 5 && Math.abs(selectRect.bottom - selectRect.top) < 5) {
          // Clicked on background -> clear selection
          // (Already cleared in MouseDown if not modifier)
        } else {
          // Find intersecting keys
          const keys = containerRef.current.querySelectorAll('.keycap-container'); // We need to add this class to KeyCap wrapper
          const newSelection = new Set(selection);

          keys.forEach((key) => {
            const keyRect = key.getBoundingClientRect();
            const containerRect = containerRef.current!.getBoundingClientRect();

            // Convert keyRect to container relative
            const keyLeft = keyRect.left - containerRect.left;
            const keyTop = keyRect.top - containerRect.top;
            const keyRight = keyLeft + keyRect.width;
            const keyBottom = keyTop + keyRect.height;

            // Check intersection
            if (
              keyLeft < selectRect.right &&
              keyRight > selectRect.left &&
              keyTop < selectRect.bottom &&
              keyBottom > selectRect.top
            ) {
              const index = parseInt(key.getAttribute('data-index') || '-1');
              if (index !== -1) newSelection.add(index);
            }
          });
          setSelection(Array.from(newSelection));
        }
      }
    }
  };

  const handleKeyClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent background click

    if (e.ctrlKey || e.metaKey) {
      // Toggle
      if (selection.includes(index)) {
        setSelection(selection.filter((i) => i !== index));
      } else {
        setSelection([...selection, index]);
      }
    } else {
      // Single select
      setSelection([index]);
    }
  };

  return (
    <main className="flex h-screen bg-gray-950 overflow-hidden" onMouseUp={handleMouseUp}>
      {/* Canvas Area */}
      <div
        ref={containerRef}
        className={`flex-1 relative overflow-hidden cursor-${isPanning ? 'grabbing' : isShiftHeld ? 'grab' : 'default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />

        {/* Keyboard Container with Pan/Zoom */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out origin-center"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <div className="flex gap-16">
            {/* Left Hand */}
            <div className="keycap-group">
              <KeyboardHand
                side="left"
                keycodes={currentKeycodes.slice(0, 36)}
                leds={currentLeds.slice(0, 36)}
                selectedKeys={selection}
                baseIndex={0}
                onKeyClick={handleKeyClick}
                onKeyMouseDown={() => { }} // Handled by click for now
                onKeyMouseEnter={() => { }}
              />
            </div>

            {/* Right Hand */}
            <div className="keycap-group">
              <KeyboardHand
                side="right"
                keycodes={currentKeycodes.slice(36, 72)}
                leds={currentLeds.slice(36, 72)}
                selectedKeys={selection}
                baseIndex={36}
                onKeyClick={handleKeyClick}
                onKeyMouseDown={() => { }}
                onKeyMouseEnter={() => { }}
              />
            </div>
          </div>
        </div>

        {/* Selection Box Overlay */}
        {isSelecting && (
          <div
            className="absolute border border-purple-500 bg-purple-500/20 pointer-events-none"
            style={{
              left: Math.min(selectionStart.x, selectionEnd.x),
              top: Math.min(selectionStart.y, selectionEnd.y),
              width: Math.abs(selectionEnd.x - selectionStart.x),
              height: Math.abs(selectionEnd.y - selectionStart.y),
            }}
          />
        )}

        {/* Layer Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 bg-gray-900 p-2 rounded-full border border-gray-800 items-center">
          {Object.keys(keymaps).map(Number).sort((a, b) => a - b).map((l) => (
            <button
              key={l}
              onClick={() => setActiveLayer(l)}
              onContextMenu={(e) => handleLayerContextMenu(e, l)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${activeLayer === l ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                }`}
            >
              {l}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-700 mx-1" />
          <button
            onClick={handleAddLayer}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            title="Add Layer"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[120px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={handleDeleteLayer}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete Layer
            </button>
          </div>
        )}

        {/* Click outside to close context menu */}
        {contextMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
          />
        )}

        {/* Legend */}
        <Legend />
      </div>

      {/* Sidebar */}
      <EditorSidebar
        selection={selection}
        keycodes={currentKeycodes}
        onKeycodeChange={handleKeycodeChange}
        palette={palette}
        onPaletteUpdate={handlePaletteUpdate}
        onColorApply={handleColorApply}
        generatedCode={generatedCode}
        onImportConfig={handleImportConfig}
      />
    </main >
  );
}
