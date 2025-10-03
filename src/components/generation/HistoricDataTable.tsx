
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, Save, ChevronDown } from 'lucide-react';
import { Site, TabType, GenerationData } from '@/types/generation';
import { mockHistoricData } from '@/data/mockGenerationData';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { MeterHistoricDataTable } from './MeterHistoricDataTable';
import { ExportDialog } from '@/components/common/ExportDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleBlockHeader } from '@/components/grassCutting/CollapsibleBlockHeader';

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
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const rawHistoricData = useMemo(() => {
    if (!site) return [];
    
    return mockHistoricData.filter(
      item => item.siteId === site.id && item.tabType === activeTab
    );
  }, [site, activeTab]);

  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    
    rawHistoricData.forEach(item => {
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
  }, [rawHistoricData]);

  const historicData = useMemo(() => {
    return rawHistoricData.filter(item => {
      if (selectedMonth !== 'all') {
        const itemDate = new Date(item.date);
        const itemMonthYear = format(itemDate, 'MM-yyyy');
        if (itemMonthYear !== selectedMonth) {
          return false;
        }
      }
      
      if (!filterValue) return true;
      return Object.values(item.values).some(val =>
        val?.toString().toLowerCase().includes(filterValue.toLowerCase())
      ) || item.date.includes(filterValue);
    }).sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortColumn === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else {
        aValue = a.values[sortColumn] || '';
        bValue = b.values[sortColumn] || '';
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });
  }, [rawHistoricData, filterValue, sortColumn, sortDirection, selectedMonth]);

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  // Use specialized meter historic table for meter-data tab
  if (activeTab === 'meter-data') {
    return <MeterHistoricDataTable site={site} allowedEditDays={allowedEditDays} />;
  }

  if (!site) {
    return (
      <div className="bg-white border rounded">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Select a site to view historic data</p>
        </div>
      </div>
    );
  }

  if (historicData.length === 0 && selectedMonth === 'all') {
    return (
      <div className="bg-white border rounded">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No historic data available for this site</p>
        </div>
      </div>
    );
  }

  // Get columns based on active tab
  const getColumnsForTab = () => {
    if (activeTab === 'weather' && site.weatherColumns) {
      return site.weatherColumns;
    }
    if (activeTab === 'ht-panel' && site.htPanelColumns) {
      return site.htPanelColumns;
    }
    if (activeTab === 'inverter' && site.inverterColumns) {
      return site.inverterColumns;
    }
    return site.columns;
  };

  const tabColumns = getColumnsForTab();

  const isEditable = (date: string) => {
    const daysDiff = differenceInDays(new Date(), new Date(date));
    return daysDiff <= allowedEditDays;
  };

  const handleCellEdit = (date: string, columnId: string, value: any) => {
    const key = `${date}-${columnId}`;
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
    console.log('Saving changes:', editedData);
    toast({
      title: "Changes Saved",
      description: "Historic data has been updated successfully.",
    });
    setEditedData({});
    setIsEditMode(false);
    setShowSaveConfirmation(false);
  };

  const handleCancelSave = () => {
    setShowSaveConfirmation(false);
  };

  const handleExportWithDateRange = (startDate: Date, endDate: Date) => {
    console.log(`Exporting ${activeTab} data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    toast({
      title: "Export Started",
      description: `Downloading ${activeTab} data for selected date range as CSV`,
    });
  };

  const hasUnsavedChanges = Object.keys(editedData).length > 0;

  // Get block structure based on tab type
  const getBlockStructure = () => {
    if (activeTab === 'inverter' && site.inverterConfig?.blocks) {
      return site.inverterConfig.blocks.map(block => ({
        id: block.blockName,
        name: block.blockName,
        items: block.inverters
      }));
    }
    if (activeTab === 'ht-panel' && site.htPanelConfig?.blockNames) {
      return site.htPanelConfig.blockNames.map(blockName => ({
        id: blockName,
        name: blockName,
        items: ['incoming', 'outgoing'] // HT Panel has incoming/outgoing values
      }));
    }
    return [];
  };

  const blockStructure = getBlockStructure();

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-background border-b px-4 py-3 flex justify-between items-center">
          <h2 className="text-base font-semibold text-foreground">
            Historic Data - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h2>
          <div className="flex items-center gap-2">
            <Button 
              onClick={isEditMode ? handleSaveClick : () => setIsEditMode(true)} 
              size="sm" 
              className={cn(
                "gap-2",
                isEditMode ? "bg-verdo-navy hover:bg-verdo-navy/90" : "bg-muted hover:bg-muted/80"
              )}
            >
              {isEditMode ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {isEditMode ? 'Save' : 'Edit'}
            </Button>
            <ExportDialog
              title="Export Historic Data"
              description={`Select the date range for which you want to export historic ${activeTab.replace('-', ' ')} data:`}
              onExport={handleExportWithDateRange}
            >
              <Button 
                size="sm" 
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </ExportDialog>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="px-3 py-2 bg-gray-50 border-b flex flex-wrap gap-2 items-center text-xs">
          <Input
            type="search"
            placeholder="Search historic data..."
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
            {historicData.length} Records
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
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/50 text-foreground border-b-2">
                <th className="px-3 py-2 text-left font-semibold border-r w-24">Field</th>
                {blockStructure.length > 0 ? (
                  blockStructure.map(block => (
                    <CollapsibleBlockHeader
                      key={block.id}
                      blockName={block.name}
                      blockId={block.id}
                      inverterCount={block.items.length}
                      isExpanded={expandedBlocks[block.id]}
                      onToggle={() => toggleBlock(block.id)}
                    />
                  ))
                ) : (
                  tabColumns.filter(col => col.id !== 'date').map((column) => (
                    <th 
                      key={column.id}
                      className="px-3 py-2 text-left font-semibold border-r min-w-[100px] cursor-pointer hover:bg-muted/70"
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
                  ))
                )}
                <th className="px-3 py-2 text-center font-semibold w-32">Remarks</th>
              </tr>
              {blockStructure.length > 0 && Object.keys(expandedBlocks).some(key => expandedBlocks[key]) && (
                <tr className="bg-muted/40 text-foreground border-b">
                  <th className="px-3 py-2 border-r font-medium">Item</th>
                  {blockStructure.map(block => (
                    expandedBlocks[block.id] ? (
                      block.items.map((item: string) => (
                        <th key={`${block.id}-${item}`} className="px-2 py-1 text-center font-medium border border-gray-300 w-16">
                          {item}
                        </th>
                      ))
                    ) : null
                  ))}
                  <th className="px-2 py-1 border border-gray-300"></th>
                </tr>
              )}
            </thead>
            
            <tbody>
              {historicData.map((row, index) => {
                const isLocked = !isEditable(row.date);

                return (
                  <tr key={row.id} className={cn(
                    "hover:bg-muted/30 transition-colors",
                    index % 2 === 0 ? "bg-background" : "bg-muted/20"
                  )}>
                    <td className="px-3 py-2 border-r border-b">
                      <div className="text-xs py-1.5 px-2 bg-muted/50 rounded font-medium">
                        {format(new Date(row.date), 'dd-MMM-yy')}
                      </div>
                    </td>
                    {blockStructure.length > 0 ? (
                      blockStructure.map(block => {
                        if (expandedBlocks[block.id]) {
                          return block.items.map((item: string) => {
                            const columnId = `${block.name.toLowerCase()}${item}`;
                            const cellKey = `${row.date}-${columnId}`;
                            const currentValue = editedData[cellKey] !== undefined 
                              ? editedData[cellKey] 
                              : row.values[columnId] || '';
                            const hasChanges = editedData[cellKey] !== undefined;

                            return (
                              <td key={`${block.id}-${item}`} className="px-2 py-1 border border-gray-300">
                                <Input
                                  type="number"
                                  value={currentValue}
                                  onChange={(e) => handleCellEdit(row.date, columnId, e.target.value)}
                                  className={cn(
                                    "h-6 text-xs border-0 focus:bg-background focus:border focus:border-ring text-center",
                                    isEditMode ? "bg-blue-100" : "bg-gray-100",
                                    hasChanges && "bg-yellow-50 border border-yellow-300"
                                  )}
                                  readOnly={!isEditMode}
                                  step="0.01"
                                />
                              </td>
                            );
                          });
                        } else {
                          // Show aggregated value for collapsed block
                          const blockTotal = block.items.reduce((sum, item) => {
                            const columnId = `${block.name.toLowerCase()}${item}`;
                            return sum + (Number(row.values[columnId]) || 0);
                          }, 0);
                          return (
                            <td key={block.id} className="px-2 py-1 text-center border border-gray-300">
                              {blockTotal}
                            </td>
                          );
                        }
                      })
                    ) : (
                      tabColumns.filter(col => col.id !== 'date').map((column) => {
                        const cellKey = `${row.date}-${column.id}`;
                        const currentValue = editedData[cellKey] !== undefined 
                          ? editedData[cellKey] 
                          : row.values[column.id];
                        const hasChanges = editedData[cellKey] !== undefined;

                        return (
                          <td key={column.id} className="px-2 py-1 border border-gray-300">
                            <Input
                              type={column.type === 'number' ? 'number' : 'text'}
                              value={currentValue || ''}
                              onChange={(e) => handleCellEdit(row.date, column.id, e.target.value)}
                              className={cn(
                                "h-6 text-xs border-0 focus:bg-background focus:border focus:border-ring",
                                isEditMode ? "bg-blue-100" : "bg-gray-100",
                                hasChanges && "bg-yellow-50 border border-yellow-300"
                              )}
                              readOnly={!isEditMode}
                              step={column.type === 'number' ? '0.01' : undefined}
                            />
                          </td>
                        );
                      })
                    )}
                    <td className="px-2 py-1 border border-gray-300">
                      <Input
                        type="text"
                        value={editedData[`${row.date}-remarks`] !== undefined 
                          ? editedData[`${row.date}-remarks`] 
                          : row.values.remarks || ''}
                        onChange={(e) => handleCellEdit(row.date, 'remarks', e.target.value)}
                        className={cn(
                          "h-6 text-xs border-0 focus:bg-background focus:border focus:border-ring",
                          isEditMode ? "bg-blue-100" : "bg-gray-100",
                          editedData[`${row.date}-remarks`] !== undefined && "bg-yellow-50 border border-yellow-300"
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
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirmation}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        title="Save Changes"
        description={`Are you sure you want to save ${Object.keys(editedData).length} change(s) to the historic data?`}
        confirmText="Save"
        cancelText="Cancel"
      />
    </>
  );
};
