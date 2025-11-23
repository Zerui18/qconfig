import React from 'react';

export const Legend: React.FC = () => {
  const items = [
    { label: 'Normal', color: 'bg-gray-800' },
    { label: 'Modifier', color: 'bg-blue-900/50' },
    { label: 'Layer', color: 'bg-orange-900/50' },
    { label: 'Special', color: 'bg-purple-900/50' },
    { label: 'Transparent', color: 'bg-gray-800 opacity-40' },
  ];

  return (
    <div className="absolute bottom-8 right-8 bg-gray-900/90 p-4 rounded-lg border border-gray-800 backdrop-blur-sm">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Key Types</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded ${item.color}`} />
            <span className="text-xs text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
