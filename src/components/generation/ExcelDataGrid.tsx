
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Lock, ArrowUpDown, Copy, FileSpreadsheet, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site, GenerationData } from '@/types/generation';
import { useToast } from '@/hooks/use-toast';

interface ExcelDataGridProps {
  site: Site;
  data?: GenerationData[];
  isEditable?: boolean;
  allowedEditDays?: number;
  onSave?: (data: any) => void;
  onExport?: (format: 'csv' | 'xlsx') => void;
  showDatePicker?: boolean;
  className?: string;
}

export const ExcelDataGrid: React.FC<ExcelDataGridProps> = ({
  site,
  data = [],
  isEditable = true,
  allowedEditDays = 30,
  onSave,
  onExport,
  showDatePicker = false,
  className
}) => {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [cellValues, setCellValues] = useState<Record<string, any>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const gridRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Calculate totals for numeric columns
  const calculateTotals = useCallback(() => {
    const totals: Record<string, { min: number; max: number; avg: number; sum: number }> = {};
    
    site.columns.forEach(column => {
      if (column.type === 'number' && column.id !== 'date') {
        const values = data.map(item => Number(item.values[column.id]) || 0).filter(v => !isNaN(v));
        if (values.length > 0) {
          totals[column.id] = {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            sum: values.reduce((a, b) => a + b, 0)
          };
        }
      }
    });
    
    return totals;
  }, [data, site.columns]);

  const totals = calculateTotals();

  const handleCellClick = (rowId: string, columnId: string) => {
    const cellKey = `${rowId}-${columnId}`;
    setSelectedCells(new Set([cellKey]));
    setEditingCell(null);
  };

  const handleCellDoubleClick = (rowId: string, columnId: string) => {
    const cellKey = `${rowId}-${columnId}`;
    if (isEditable) {
      setEditingCell(cellKey);
      setSelectedCells(new Set([cellKey]));
    }
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, rowId: string, columnId: string) => {
    const cellKey = `${rowId}-${columnId}`;
    
    switch (e.key) {
      case 'Enter':
        if (editingCell === cellKey) {
          setEditingCell(null);
          // Move to next row
          const currentRowIndex = data.findIndex(item => item.id === rowId);
          if (currentRowIndex < data.length - 1) {
            const nextRowKey = `${data[currentRowIndex + 1].id}-${columnId}`;
            setSelectedCells(new Set([nextRowKey]));
          }
        } else if (isEditable) {
          setEditingCell(cellKey);
        }
        e.preventDefault();
        break;
      case 'Escape':
        setEditingCell(null);
        e.preventDefault();
        break;
      case 'Tab':
        if (editingCell === cellKey) {
          setEditingCell(null);
        }
        // Move to next/previous column
        const currentColIndex = site.columns.findIndex(col => col.id === columnId);
        const nextColIndex = e.shiftKey ? currentColIndex - 1 : currentColIndex + 1;
        if (nextColIndex >= 0 && nextColIndex < site.columns.length) {
          const nextColumnKey = `${rowId}-${site.columns[nextColIndex].id}`;
          setSelectedCells(new Set([nextColumnKey]));
        }
        e.preventDefault();
        break;
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim());
    
    if (rows.length > 0) {
      const values = rows[0].split('\t');
      const newCellValues: Record<string, any> = {};
      
      site.columns.forEach((column, index) => {
        if (values[index] && column.id !== 'date') {
          const cellKey = showDatePicker ? `new-${column.id}` : `${data[0]?.id || 'new'}-${column.id}`;
          newCellValues[cellKey] = values[index];
        }
      });
      
      setCellValues(prev => ({ ...prev, ...newCellValues }));
      
      toast({
        title: "Data Pasted",
        description: `Pasted ${rows.length} row(s) from clipboard`,
      });
    }
  }, [site.columns, data, showDatePicker, toast]);

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleSave = () => {
    if (onSave) {
      const saveData = showDatePicker 
        ? { date: format(selectedDate, 'yyyy-MM-dd'), values: cellValues }
        : cellValues;
      onSave(saveData);
      setCellValues({});
      toast({
        title: "Saved",
        description: "Data has been saved successfully",
      });
    }
  };

  const isLocked = (date: string) => {
    const daysDiff = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > allowedEditDays;
  };

  // Filter and sort data
  const processedData = data
    .filter(item => {
      return Object.entries(filters).every(([columnId, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = String(item.values[columnId] || '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      });
    })
    .sort((a, b) => {
      const aValue = a.values[sortColumn] || a[sortColumn as keyof GenerationData];
      const bValue = b.values[sortColumn] || b[sortColumn as keyof GenerationData];
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

  return (
    <div 
      className={cn("bg-white border border-gray-300 rounded-none", className)}
      onPaste={handlePaste}
      tabIndex={0}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-300">
        <div className="flex items-center gap-2">
          {showDatePicker && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(selectedDate, 'MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}
          
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              placeholder="Find..."
              className="h-8 w-32 pl-7 text-xs"
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  const newFilters: Record<string, string> = {};
                  site.columns.forEach(col => {
                    newFilters[col.id] = value;
                  });
                  setFilters(newFilters);
                } else {
                  setFilters({});
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {Object.keys(cellValues).length > 0 && (
            <Button onClick={handleSave} size="sm" className="h-8">
              Save
            </Button>
          )}
          
          {onExport && (
            <>
              <Button 
                onClick={() => onExport('csv')} 
                variant="outline" 
                size="sm" 
                className="h-8"
              >
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                CSV
              </Button>
              <Button 
                onClick={() => onExport('xlsx')} 
                variant="outline" 
                size="sm" 
                className="h-8"
              >
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                XLSX
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Excel Grid */}
      <div className="overflow-auto max-h-96" ref={gridRef}>
        <table className="w-full border-collapse" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {/* Header */}
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              {site.columns.map((column, index) => (
                <th
                  key={column.id}
                  className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 min-w-[120px] h-10"
                  style={{ width: columnWidths[column.id] || 120 }}
                  onClick={() => handleSort(column.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">
                      {column.name}
                      {column.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    <div className="flex items-center">
                      {column.id === 'totalGeneration' && (
                        <span className="text-gray-400 text-xs mr-1">fx</span>
                      )}
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
            
            {/* Filter Row */}
            <tr className="bg-gray-50">
              {site.columns.map((column) => (
                <td key={column.id} className="border border-gray-300 px-1 py-1">
                  <Input
                    placeholder="Filter..."
                    value={filters[column.id] || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, [column.id]: e.target.value }))}
                    className="h-6 text-xs border-0 bg-transparent focus:bg-white focus:border focus:border-blue-500"
                  />
                </td>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {showDatePicker ? (
              // New data entry row
              <tr className="hover:bg-blue-50">
                {site.columns.map((column) => {
                  const cellKey = `new-${column.id}`;
                  const isSelected = selectedCells.has(cellKey);
                  const isEditing = editingCell === cellKey;
                  const cellValue = cellValues[cellKey] || '';

                  return (
                    <td
                      key={column.id}
                      className={cn(
                        "border border-gray-300 px-2 py-1 h-10 cursor-cell",
                        isSelected && "ring-2 ring-blue-500 ring-inset",
                        column.type === 'number' ? "text-right" : column.id === 'date' ? "text-center" : "text-left"
                      )}
                      onClick={() => handleCellClick('new', column.id)}
                      onDoubleClick={() => handleCellDoubleClick('new', column.id)}
                      onKeyDown={(e) => handleCellKeyDown(e, 'new', column.id)}
                      tabIndex={0}
                    >
                      {column.id === 'date' ? (
                        <div className="text-sm py-1 px-2 bg-gray-100 rounded text-center">
                          {format(selectedDate, 'yyyy-MM-dd')}
                        </div>
                      ) : isEditing ? (
                        <Input
                          type={column.type === 'number' ? 'number' : 'text'}
                          value={cellValue}
                          onChange={(e) => setCellValues(prev => ({ ...prev, [cellKey]: e.target.value }))}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => handleCellKeyDown(e, 'new', column.id)}
                          className="h-8 text-xs border-0 bg-transparent focus:bg-white focus:border focus:border-blue-500 px-1"
                          autoFocus
                        />
                      ) : (
                        <div className="text-sm px-1 min-h-[24px] flex items-center">
                          {cellValue || (
                            <span className="text-gray-400 italic">
                              {column.type === 'number' ? '0.00' : 'Enter value'}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ) : (
              // Historic data rows
              processedData.map((item, index) => (
                <tr
                  key={item.id}
                  className={cn(
                    "hover:bg-blue-50",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  )}
                >
                  {site.columns.map((column) => {
                    const cellKey = `${item.id}-${column.id}`;
                    const isSelected = selectedCells.has(cellKey);
                    const isEditing = editingCell === cellKey;
                    const locked = isLocked(item.date);
                    const cellValue = cellValues[cellKey] !== undefined 
                      ? cellValues[cellKey] 
                      : item.values[column.id];
                    const hasChanges = cellValues[cellKey] !== undefined;

                    return (
                      <td
                        key={column.id}
                        className={cn(
                          "border border-gray-300 px-2 py-1 h-10 cursor-cell relative",
                          isSelected && "ring-2 ring-blue-500 ring-inset",
                          hasChanges && "bg-yellow-100",
                          locked && "bg-gray-100 text-gray-500",
                          column.type === 'number' ? "text-right" : column.id === 'date' ? "text-center" : "text-left"
                        )}
                        onClick={() => !locked && handleCellClick(item.id, column.id)}
                        onDoubleClick={() => !locked && handleCellDoubleClick(item.id, column.id)}
                        onKeyDown={(e) => !locked && handleCellKeyDown(e, item.id, column.id)}
                        tabIndex={locked ? -1 : 0}
                      >
                        {column.id === 'date' ? (
                          <div className="text-sm py-1 text-center">
                            {format(new Date(item.date), 'yyyy-MM-dd')}
                          </div>
                        ) : locked ? (
                          <div className="text-sm px-1 min-h-[24px] flex items-center justify-between">
                            <span>{cellValue}</span>
                            <Lock className="h-3 w-3 text-gray-400" />
                          </div>
                        ) : isEditing ? (
                          <Input
                            type={column.type === 'number' ? 'number' : 'text'}
                            value={cellValue || ''}
                            onChange={(e) => setCellValues(prev => ({ ...prev, [cellKey]: e.target.value }))}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => handleCellKeyDown(e, item.id, column.id)}
                            className="h-8 text-xs border-0 bg-transparent focus:bg-white focus:border focus:border-blue-500 px-1"
                            autoFocus
                          />
                        ) : (
                          <div className="text-sm px-1 min-h-[24px] flex items-center">
                            {cellValue}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>

          {/* Summary Footer for Historic Data */}
          {!showDatePicker && Object.keys(totals).length > 0 && (
            <tfoot className="bg-gray-100 border-t-2 border-gray-400 sticky bottom-0">
              <tr>
                {site.columns.map((column) => (
                  <td key={column.id} className="border border-gray-300 px-2 py-1 text-xs font-medium">
                    {column.id === 'date' ? (
                      'Summary'
                    ) : totals[column.id] ? (
                      <div className="text-right">
                        <div>Min: {totals[column.id].min.toFixed(2)}</div>
                        <div>Max: {totals[column.id].max.toFixed(2)}</div>
                        <div>Avg: {totals[column.id].avg.toFixed(2)}</div>
                      </div>
                    ) : null}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-gray-50 border-t border-gray-300 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>
            {showDatePicker ? '1 row ready for entry' : `${processedData.length} rows`}
          </span>
          {Object.keys(filters).some(key => filters[key]) && (
            <Button
              onClick={() => setFilters({})}
              variant="ghost"
              size="sm"
              className="h-5 text-xs px-2"
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!showDatePicker && allowedEditDays && (
            <span>Editable within {allowedEditDays} days</span>
          )}
          {Object.keys(cellValues).length > 0 && (
            <span className="text-orange-600 font-medium">
              {Object.keys(cellValues).length} unsaved change(s)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
