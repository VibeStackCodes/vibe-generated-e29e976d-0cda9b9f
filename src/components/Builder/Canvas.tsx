import React, { useCallback } from 'react';
import type { Token } from '@/types';
import { cn } from '@/lib/utils';

interface CanvasProps {
  tokens: Token[];
  onRemoveLast: () => void;
  onClear: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({ tokens, onRemoveLast, onClear }) => {
  const expression = tokens.map(t => t.value).join(' ');

  return (
    <div className="bg-white/5 p-4 rounded-md min-h-[120px] flex flex-col">
      <div className="flex-1 text-sm text-gray-100 whitespace-pre-wrap break-words" aria-label="Expression">
        {expression || 'Your expression will appear here'}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-300">Tokens: {tokens.length}</span>
        <div className="flex gap-2">
          <button onClick={onRemoveLast} className={cn('px-3 py-1 rounded bg-accent text-white')}>Backspace</button>
          <button onClick={onClear} className={cn('px-3 py-1 rounded bg-gray-700 text-white')}>Clear</button>
        </div>
      </div>
    </div>
  );
};
