
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Save } from 'lucide-react';
import { Site, TabType, GenerationData } from '@/types/generation';
import { mockHistoricData } from '@/data/mockGenerationData';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface HistoricDataTableProps {
  site: Site | null;
  activeTab: TabType;
  allowedEditDays: number;
}

export const HistoricDataTable: React.FC<HistoricDataTableProps> = ({ 
  site, 
  activeTab, 
  allowedEditDays 
}) => {
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterValue, setFilterValue] = useState('');
  const [groupByColumn, setGroupByColumn] = useState<string>('');
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    if (!site) return [];
    
    return mockHistoricData
      .filter(item => item.siteId === site.id && item.tabType === activeTab)
      .filter(item => {
        if (!filterValue) return true;
        return Object.values(item.values).some(value => 
          String(value).toLowerCase().includes(filterValue.toLowerCase())
        );
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
  }, [site, activeTab, filterValue, sortColumn, sortDirection]);

  const groupedData = useMemo(() => {
    if (!groupByColumn) return { '': filteredData };
    
    return filteredData.reduce((groups, item) => {
      const groupValue = item.values[groupByColumn] || 'Unknown';
      if (!groups[groupValue]) groups[groupValue] = [];
      groups[groupValue].push(item);
      return groups;
    }, {} as Record<string, GenerationData[]>);
  }, [filteredData, groupByColumn]);

  if (!site) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Select a site to view historic data</p>
      </div>
    );
  }

  const isEditable = (date: string) => {
    const daysDiff = differenceInDays(new Date(), new Date(date));
    return daysDiff <= allowedEditDays;
  };

  const handleCellEdit = (itemId: string, columnId: string, value: any) => {
    const key = `${itemId}-${columnId}`;
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleSaveChanges = () => {
    console.log('Saving changes:', editedData);
    toast({
      title: "Changes Saved",
      description: "Historic data has been updated successfully.",
    });
    setEditedData({});
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    // Simulate export
    const data = filteredData.map(item => item.values);
    console.log(`Exporting ${data.length} rows as ${format.toUpperCase()}`);
    
    toast({
      title: "Export Started",
      description: `Downloading ${data.length} rows as ${format.toUpperCase()}`,
    });
  };

  const hasUnsavedChanges = Object.keys(editedData).length > 0;

  if (filteredData.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No historic data available for this site and tab</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Historic Data - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Button onClick={handleSaveChanges} size="sm" variant="default">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
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
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter data..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          
          <Select value={groupByColumn} onValueChange={setGroupByColumn}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Group by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No grouping</SelectItem>
              {site.columns.map(column => (
                <SelectItem key={column.id} value={column.id}>
                  {column.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-96">
        <div className="min-w-full">
          {Object.entries(groupedData).map(([groupValue, items]) => (
            <div key={groupValue}>
              {groupByColumn && (
                <div className="bg-muted/30 px-4 py-2 text-sm font-medium border-b">
                  {groupByColumn}: {groupValue} ({items.length} items)
                </div>
              )}
              
              <table className="w-full text-sm">
                {(!groupByColumn || groupValue === Object.keys(groupedData)[0]) && (
                  <thead className="bg-muted/30 sticky top-0">
                    <tr>
                      {site.columns.map((column) => (
                        <th 
                          key={column.id} 
                          className="px-3 py-2 text-left font-medium border-r border-border/50 min-w-[120px] cursor-pointer hover:bg-muted/50"
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
                )}
                
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className={cn(
                      "hover:bg-muted/20",
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    )}>
                      {site.columns.map((column) => {
                        const cellKey = `${item.id}-${column.id}`;
                        const isLocked = !isEditable(item.date);
                        const currentValue = editedData[cellKey] !== undefined 
                          ? editedData[cellKey] 
                          : item.values[column.id];
                        const hasChanges = editedData[cellKey] !== undefined;

                        return (
                          <td key={column.id} className="px-3 py-2 border-r border-border/50">
                            {column.id === 'date' || isLocked ? (
                              <div className={cn(
                                "text-sm py-1 px-2 rounded",
                                isLocked ? "bg-muted/50 text-muted-foreground" : ""
                              )}>
                                {column.id === 'date' 
                                  ? format(new Date(item.date), 'yyyy-MM-dd')
                                  : currentValue
                                }
                                {isLocked && column.id !== 'date' && (
                                  <span className="ml-1 text-xs">🔒</span>
                                )}
                              </div>
                            ) : (
                              <Input
                                type={column.type === 'number' ? 'number' : 'text'}
                                value={currentValue || ''}
                                onChange={(e) => handleCellEdit(item.id, column.id, e.target.value)}
                                className={cn(
                                  "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                                  hasChanges && "bg-yellow-50 border border-yellow-300"
                                )}
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-3 bg-muted/20 text-xs text-muted-foreground border-t flex justify-between">
        <span>
          Showing {filteredData.length} records • 
          Editable within {allowedEditDays} days • 
          🔒 = Locked (older than {allowedEditDays} days)
        </span>
        {hasUnsavedChanges && (
          <span className="text-yellow-600 font-medium">
            {Object.keys(editedData).length} unsaved change(s)
          </span>
        )}
      </div>
    </div>
  );
};
