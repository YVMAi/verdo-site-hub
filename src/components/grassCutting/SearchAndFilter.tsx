
import React from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onClearSearch: () => void;
  selectedMonths?: string[];
  onMonthsChange?: (months: string[]) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  onClearSearch,
  selectedMonths = [],
  onMonthsChange
}) => {
  const handleMonthToggle = (month: string) => {
    if (!onMonthsChange) return;
    
    if (selectedMonths.includes(month)) {
      onMonthsChange(selectedMonths.filter(m => m !== month));
    } else {
      onMonthsChange([...selectedMonths, month]);
    }
  };

  const clearMonths = () => {
    if (onMonthsChange) {
      onMonthsChange([]);
    }
  };

  const getFilterChips = () => {
    const chips = [];
    if (searchTerm) {
      chips.push({
        label: `Search: "${searchTerm}"`,
        onRemove: onClearSearch
      });
    }
    if (dateFilter !== 'all') {
      chips.push({
        label: `Date: ${dateFilter}`,
        onRemove: () => onDateFilterChange('all')
      });
    }
    if (selectedMonths.length > 0) {
      chips.push({
        label: `Months: ${selectedMonths.join(', ')}`,
        onRemove: clearMonths
      });
    }
    return chips;
  };

  const filterChips = getFilterChips();

  return (
    <div className="px-3 py-2 bg-gray-50 border-b space-y-2">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
          <Input
            placeholder="Search by date, block, inverter, remarks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSearch}
              className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-gray-200"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={dateFilter} onValueChange={onDateFilterChange}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          
          {onMonthsChange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Calendar className="w-4 h-4 mr-1" />
                  Months {selectedMonths.length > 0 && `(${selectedMonths.length})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Select Months</h4>
                    {selectedMonths.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearMonths}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {MONTHS.map((month) => (
                      <div key={month} className="flex items-center space-x-2">
                        <Checkbox
                          id={month}
                          checked={selectedMonths.includes(month)}
                          onCheckedChange={() => handleMonthToggle(month)}
                        />
                        <label
                          htmlFor={month}
                          className="text-xs font-normal cursor-pointer"
                        >
                          {month.substring(0, 3)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      
      {/* Filter Chips */}
      {filterChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterChips.map((chip, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>{chip.label}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={chip.onRemove}
                className="h-4 w-4 p-0 hover:bg-blue-200 rounded-full"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Compact Legend */}
      <div className="text-xs flex gap-4">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300"></div>
          Status
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border border-green-300"></div>
          Calculated
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300"></div>
          Input (Click to Edit)
        </span>
      </div>
    </div>
  );
};
