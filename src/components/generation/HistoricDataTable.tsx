import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Search, Save, Edit, Calendar } from 'lucide-react';
import { Site, TabType, GenerationData, SiteColumn } from '@/types/generation';
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
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterValue, setFilterValue] = useState('');
  const [groupByColumn, setGroupByColumn] = useState<string>('none');
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [exportStartDate, setExportStartDate] = useState<Date | undefined>();
  const [exportEndDate, setExportEndDate] = useState<Date | undefined>();
  const { toast } = useToast();

  // Generate meter data columns based on site configuration
  const meterColumns = useMemo(() => {
    if (!site?.meterConfig || activeTab !== 'meter-data') return [];
    
    const columns: SiteColumn[] = [{ id: 'date', name: 'Date', type: 'date', required: true }];
    
    site.meterConfig.meters.forEach(meter => {
      site.meterConfig!.types.forEach(type => {
        columns.push({
          id: `${meter.toLowerCase().replace(' ', '-')}-${type.toLowerCase()}`,
          name: `${meter} - ${type}`,
          type: 'number',
          required: true
        });
      });
    });
    
    return columns;
  }, [site, activeTab]);

  // Use appropriate columns based on tab type
  const currentColumns = activeTab === 'meter-data' ? meterColumns : (site?.columns || []);

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
    if (groupByColumn === 'none') return { '': filteredData };
    
    return filteredData.reduce((groups, item) => {
      const groupValue = item.values[groupByColumn] || 'Unknown';
      if (!groups[groupValue]) groups[groupValue] = [];
      groups[groupValue].push(item);
      return groups;
    }, {} as Record<string, GenerationData[]>);
  }, [filteredData, groupByColumn]);

  if (!site) {
    return (
      <div className="bg-white border rounded">
        <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm">
          <span>Historic Data</span>
        </div>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Select a site to view historic data</p>
        </div>
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
    setIsEditMode(false);
  };

  const handleExport = () => {
    if (!exportStartDate || !exportEndDate) {
      toast({
        title: "Date Range Required",
        description: "Please select both start and end dates for export.",
        variant: "destructive"
      });
      return;
    }

    const filteredForExport = filteredData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= exportStartDate && itemDate <= exportEndDate;
    });

    console.log(`Exporting ${filteredForExport.length} records from ${format(exportStartDate, 'yyyy-MM-dd')} to ${format(exportEndDate, 'yyyy-MM-dd')}`);
    
    toast({
      title: "Export Started",
      description: `Downloading ${filteredForExport.length} records as CSV`,
    });

    setExportDialogOpen(false);
    setExportStartDate(undefined);
    setExportEndDate(undefined);
  };

  const hasUnsavedChanges = Object.keys(editedData).length > 0;

  if (filteredData.length === 0) {
    return (
      <div className="bg-white border rounded">
        <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm">
          <span>Historic Data - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No historic data available for this site and tab</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border">
      <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <span>Historic Data - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <div className="flex flex-col items-center">
              <Button 
                onClick={handleSaveChanges} 
                variant="outline"
                size="sm" 
                className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
              <span className="text-xs mt-1">Save</span>
            </div>
          )}
          <div className="flex flex-col items-center">
            {isEditMode ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Save Changes</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to save all changes to the historic data? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSaveChanges}>
                      Save Changes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button 
                onClick={() => setIsEditMode(true)} 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs mt-1">{isEditMode ? 'Save' : 'Edit'}</span>
          </div>
          <div className="flex flex-col items-center">
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Export Historic Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Select the date range for which you want to export historic data:
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !exportStartDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {exportStartDate ? format(exportStartDate, "PPP") : "Pick start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={exportStartDate}
                            onSelect={setExportStartDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !exportEndDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {exportEndDate ? format(exportEndDate, "PPP") : "Pick end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={exportEndDate}
                            onSelect={setExportEndDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleExport}>
                      Export CSV
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <span className="text-xs mt-1">Export</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="px-3 py-2 bg-gray-50 border-b flex flex-wrap gap-2 items-center text-xs">
        <Input
          type="search"
          placeholder="Search data..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="h-7 text-xs flex-1 min-w-[120px]"
        />
        <Select value={groupByColumn} onValueChange={setGroupByColumn}>
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue placeholder="Group by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No grouping</SelectItem>
            {currentColumns.map(column => (
              <SelectItem key={column.id} value={column.id}>
                {column.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary">
          {filteredData.length} Records
        </Badge>
        {isEditMode && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Edit Mode
          </Badge>
        )}
        {hasUnsavedChanges && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
            {Object.keys(editedData).length} Unsaved Changes
          </Badge>
        )}
      </div>
      
      <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
        <div className="min-w-full">
          {Object.entries(groupedData).map(([groupValue, items]) => (
            <div key={groupValue}>
              {groupByColumn !== 'none' && (
                <div className="bg-muted/30 px-4 py-2 text-sm font-medium border-b">
                  {groupByColumn}: {groupValue} ({items.length} items)
                </div>
              )}
              
              <table className="w-full text-xs border-collapse">
                {(groupByColumn === 'none' || groupValue === Object.keys(groupedData)[0]) && (
                  <thead className="sticky top-0">
                    <tr className="bg-verdo-navy text-white">
                      {currentColumns.map((column) => (
                        <th 
                          key={column.id} 
                          className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[120px] cursor-pointer hover:bg-verdo-navy/80"
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
                      {currentColumns.map((column) => {
                        const cellKey = `${item.id}-${column.id}`;
                        const isLocked = !isEditable(item.date);
                        const currentValue = editedData[cellKey] !== undefined 
                          ? editedData[cellKey] 
                          : item.values[column.id];
                        const hasChanges = editedData[cellKey] !== undefined;

                        return (
                          <td key={column.id} className="px-2 py-1 border border-gray-300">
                            {column.id === 'date' || isLocked ? (
                              <div className={cn(
                                "text-xs py-1 px-2 rounded",
                                isLocked ? "bg-muted/50 text-muted-foreground" : "",
                                isEditMode && !isLocked && column.id !== 'date' && "bg-blue-100"
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
                                  "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                                  isEditMode && "bg-blue-100",
                                  hasChanges && "bg-yellow-50 border border-yellow-300"
                                )}
                                readOnly={!isEditMode}
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
