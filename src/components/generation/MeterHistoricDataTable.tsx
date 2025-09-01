
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
import { CollapsibleBlockHeader } from '@/components/grassCutting/CollapsibleBlockHeader';

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
  const [expandedBlocks, setExpandedBlocks] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const rawMeterData = useMemo(() => {
    if (!site || !site.meterConfig) return [];

    return mockHistoricData.filter(
      item => item.siteId === site.id && item.tabType === 'meter-data'
    );
  }, [site]);

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

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

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

  // Group meters by blocks if available - using meterNames directly
  const meterBlocks = useMemo(() => {
    return [{
      id: 'all-meters',
      name: 'All Meters',
      meters: site.meterConfig?.meterNames || []
    }];
  }, [site.meterConfig]);

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
                <th className="px-2 py-1 text-left font-medium border border-gray-300 w-24">Field</th>
                {meterBlocks.map(block => (
                  <CollapsibleBlockHeader
                    key={block.id}
                    blockName={block.name}
                    blockId={block.id}
                    inverterCount={block.meters.length}
                    isExpanded={expandedBlocks[block.id]}
                    onToggle={() => toggleBlock(block.id)}
                  />
                ))}
                <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-verdo-navy w-32">Remarks</th>
              </tr>
              {Object.keys(expandedBlocks).some(key => expandedBlocks[key]) && (
                <tr className="bg-blue-800 text-white">
                  <th className="px-2 py-1 border border-gray-300">Meter</th>
                  {meterBlocks.map(block => (
                    expandedBlocks[block.id] ? (
                      block.meters.map(meter => (
                        <th key={`${block.id}-${meter}`} className="px-2 py-1 text-center font-medium border border-gray-300 w-24">
                          {meter}
                        </th>
                      ))
                    ) : null
                  ))}
                  <th className="px-2 py-1 border border-gray-300"></th>
                </tr>
              )}
            </thead>
            
            <tbody>
              {/* Group data by date */}
              {Array.from(new Set(processedData.map(row => row.date))).map(date => {
                const dateRows = processedData.filter(row => row.date === date);
                
                return (
                  <React.Fragment key={date}>
                    {/* Export Value Row */}
                    <tr className="bg-white">
                      <td className="px-2 py-1 border border-gray-300">
                        <div className="text-xs py-1 px-2 bg-muted/50 rounded">
                          {format(new Date(date), 'dd-MMM-yy')}
                        </div>
                      </td>
                      {meterBlocks.map(block => {
                        if (expandedBlocks[block.id]) {
                          return block.meters.map(meterName => {
                            const meterRow = dateRows.find(row => row.meter === meterName);
                            const exportKey = `${meterRow?.id}-exportValue`;
                            const currentExportValue = editedData[exportKey] !== undefined 
                              ? editedData[exportKey] 
                              : meterRow?.exportValue || '';
                            const hasExportChanges = editedData[exportKey] !== undefined;

                            return (
                              <td key={`${block.id}-${meterName}-export`} className="px-2 py-1 border border-gray-300">
                                <Input
                                  type="number"
                                  value={currentExportValue}
                                  onChange={(e) => meterRow && handleCellEdit(meterRow.id, 'exportValue', e.target.value)}
                                  className={cn(
                                    "h-6 text-xs border-0 focus:bg-background focus:border focus:border-ring text-center",
                                    isEditMode ? "bg-blue-100" : "bg-gray-100",
                                    hasExportChanges && "bg-yellow-50 border border-yellow-300"
                                  )}
                                  readOnly={!isEditMode}
                                  step="0.01"
                                  placeholder="Export"
                                />
                              </td>
                            );
                          });
                        } else {
                          // Show aggregated export value for collapsed block
                          const blockExportTotal = block.meters.reduce((sum, meterName) => {
                            const meterRow = dateRows.find(row => row.meter === meterName);
                            return sum + (Number(meterRow?.exportValue) || 0);
                          }, 0);
                          return (
                            <td key={`${block.id}-export`} className="px-2 py-1 text-center border border-gray-300">
                              {blockExportTotal}
                            </td>
                          );
                        }
                      })}
                      <td className="px-2 py-1 border border-gray-300">
                        {dateRows[0] && (
                          <Input
                            type="text"
                            value={editedData[`${dateRows[0].id}-remarks`] !== undefined 
                              ? editedData[`${dateRows[0].id}-remarks`] 
                              : dateRows[0].remarks}
                            onChange={(e) => handleCellEdit(dateRows[0].id, 'remarks', e.target.value)}
                            className={cn(
                              "h-6 text-xs border-0 focus:bg-background focus:border focus:border-ring",
                              isEditMode ? "bg-blue-100" : "bg-gray-100",
                              editedData[`${dateRows[0].id}-remarks`] !== undefined && "bg-yellow-50 border border-yellow-300"
                            )}
                            readOnly={!isEditMode}
                            placeholder="Add remarks..."
                          />
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
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
