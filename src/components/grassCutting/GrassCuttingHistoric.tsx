
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Search, ExternalLink } from 'lucide-react';
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
      <div className="bg-card border rounded-lg p-8 text-center">
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

  return (
    <div className="bg-card border rounded-lg">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Historic Grass Cutting Data</h3>
          <Select onValueChange={handleExport}>
            <SelectTrigger className="w-32 h-8">
              <Download className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">Export CSV</SelectItem>
              <SelectItem value="xlsx">Export XLSX</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
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
          
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter data..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 sticky top-0">
            <tr>
              {[
                { id: 'date', name: 'Date' },
                { id: 'block', name: 'Block' },
                { id: 'inverter', name: 'Inverter' },
                { id: 'scb', name: 'SCB' },
                { id: 'numberOfStringsCleaned', name: 'Strings Cleaned' },
                { id: 'startTime', name: 'Start Time' },
                { id: 'stopTime', name: 'Stop Time' },
                { id: 'verifiedBy', name: 'Verified By' },
                { id: 'planned', name: 'Planned' },
                { id: 'deviation', name: 'Deviation' },
                { id: 'percentComplete', name: '% Complete' },
                { id: 'linkedTask', name: 'Linked Task' },
                { id: 'remarks', name: 'Remarks' },
              ].map((column) => (
                <th 
                  key={column.id} 
                  className="px-3 py-2 text-left font-medium border-r border-border/50 min-w-[100px] cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort(column.id)}
                >
                  <div className="flex items-center justify-between">
                    {column.name}
                    {sortColumn === column.id && (
                      <span className="text-xs">
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
                <td className="px-3 py-2 border-r border-border/50">
                  {format(new Date(item.date), 'yyyy-MM-dd')}
                  {!isEditable(item.date) && <span className="ml-1 text-xs">🔒</span>}
                </td>
                <td className="px-3 py-2 border-r border-border/50">{item.block}</td>
                <td className="px-3 py-2 border-r border-border/50">{item.inverter}</td>
                <td className="px-3 py-2 border-r border-border/50">{item.scb || '-'}</td>
                <td className="px-3 py-2 border-r border-border/50 text-center font-medium">
                  {item.numberOfStringsCleaned}
                </td>
                <td className="px-3 py-2 border-r border-border/50">{item.startTime}</td>
                <td className="px-3 py-2 border-r border-border/50">{item.stopTime}</td>
                <td className="px-3 py-2 border-r border-border/50">{item.verifiedBy}</td>
                <td className="px-3 py-2 border-r border-border/50 text-center">{item.planned}</td>
                <td className={cn(
                  "px-3 py-2 border-r border-border/50 text-center font-medium",
                  item.deviation > 0 ? "text-green-600" : item.deviation < 0 ? "text-red-600" : "text-gray-600"
                )}>
                  {item.deviation > 0 ? '+' : ''}{item.deviation}
                </td>
                <td className={cn(
                  "px-3 py-2 border-r border-border/50 text-center font-bold",
                  item.percentComplete >= 100 ? "text-green-600" : 
                  item.percentComplete >= 80 ? "text-yellow-600" : "text-red-600"
                )}>
                  {item.percentComplete}%
                </td>
                <td className="px-3 py-2 border-r border-border/50">
                  {item.linkedTask && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {item.linkedTask}
                    </Button>
                  )}
                </td>
                <td className="px-3 py-2 border-r border-border/50 max-w-[200px] truncate">
                  {item.remarks || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No data found for the selected filters
          </div>
        )}
      </div>
      
      <div className="p-3 bg-muted/20 text-xs text-muted-foreground border-t flex justify-between">
        <span>
          Showing {filteredData.length} records • 
          🟢 ≥100% • 🟡 80-99% • 🔴 &lt;80% • 
          🔒 = Locked (older than {client?.allowedEditDays || 30} days)
        </span>
      </div>
    </div>
  );
};
