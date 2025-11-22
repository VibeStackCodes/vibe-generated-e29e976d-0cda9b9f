import React from 'react';
import type { Token } from '@/types';

type PaletteItem = { id: string; type: 'number' | 'operator' | 'paren' | 'memory'; value: string };

interface PaletteProps {
  onAdd: (item: PaletteItem) => void;
}

const ITEMS: PaletteItem[] = [
  { id: 'n0', type: 'number', value: '0' },
  { id: 'n1', type: 'number', value: '1' },
  { id: 'n2', type: 'number', value: '2' },
  { id: 'n3', type: 'number', value: '3' },
  { id: 'n4', type: 'number', value: '4' },
  { id: 'n5', type: 'number', value: '5' },
  { id: 'n6', type: 'number', value: '6' },
  { id: 'n7', type: 'number', value: '7' },
  { id: 'n8', type: 'number', value: '8' },
  { id: 'n9', type: 'number', value: '9' },
  { id: 'op+', type: 'operator' , value: '+' },
  { id: 'op-', type: 'operator' , value: '-' },
  { id: 'op*', type: 'operator' , value: '*' },
  { id: 'op/', type: 'operator' , value: '/' },
  { id: 'lp', type: 'paren' , value: '(' },
  { id: 'rp', type: 'paren' , value: ')' },
  { id: 'mem', type: 'memory' , value: 'M' }
];

export const Palette: React.FC<PaletteProps> = ({ onAdd }) => {
  return (
    <div className="space-y-2 p-2 bg-white/5 rounded-md w-full" aria-label="Palette">
      <div className="text-sm font-semibold text-accent">Palette</div>
      <div className="grid grid-cols-4 gap-2">
        {ITEMS.map(it => (
          <button
            key={it.id}
            className="p-2 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm"
            onClick={() => onAdd({ id: it.id, type: it.type, value: it.value })}
            title={`${it.type}: ${it.value}`}
          >
            {it.value}
          </button>
        ))}
      </div>
    </div>
  );
};
