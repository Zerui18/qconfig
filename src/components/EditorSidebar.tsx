import React, { useState, useRef, useEffect } from 'react';
import { PaletteItem, Selection } from '../types';
import { Trash2, Copy, Plus, Check, Upload, X } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { hsvToRgb, rgbToHsv } from '../utils/colorConversion';

interface EditorSidebarProps {
    selection: Selection;
    keycodes: string[]; // Current layer keycodes
    onKeycodeChange: (newCode: string) => void;
    palette: PaletteItem[];
    onPaletteUpdate: (newPalette: PaletteItem[]) => void;
    onColorApply: (color: [number, number, number]) => void;
    generatedCode: string;
    onImportConfig: (code: string) => void;
    onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

// Helper to convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Helper to convert Hex to RGB
const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [0, 0, 0];
};

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
    selection,
    keycodes,
    onKeycodeChange,
    palette,
    onPaletteUpdate,
    onColorApply,
    generatedCode,
    onImportConfig,
    onShowToast,
}) => {
    const [activeTab, setActiveTab] = useState<'edit' | 'code' | 'import'>('edit');
    const [activeColorId, setActiveColorId] = useState<number | null>(null);
    const [importText, setImportText] = useState('');
    const pickerRef = useRef<HTMLDivElement>(null);

    // Derived state for keycode input to prevent glitch
    // We use a local state that syncs with props but handles the "undefined" case gracefully
    const [localKeycode, setLocalKeycode] = useState('');

    useEffect(() => {
        if (selection.length === 1) {
            setLocalKeycode(keycodes[selection[0]] || '');
        } else {
            setLocalKeycode('');
        }
    }, [selection, keycodes]);

    const isMultiSelect = selection.length > 1;

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setActiveColorId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleColorChange = (id: number, newHex: string) => {
        const [r, g, b] = hexToRgb(newHex);
        const [h, s, v] = rgbToHsv(r, g, b);
        const newPalette = palette.map((p) => {
            if (p.id === id) {
                return { ...p, h, s, v };
            }
            return p;
        });
        onPaletteUpdate(newPalette);
    };

    const handleNameChange = (id: number, name: string) => {
        const newPalette = palette.map((p) => {
            if (p.id === id) {
                return { ...p, name };
            }
            return p;
        });
        onPaletteUpdate(newPalette);
    };

    const handleAddColor = () => {
        const newId = Math.max(...palette.map((p) => p.id), 0) + 1;
        onPaletteUpdate([...palette, { id: newId, h: 0, s: 0, v: 255, name: 'New Color' }]);
    };

    const handleRemoveColor = (id: number) => {
        // Prevent removing the first entry (Off)
        if (id === 1) return;
        onPaletteUpdate(palette.filter((p) => p.id !== id));
    };

    const handleApplyColor = (p: PaletteItem) => {
        onColorApply([p.h, p.s, p.v]);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        onShowToast('Code copied to clipboard!', 'success');
    };

    const handleImport = () => {
        onImportConfig(importText);
        setImportText('');
        setActiveTab('edit');
        onShowToast('Configuration imported!', 'success');
    };

    return (
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-screen text-gray-300 shadow-xl z-20">
            <div className="flex border-b border-gray-800">
                <button
                    className={`flex-1 p-3 font-bold text-sm uppercase tracking-wider ${activeTab === 'edit' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-500' : 'hover:bg-gray-800/50 text-gray-500'}`}
                    onClick={() => setActiveTab('edit')}
                >
                    Edit
                </button>
                <button
                    className={`flex-1 p-3 font-bold text-sm uppercase tracking-wider ${activeTab === 'code' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-500' : 'hover:bg-gray-800/50 text-gray-500'}`}
                    onClick={() => setActiveTab('code')}
                >
                    Code
                </button>
                <button
                    className={`flex-1 p-3 font-bold text-sm uppercase tracking-wider ${activeTab === 'import' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-500' : 'hover:bg-gray-800/50 text-gray-500'}`}
                    onClick={() => setActiveTab('import')}
                >
                    Import
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'edit' && (
                    <div className="space-y-6">
                        {/* Keycode Editor */}
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-800">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Keycode</h3>
                            {selection.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">Select a key to edit</p>
                            ) : isMultiSelect ? (
                                <p className="text-sm text-gray-500 italic">Multiple keys selected</p>
                            ) : (
                                <input
                                    type="text"
                                    value={localKeycode}
                                    onChange={(e) => {
                                        setLocalKeycode(e.target.value);
                                        onKeycodeChange(e.target.value);
                                    }}
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="KC_..."
                                />
                            )}
                        </div>

                        {/* Palette */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Palette</h3>
                                <button
                                    onClick={handleAddColor}
                                    className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                                    title="Add new color"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {palette.map((p) => {
                                    const isPermanent = p.id === 1; // Off color is permanent
                                    return (
                                        <div key={p.id} className="bg-gray-800/50 p-2 rounded-lg border border-gray-800 flex items-center gap-3 relative group">
                                            {/* Color Swatch / Picker Trigger */}
                                            <div className="relative">
                                                <div
                                                    className={`w-8 h-8 rounded border border-gray-600 shadow-sm ${isPermanent
                                                        ? 'cursor-not-allowed opacity-75'
                                                        : 'cursor-pointer hover:border-white transition-all'
                                                        }`}
                                                    style={{ backgroundColor: `rgb(${hsvToRgb(p.h, p.s, p.v).join(',')})` }}
                                                    onClick={() => !isPermanent && setActiveColorId(activeColorId === p.id ? null : p.id)}
                                                />

                                                {/* Popover Color Picker */}
                                                {activeColorId === p.id && !isPermanent && (
                                                    <div
                                                        ref={pickerRef}
                                                        className="absolute top-10 left-0 z-50 bg-gray-900 p-2 rounded-lg border border-gray-700 shadow-2xl"
                                                    >
                                                        <HexColorPicker
                                                            color={rgbToHex(...hsvToRgb(p.h, p.s, p.v))}
                                                            onChange={(hex) => handleColorChange(p.id, hex)}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Name Input */}
                                            <input
                                                type="text"
                                                value={p.name}
                                                onChange={(e) => !isPermanent && handleNameChange(p.id, e.target.value)}
                                                disabled={isPermanent}
                                                className={`flex-1 bg-transparent text-sm border-none focus:ring-0 p-0 text-gray-300 placeholder-gray-600 ${isPermanent ? 'cursor-not-allowed opacity-75' : 'focus:text-white'
                                                    }`}
                                                placeholder="Color Name"
                                            />

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleApplyColor(p)}
                                                    className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded transition-colors"
                                                    title="Assign to selected keys"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                {!isPermanent && (
                                                    <button
                                                        onClick={() => handleRemoveColor(p.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                                                        title="Delete color"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'code' && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">keymap.c</h3>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard();
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition-colors"
                            >
                                <Copy size={14} />
                                Copy
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={generatedCode}
                            className="flex-1 w-full bg-gray-950 text-[10px] leading-relaxed font-mono p-3 rounded-lg border border-gray-800 resize-none focus:outline-none text-gray-400 custom-scrollbar whitespace-pre"
                        />
                    </div>
                )}

                {activeTab === 'import' && (
                    <div className="h-full flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Import Config</h3>
                            <p className="text-xs text-gray-400 mb-3">
                                Paste your existing <code>keymap.c</code> code below. The app will attempt to parse <code>keymaps</code> and <code>ledmap</code> arrays.
                            </p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleImport();
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors"
                            >
                                <Upload size={16} />
                                Parse & Apply
                            </button>
                        </div>
                        <textarea
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="// Paste your keymap.c content here..."
                            className="flex-1 w-full bg-gray-950 text-xs font-mono p-3 rounded-lg border border-gray-800 resize-none focus:outline-none focus:border-purple-500 transition-colors text-gray-300 custom-scrollbar"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
