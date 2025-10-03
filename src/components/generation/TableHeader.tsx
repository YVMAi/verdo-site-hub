
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
    <div className="bg-background border-b px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {showViewToggle && onViewModeChange && (
          <div className="border rounded-md p-0.5 flex gap-1">
            <Button
              variant={viewMode === 'form' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('form')}
              className={cn(
                "h-7 px-3 text-xs font-medium",
                viewMode === 'form' 
                  ? "bg-verdo-navy text-white hover:bg-verdo-navy/90" 
                  : "text-muted-foreground hover:text-foreground"
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
                "h-7 px-3 text-xs font-medium",
                viewMode === 'table' 
                  ? "bg-verdo-navy text-white hover:bg-verdo-navy/90" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Table className="h-3 w-3 mr-1" />
              Table
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <span className="text-sm text-muted-foreground">
          {format(selectedDate, 'MMM dd, yyyy')}
        </span>
        <Button 
          onClick={onSave} 
          size="sm" 
          className="bg-verdo-navy text-white hover:bg-verdo-navy/90 gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
};
