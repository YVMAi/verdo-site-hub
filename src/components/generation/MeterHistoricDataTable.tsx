
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, Save, ChevronDown } from 'lucide-react';
import { Site, GenerationData } from '@/types/generation';
import { mockHistoricData } from '@/data/mockGenerationData';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { ExportDialog } from '@/components/common/ExportDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MeterHistoricDataTableProps {
  site: Site | null;
  allowedEditDays: number;
}

interface MeterHistoricRow {
  id: string;
  date: string;
  meter: string;
  exportValue: number | null;
  importValue: number | null;
  remarks: string;
  originalData: GenerationData;
}

export const MeterHistoricDataTable: React.FC<MeterHistoricDataTableProps> = ({ 
  site, 
  allowedEditDays 
}) => {
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterValue, setFilterValue] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const { toast } = useToast();

  const rawMeterData = useMemo(() => {
    if (!site || !site.meterConfig) return [];

    return mockHistoricData.filter(
      item => item.siteId === site.id && item.tabType === 'meter-data'
    );
  }, [site]);

  // Generate dynamic month options based on available data
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    
    rawMeterData.forEach(item => {
      const date = new Date(item.date);
      const monthYear = format(date, 'MMMM yyyy');
      const monthValue = format(date, 'MM-yyyy');
      monthsSet.add(`${monthValue}|${monthYear}`);
    });

    const monthsArray = Array.from(monthsSet).map(item => {
      const [value, label] = item.split('|');
      return { value, label };
    }).sort((a, b) => {
      // Sort by year and month (most recent first)
      const [aMonth, aYear] = a.value.split('-');
      const [bMonth, bYear] = b.value.split('-');
      if (aYear !== bYear) {
        return parseInt(bYear) - parseInt(aYear);
      }
      return parseInt(bMonth) - parseInt(aMonth);
    });

    return [{ value: 'all', label: 'All Months' }, ...monthsArray];
  }, [rawMeterData]);

  const processedData = useMemo(() => {
    if (!site || !site.meterConfig) return [];

    const meterHistoricData = rawMeterData.filter(item => {
      // Month filter
      if (selectedMonth !== 'all') {
        const itemDate = new Date(item.date);
        const itemMonthYear = format(itemDate, 'MM-yyyy');
        if (itemMonthYear !== selectedMonth) {
          return false;
        }
      }
      return true;
    });

    const rows: MeterHistoricRow[] = [];
    
    // Group data by date and meter
    const groupedData = new Map<string, Map<string, {exportValue: number | null, importValue: number | null, originalData: GenerationData}>>();
    
    meterHistoricData.forEach(dataItem => {
      if (!groupedData.has(dataItem.date)) {
        groupedData.set(dataItem.date, new Map());
      }
      const dateGroup = groupedData.get(dataItem.date)!;
      
      site.meterConfig!.meterNames.forEach(meterName => {
        const meterKey = meterName.toLowerCase().replace(' ', '');
        const exportKey = `${meterKey}Export`;
        const importKey = `${meterKey}Import`;
        
        if (!dateGroup.has(meterName)) {
          dateGroup.set(meterName, {
            exportValue: null,
            importValue: null,
            originalData: dataItem
          });
        }
        
        const meterData = dateGroup.get(meterName)!;
        if (dataItem.values[exportKey] !== undefined) {
          meterData.exportValue = dataItem.values[exportKey];
        }
        if (dataItem.values[importKey] !== undefined) {
          meterData.importValue = dataItem.values[importKey];
        }
      });
    });

    // Convert grouped data to rows
    groupedData.forEach((meters, date) => {
      meters.forEach((data, meterName) => {
        rows.push({
          id: `${date}-${meterName}`,
          date,
          meter: meterName,
          exportValue: data.exportValue,
          importValue: data.importValue,
          remarks: data.originalData.values.remarks || '',
          originalData: data.originalData
        });
      });
    });

    return rows.filter(row => {
      // Text filter
      if (!filterValue) return true;
      return [row.meter, row.exportValue?.toString(), row.importValue?.toString(), row.remarks, row.date].some(val =>
        val?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }).sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortColumn) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'meter':
          aValue = a.meter;
          bValue = b.meter;
          break;
        case 'exportValue':
          aValue = a.exportValue || 0;
          bValue = b.exportValue || 0;
          break;
        case 'importValue':
          aValue = a.importValue || 0;
          bValue = b.importValue || 0;
          break;
        case 'remarks':
          aValue = a.remarks;
          bValue = b.remarks;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });
  }, [site, rawMeterData, filterValue, sortColumn, sortDirection, selectedMonth]);

  if (!site || !site.meterConfig) {
    return (
      <div className="bg-white border rounded">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Select a site to view meter historic data</p>
        </div>
      </div>
    );
  }

  if (processedData.length === 0 && selectedMonth === 'all') {
    return (
      <div className="bg-white border rounded">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No historic meter data available for this site</p>
        </div>
      </div>
    );
  }

  const isEditable = (date: string) => {
    const daysDiff = differenceInDays(new Date(), new Date(date));
    return daysDiff <= allowedEditDays;
  };

  const handleCellEdit = (rowId: string, field: string, value: any) => {
    const key = `${rowId}-${field}`;
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

  const handleSaveClick = () => {
    setShowSaveConfirmation(true);
  };

  const handleConfirmSave = () => {
    console.log('Saving meter data changes:', editedData);
    toast({
      title: "Changes Saved",
      description: "Historic meter data has been updated successfully.",
    });
    setEditedData({});
    setIsEditMode(false);
    setShowSaveConfirmation(false);
  };

  const handleCancelSave = () => {
    setShowSaveConfirmation(false);
  };

  const handleExportWithDateRange = (startDate: Date, endDate: Date) => {
    console.log(`Exporting meter data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    toast({
      title: "Export Started",
      description: `Downloading meter data for selected date range as CSV`,
    });
  };

  const hasUnsavedChanges = Object.keys(editedData).length > 0;

  return (
    <>
      <div className="bg-white rounded border">
        <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
          <span>Historic Data - Meter Data</span>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <Button 
                onClick={isEditMode ? handleSaveClick : () => setIsEditMode(true)} 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
              >
                {isEditMode ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
              <span className="text-xs mt-1">{isEditMode ? 'Save' : 'Edit'}</span>
            </div>
            <div className="flex flex-col items-center">
              <ExportDialog
                title="Export Historic Data"
                description="Select the date range for which you want to export historic meter data:"
                onExport={handleExportWithDateRange}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </ExportDialog>
              <span className="text-xs mt-1">Export</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="px-3 py-2 bg-gray-50 border-b flex flex-wrap gap-2 items-center text-xs">
          <Input
            type="search"
            placeholder="Search meter data..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="h-7 text-xs flex-1 min-w-[120px]"
          />
          
          {/* Month Filter */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              {availableMonths.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Badge variant="secondary">
            {processedData.length} Records
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
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0">
              <tr className="bg-verdo-navy text-white">
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center justify-between">
                    Date
                    {sortColumn === 'date' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('meter')}
                >
                  <div className="flex items-center justify-between">
                    Meter
                    {sortColumn === 'meter' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('exportValue')}
                >
                  <div className="flex items-center justify-between">
                    Export Value
                    {sortColumn === 'exportValue' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('importValue')}
                >
                  <div className="flex items-center justify-between">
                    Import Value
                    {sortColumn === 'importValue' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[150px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('remarks')}
                >
                  <div className="flex items-center justify-between">
                    Remarks
                    {sortColumn === 'remarks' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody>
              {processedData.map((row, index) => {
                const isLocked = !isEditable(row.date);
                
                const exportKey = `${row.id}-exportValue`;
                const importKey = `${row.id}-importValue`;
                const remarksKey = `${row.id}-remarks`;
                
                const currentExportValue = editedData[exportKey] !== undefined 
                  ? editedData[exportKey] 
                  : row.exportValue || '';
                const currentImportValue = editedData[importKey] !== undefined 
                  ? editedData[importKey] 
                  : row.importValue || '';
                const currentRemarks = editedData[remarksKey] !== undefined 
                  ? editedData[remarksKey] 
                  : row.remarks;
                
                const hasExportChanges = editedData[exportKey] !== undefined;
                const hasImportChanges = editedData[importKey] !== undefined;
                const hasRemarksChanges = editedData[remarksKey] !== undefined;

                return (
                  <tr key={row.id} className={cn(
                    "hover:bg-muted/20",
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  )}>
                    <td className="px-2 py-1 border border-gray-300">
                      <div className="text-xs py-1 px-2 bg-muted/50 rounded">
                        {format(new Date(row.date), 'yyyy-MM-dd')}
                      </div>
                    </td>
                    <td className="px-2 py-1 border border-gray-300">
                      <div className="text-xs py-1 px-2 bg-muted/50 rounded">
                        {row.meter}
                      </div>
                    </td>
                    <td className="px-2 py-1 border border-gray-300">
                      <Input
                        type="number"
                        value={currentExportValue}
                        onChange={(e) => handleCellEdit(row.id, 'exportValue', e.target.value)}
                        className={cn(
                          "h-6 text-xs border-0 focus:bg-background focus:border focus:border-ring",
                          isEditMode ? "bg-blue-100" : "bg-gray-100",
                          hasExportChanges && "bg-yellow-50 border border-yellow-300"
                        )}
                        readOnly={!isEditMode}
                        step="0.01"
                      />
                    </td>
                    <td className="px-2 py-1 border border-gray-300">
                      <Input
                        type="number"
                        value={currentImportValue}
                        onChange={(e) => handleCellEdit(row.id, 'importValue', e.target.value)}
                        className={cn(
                          "h-6 text-xs border-0 focus:bg-background focus:border focus:border-ring",
                          isEditMode ? "bg-blue-100" : "bg-gray-100",
                          hasImportChanges && "bg-yellow-50 border border-yellow-300"
                        )}
                        readOnly={!isEditMode}
                        step="0.01"
                      />
                    </td>
                    <td className="px-2 py-1 border border-gray-300">
                      <Input
                        type="text"
                        value={currentRemarks}
                        onChange={(e) => handleCellEdit(row.id, 'remarks', e.target.value)}
                        className={cn(
                          "h-6 text-xs border-0 focus:bg-background focus:border focus:border-ring",
                          isEditMode ? "bg-blue-100" : "bg-gray-100",
                          hasRemarksChanges && "bg-yellow-50 border border-yellow-300"
                        )}
                        readOnly={!isEditMode}
                        placeholder="Add remarks..."
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 bg-muted/20 text-xs text-muted-foreground border-t flex justify-between">
          <span>
            Showing {processedData.length} records • 
            Editable within {allowedEditDays} days
          </span>
          {hasUnsavedChanges && (
            <span className="text-yellow-600 font-medium">
              {Object.keys(editedData).length} unsaved change(s)
            </span>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirmation}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        title="Save Changes"
        description={`Are you sure you want to save ${Object.keys(editedData).length} change(s) to the historic meter data?`}
        confirmText="Save"
        cancelText="Cancel"
      />
    </>
  );
};
