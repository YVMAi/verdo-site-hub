
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { format } from 'date-fns';

interface TableHeaderProps {
  title: string;
  selectedDate: Date;
  onSave: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ title, selectedDate, onSave }) => {
  return (
    <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <span className="text-sm sm:text-base">{title}</span>
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
