import React from 'react';
import { getKeyType, formatKeycode } from '../utils/keycodes';
import { hsvToRgb } from '../utils/colorConversion';

interface KeyCapProps {
    index: number;
    keycode: string;
    led: [number, number, number];
    isSelected: boolean;
    onClick: (e: React.MouseEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseEnter: (e: React.MouseEvent) => void;
    className?: string;
    style?: React.CSSProperties;
}

export const KeyCap: React.FC<KeyCapProps> = ({
    index,
    keycode,
    led,
    isSelected,
    onClick,
    onMouseDown,
    onMouseEnter,
    className = '',
    style = {},
}) => {
    const type = getKeyType(keycode);
    const [h, s, v] = led;
    const [r, g, b] = hsvToRgb(h, s, v);

    // Determine background color based on type
    let bgClass = 'bg-gray-800';
    let textClass = 'text-gray-300';
    let opacityClass = 'opacity-100';

    switch (type) {
        case 'transparent':
            bgClass = 'bg-gray-900';
            textClass = 'text-transparent';
            opacityClass = 'opacity-40';
            break;
        case 'layer':
            bgClass = 'bg-orange-900/50';
            textClass = 'text-orange-200';
            break;
        case 'modifier':
            bgClass = 'bg-blue-900/50';
            textClass = 'text-blue-200';
            break;
        case 'system':
            bgClass = 'bg-red-900/50';
            textClass = 'text-red-200';
            break;
        case 'special':
            bgClass = 'bg-yellow-900/50';
            textClass = 'text-yellow-200';
            break;
        case 'alpha':
        default:
            bgClass = 'bg-gray-800';
            textClass = 'text-gray-200';
            break;
    }

    // Border color from LED
    // If LED is black (0,0,0), use a subtle border. Otherwise use the LED color.
    const isLedActive = r > 0 || g > 0 || b > 0;
    const borderColor = isLedActive ? `rgb(${r},${g},${b})` : 'transparent';
    const boxShadow = isLedActive ? `0 0 8px rgba(${r},${g},${b}, 0.5)` : 'none';

    // Selection style
    const selectionClass = isSelected ? 'ring-2 ring-purple-500 z-10' : '';

    return (
        <div
            data-index={index}
            className={`
        keycap-container
        relative flex items-center justify-center
        rounded-md border-2 transition-all duration-75 select-none
        cursor-pointer hover:brightness-110
        ${bgClass} ${textClass} ${opacityClass} ${selectionClass} ${className}
      `}
            style={{
                borderColor: isSelected ? undefined : borderColor,
                boxShadow: isSelected ? undefined : boxShadow,
                ...style,
            }}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
        >
            <span className="text-xs font-mono font-bold text-center break-all px-1 leading-tight whitespace-pre-line">
                {type === 'transparent' ? '' : formatKeycode(keycode)}
            </span>
        </div>
    );
};
