
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Search, ExternalLink, Filter } from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site, Client } from '@/types/generation';
import { GrassCuttingEntry } from '@/types/grassCutting';
import { mockGrassCuttingData } from '@/data/mockGrassCuttingData';
import { useToast } from '@/hooks/use-toast';

interface GrassCuttingHistoricProps {
  site: Site | null;
  client: Client | null;
}

export const GrassCuttingHistoric: React.FC<GrassCuttingHistoricProps> = ({ site, client }) => {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [filterValue, setFilterValue] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    if (!site) return [];
    
    return mockGrassCuttingData
      .filter(item => {
        // Filter by date range
        const itemDate = new Date(item.date);
        const isInDateRange = itemDate >= dateRange.from && itemDate <= dateRange.to;
        
        // Filter by search term
        const matchesFilter = !filterValue || 
          Object.values(item).some(value => 
            String(value).toLowerCase().includes(filterValue.toLowerCase())
          );
          
        return isInDateRange && matchesFilter;
      })
      .sort((a, b) => {
        const aValue = a[sortColumn as keyof GrassCuttingEntry] || a.date;
        const bValue = b[sortColumn as keyof GrassCuttingEntry] || b.date;
        
        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });
  }, [site, dateRange, filterValue, sortColumn, sortDirection]);

  if (!site) {
    return (
      <div className="bg-card border rounded-lg p-4 sm:p-8 text-center">
        <p className="text-muted-foreground">Select a site to view historic grass cutting data</p>
      </div>
    );
  }

  const getRowColor = (percentComplete: number) => {
    if (percentComplete >= 100) return 'bg-green-50 border-green-200';
    if (percentComplete >= 80) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const isEditable = (date: string) => {
    const daysDiff = differenceInDays(new Date(), new Date(date));
    return daysDiff <= (client?.allowedEditDays || 30);
  };

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    console.log(`Exporting ${filteredData.length} rows as ${format.toUpperCase()}`);
    toast({
      title: "Export Started",
      description: `Downloading ${filteredData.length} rows as ${format.toUpperCase()}`,
    });
  };

  const columns = [
    { id: 'date', name: 'Date', minWidth: '100px' },
    { id: 'block', name: 'Block', minWidth: '80px' },
    { id: 'inverter', name: 'Inverter', minWidth: '90px' },
    { id: 'scb', name: 'SCB', minWidth: '70px' },
    { id: 'numberOfStringsCleaned', name: 'Strings', minWidth: '80px' },
    { id: 'startTime', name: 'Start', minWidth: '80px' },
    { id: 'stopTime', name: 'Stop', minWidth: '80px' },
    { id: 'verifiedBy', name: 'Verified', minWidth: '100px' },
    { id: 'planned', name: 'Planned', minWidth: '80px' },
    { id: 'deviation', name: 'Dev.', minWidth: '70px' },
    { id: 'percentComplete', name: '% Comp.', minWidth: '80px' },
    { id: 'linkedTask', name: 'Task', minWidth: '80px' },
    { id: 'remarks', name: 'Remarks', minWidth: '120px' },
  ];

  return (
    <div className="bg-card border rounded-lg">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="font-semibold text-sm sm:text-base">Historic Grass Cutting Data</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Select onValueChange={handleExport}>
              <SelectTrigger className="w-24 sm:w-32 h-8 text-xs sm:text-sm">
                <Download className="h-4 w-4 mr-1 sm:mr-2" />
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">Export CSV</SelectItem>
                <SelectItem value="xlsx">Export XLSX</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className={cn(
          "flex flex-col gap-4 transition-all duration-200",
          showFilters || !showFilters ? "sm:flex" : "hidden sm:flex",
          showFilters ? "flex" : "hidden sm:flex"
        )}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-8 text-xs sm:text-sm w-full sm:w-auto justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter data..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="pl-10 h-8 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-muted/30 sticky top-0">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.id} 
                    className="px-2 sm:px-3 py-2 text-left font-medium border-r border-border/50 cursor-pointer hover:bg-muted/50"
                    style={{ minWidth: column.minWidth }}
                    onClick={() => handleSort(column.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{column.name}</span>
                      {sortColumn === column.id && (
                        <span className="text-xs ml-1 flex-shrink-0">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {filteredData.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={cn(
                    "hover:bg-muted/20 border-b",
                    getRowColor(item.percentComplete)
                  )}
                >
                  <td className="px-2 sm:px-3 py-2 border-r border-border/50">
                    <div className="flex items-center gap-1">
                      <span className="truncate">{format(new Date(item.date), 'MM/dd')}</span>
                      {!isEditable(item.date) && <span className="text-xs">🔒</span>}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-2 border-r border-border/50 truncate">{item.block}</td>
                  <td className="px-2 sm:px-3 py-2 border-r border-border/50 truncate">{item.inverter}</td>
                  <td className="px-2 sm:px-3 py-2 border-r border-border/50 truncate">{item.scb || '-'}</td>
                  <td className="px-2 sm:px-3 py-2 border-r border-border/50 text-center font-medium">
                    {item.numberOfStringsCleaned}
                  </td>
                  <td className="px-2 sm:px-3 py-2 border-r border-border/50 truncate">{item.startTime}</td>
                  <td className="px-2 sm:px-3 py-2 border-r border-border/50 truncate">{item.stopTime}</td>
                  <td className="px-2 sm:px-3 py-2 border-r border-border/50 truncate">{item.verifiedBy}</td>
                  <td className="px-2 sm:px-3 py-2 border-r border-border/50 text-center">{item.planned}</td>
                  <td className={cn(
                    "px-2 sm:px-3 py-2 border-r border-border/50 text-center font-medium",
                    item.deviation > 0 ? "text-green-600" : item.deviation < 0 ? "text-red-600" : "text-gray-600"
                  )}>
                    {item.deviation > 0 ? '+' : ''}{item.deviation}
                  </td>
                  <td className={cn(
                    "px-2 sm:px-3 py-2 border-r border-border/50 text-center font-bold",
                    item.percentComplete >= 100 ? "text-green-600" : 
                    item.percentComplete >= 80 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {item.percentComplete}%
                  </td>
                  <td className="px-2 sm:px-3 py-2 border-r border-border/50">
                    {item.linkedTask && (
                      <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[60px]">{item.linkedTask}</span>
                      </Button>
                    )}
                  </td>
                  <td className="px-2 sm:px-3 py-2 border-r border-border/50 max-w-[120px] truncate">
                    {item.remarks || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="p-4 sm:p-8 text-center text-muted-foreground">
            No data found for the selected filters
          </div>
        )}
      </div>
      
      <div className="p-3 bg-muted/20 text-xs text-muted-foreground border-t flex flex-col sm:flex-row justify-between gap-2">
        <span>
          Showing {filteredData.length} records
        </span>
        <span className="flex flex-wrap gap-2">
          <span>🟢 ≥100%</span>
          <span>🟡 80-99%</span>
          <span>🔴 &lt;80%</span>
          <span>🔒 = Locked ({client?.allowedEditDays || 30}+ days)</span>
        </span>
      </div>
    </div>
  );
};
