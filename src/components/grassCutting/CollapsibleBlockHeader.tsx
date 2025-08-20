
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollapsibleBlockHeaderProps {
  blockName: string;
  blockId: string;
  inverterCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const CollapsibleBlockHeader: React.FC<CollapsibleBlockHeaderProps> = ({
  blockName,
  blockId,
  inverterCount,
  isExpanded,
  onToggle
}) => {
  return (
    <th 
      className="px-2 py-1 text-center font-medium border border-gray-300 bg-blue-900 text-white relative" 
      colSpan={isExpanded ? inverterCount : 1}
    >
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-4 w-4 p-0 hover:bg-blue-800 text-white"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </Button>
        <span className="text-xs">
          {blockName} {!isExpanded && `(${inverterCount})`}
        </span>
      </div>
    </th>
  );
};
