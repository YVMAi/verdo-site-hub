
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
  type: 'Export' | 'Import';
  value: number;
  originalData: GenerationData;
}

const MONTHS = [
  { value: 'all', label: 'All Months' },
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' }
];

const YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

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
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const { toast } = useToast();

  const processedData = useMemo(() => {
    if (!site || !site.meterConfig) return [];

    const meterHistoricData = mockHistoricData.filter(
      item => item.siteId === site.id && item.tabType === 'meter-data'
    );

    const rows: MeterHistoricRow[] = [];
    
    meterHistoricData.forEach(dataItem => {
      site.meterConfig!.meterNames.forEach(meterName => {
        const meterKey = meterName.toLowerCase().replace(' ', '');
        const exportKey = `${meterKey}Export`;
        const importKey = `${meterKey}Import`;
        
        if (dataItem.values[exportKey] !== undefined) {
          rows.push({
            id: `${dataItem.id}-${meterKey}-export`,
            date: dataItem.date,
            meter: meterName,
            type: 'Export',
            value: dataItem.values[exportKey],
            originalData: dataItem
          });
        }
        
        if (dataItem.values[importKey] !== undefined) {
          rows.push({
            id: `${dataItem.id}-${meterKey}-import`,
            date: dataItem.date,
            meter: meterName,
            type: 'Import',
            value: dataItem.values[importKey],
            originalData: dataItem
          });
        }
      });
    });

    return rows.filter(row => {
      // Month filter
      if (selectedMonth !== 'all') {
        const itemDate = new Date(row.date);
        const itemMonth = (itemDate.getMonth() + 1).toString().padStart(2, '0');
        const itemYear = itemDate.getFullYear().toString();
        if (itemMonth !== selectedMonth || itemYear !== selectedYear) {
          return false;
        }
      }
      
      // Text filter
      if (!filterValue) return true;
      return [row.meter, row.type, row.value.toString(), row.date].some(val =>
        val.toLowerCase().includes(filterValue.toLowerCase())
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
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
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
  }, [site, filterValue, sortColumn, sortDirection, selectedMonth, selectedYear]);

  if (!site || !site.meterConfig) {
    return (
      <div className="bg-white border rounded">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Select a site to view meter historic data</p>
        </div>
      </div>
    );
  }

  if (processedData.length === 0) {
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

  const handleCellEdit = (rowId: string, value: any) => {
    setEditedData(prev => ({ ...prev, [rowId]: value }));
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
            <SelectTrigger className="w-32 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Filter - only show when a specific month is selected */}
          {selectedMonth !== 'all' && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-20 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {YEARS.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
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
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center justify-between">
                    Type
                    {sortColumn === 'type' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center justify-between">
                    Value
                    {sortColumn === 'value' && (
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
                const currentValue = editedData[row.id] !== undefined 
                  ? editedData[row.id] 
                  : row.value;
                const hasChanges = editedData[row.id] !== undefined;

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
                      <div className="text-xs py-1 px-2 bg-muted/50 rounded">
                        {row.type}
                      </div>
                    </td>
                    <td className="px-2 py-1 border border-gray-300">
                      <Input
                        type="number"
                        value={currentValue || ''}
                        onChange={(e) => handleCellEdit(row.id, e.target.value)}
                        className={cn(
                          "h-6 text-xs border-0 focus:bg-background focus:border focus:border-ring",
                          isEditMode ? "bg-blue-100" : "bg-gray-100",
                          hasChanges && "bg-yellow-50 border border-yellow-300"
                        )}
                        readOnly={!isEditMode}
                        step="0.01"
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
