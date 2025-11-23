import React from 'react';
import { KeyCap } from './KeyCap';

interface KeyboardHandProps {
    side: 'left' | 'right';
    keycodes: string[]; // Array of 36 keycodes for this hand
    leds: [number, number, number][]; // Array of 36 LED colors
    selectedKeys: number[]; // Global indices of selected keys
    baseIndex: number; // 0 for left, 36 for right
    onKeyClick: (index: number, e: React.MouseEvent) => void;
    onKeyMouseDown: (index: number, e: React.MouseEvent) => void;
    onKeyMouseEnter: (index: number, e: React.MouseEvent) => void;
}

export const KeyboardHand: React.FC<KeyboardHandProps> = ({
    side,
    keycodes,
    leds,
    selectedKeys,
    baseIndex,
    onKeyClick,
    onKeyMouseDown,
    onKeyMouseEnter,
}) => {
    const isLeft = side === 'left';

    // Helper to render a generic row of keys
    const renderRow = (startIndex: number, count: number, className = '') => (
        <div className={`flex gap-1 ${className}`}>
            {Array.from({ length: count }).map((_, i) => {
                const localIndex = startIndex + i;
                const globalIndex = baseIndex + localIndex;
                return (
                    <KeyCap
                        key={globalIndex}
                        index={globalIndex}
                        keycode={keycodes[localIndex] || 'KC_NO'}
                        led={leds[localIndex] || [0, 0, 0]}
                        isSelected={selectedKeys.includes(globalIndex)}
                        onClick={(e) => onKeyClick(globalIndex, e)}
                        onMouseDown={(e) => onKeyMouseDown(globalIndex, e)}
                        onMouseEnter={(e) => onKeyMouseEnter(globalIndex, e)}
                        className="w-12 h-12"
                    />
                );
            })}
        </div>
    );

    // Row definitions based on spec
    // 0-20: Rows 1-3 (7 keys each)
    // 21-26: Row 4 (6 keys)
    // 27-31: Row 5 (5 keys)

    // Thumb Cluster
    // 32: Big Key
    // 33-35: Small Keys

    return (
        <div className={`flex flex-col ${isLeft ? 'items-end' : 'items-start'} gap-1 p-4`}>
            {/* Main Block */}
            <div className={`flex flex-col gap-1 ${isLeft ? 'items-start' : 'items-end'}`}>
                {/* Row 1: Indices 0-6 */}
                {renderRow(0, 7)}
                {/* Row 2: Indices 7-13 */}
                {renderRow(7, 7)}
                {/* Row 3: Indices 14-20 */}
                {renderRow(14, 7)}
                {/* Row 4: Indices 21-26 (6 keys) */}
                {renderRow(21, 6)}
                {/* Row 5: Indices 27-31 (5 keys) */}
                {renderRow(27, 5)}
            </div>

            {/* Thumb Cluster */}
            <div
                className={`
          flex flex-col gap-1 mt-2
          origin-top-${isLeft ? 'right' : 'left'}
        `}
                style={{
                    transform: `rotate(${isLeft ? '12deg' : '-12deg'}) translateX(${isLeft ? '20px' : '-20px'})`,
                }}
            >
                {/* Big Key (Index 32) */}
                <div className="flex">
                    <KeyCap
                        index={baseIndex + 32}
                        keycode={keycodes[32] || 'KC_NO'}
                        led={leds[32] || [0, 0, 0]}
                        isSelected={selectedKeys.includes(baseIndex + 32)}
                        onClick={(e) => onKeyClick(baseIndex + 32, e)}
                        onMouseDown={(e) => onKeyMouseDown(baseIndex + 32, e)}
                        onMouseEnter={(e) => onKeyMouseEnter(baseIndex + 32, e)}
                        className="h-12 w-[9.5rem]" // Approx 3u width
                    />
                </div>

                {/* Small Keys (Indices 33-35) */}
                <div className="flex gap-1 justify-center">
                    {Array.from({ length: 3 }).map((_, i) => {
                        const localIndex = 33 + i;
                        const globalIndex = baseIndex + localIndex;
                        return (
                            <KeyCap
                                key={globalIndex}
                                index={globalIndex}
                                keycode={keycodes[localIndex] || 'KC_NO'}
                                led={leds[localIndex] || [0, 0, 0]}
                                isSelected={selectedKeys.includes(globalIndex)}
                                onClick={(e) => onKeyClick(globalIndex, e)}
                                onMouseDown={(e) => onKeyMouseDown(globalIndex, e)}
                                onMouseEnter={(e) => onKeyMouseEnter(globalIndex, e)}
                                className="w-12 h-12"
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
