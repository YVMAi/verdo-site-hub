
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, LayoutGrid, Table } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TableHeaderProps {
  title: string;
  selectedDate: Date;
  onSave: () => void;
  viewMode?: 'form' | 'table';
  onViewModeChange?: (mode: 'form' | 'table') => void;
  showViewToggle?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ 
  title, 
  selectedDate, 
  onSave, 
  viewMode = 'form',
  onViewModeChange,
  showViewToggle = false
}) => {
  return (
    <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div className="flex items-center gap-4">
        <span className="text-sm sm:text-base">{title}</span>
        {showViewToggle && onViewModeChange && (
          <div className="bg-white/10 rounded p-1 flex">
            <Button
              variant={viewMode === 'form' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('form')}
              className={cn(
                "h-6 px-2 text-xs font-medium transition-colors",
                viewMode === 'form' 
                  ? "bg-white text-verdo-navy hover:bg-white/90" 
                  : "bg-transparent text-white hover:bg-white/10"
              )}
            >
              <LayoutGrid className="h-3 w-3 mr-1" />
              Form
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className={cn(
                "h-6 px-2 text-xs font-medium transition-colors ml-1",
                viewMode === 'table' 
                  ? "bg-white text-verdo-navy hover:bg-white/90" 
                  : "bg-transparent text-white hover:bg-white/10"
              )}
            >
              <Table className="h-3 w-3 mr-1" />
              Table
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <div className="text-xs sm:text-sm text-white/80 order-2 sm:order-1">
          Date: {format(selectedDate, 'MMM dd, yyyy')}
        </div>
        <div className="flex flex-col items-center order-1 sm:order-2">
          <Button 
            onClick={onSave} 
            variant="outline"
            size="sm" 
            className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
          >
            <Save className="h-4 w-4" />
          </Button>
          <span className="text-xs mt-1">Save</span>
        </div>
      </div>
    </div>
  );
};
