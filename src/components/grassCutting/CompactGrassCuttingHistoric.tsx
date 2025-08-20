import React, { useState, useMemo } from 'react';
import { format, parseISO, parse } from "date-fns";
import { Calendar, Filter, ChevronDown, ChevronRight, Search, RefreshCw, Save, Download, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { GrassCuttingSiteData, GrassCuttingHistoricEntry } from "@/types/grassCutting";
import { CollapsibleBlockHeader } from "./CollapsibleBlockHeader";
import { cn } from "@/lib/utils";

interface CompactGrassCuttingHistoricProps {
  data: GrassCuttingSiteData | null;
}

// Helper function to parse the date format used in the data (dd-MMM-yy)
const parseDateString = (dateString: string): Date => {
  try {
    // First try to parse as ISO format
    const isoDate = parseISO(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    
    // If that fails, try to parse as dd-MMM-yy format
    const parsedDate = parse(dateString, "dd-MMM-yy", new Date());
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    
    // If both fail, return current date as fallback
    console.warn(`Unable to parse date: ${dateString}`);
    return new Date();
  } catch (error) {
    console.warn(`Error parsing date: ${dateString}`, error);
    return new Date();
  }
};

export const CompactGrassCuttingHistoric: React.FC<CompactGrassCuttingHistoricProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [expandedBlocks, setExpandedBlocks] = useState<{[key: string]: boolean}>({});
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [exportStartDate, setExportStartDate] = useState<Date | undefined>();
  const [exportEndDate, setExportEndDate] = useState<Date | undefined>();
  const { toast } = useToast();

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  const historicEntries: GrassCuttingHistoricEntry[] = useMemo(() => {
    if (!data || !data.historicEntries) return [];

    let filteredEntries = [...data.historicEntries];

    if (searchTerm) {
      filteredEntries = filteredEntries.filter(entry =>
        entry.remarks.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMonth && selectedMonth !== "all") {
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = parseDateString(entry.date);
        const entryMonth = format(entryDate, "MMM-yyyy");
        return entryMonth === selectedMonth;
      });
    }

    return filteredEntries.sort((a, b) => {
      const dateA = parseDateString(a.date);
      const dateB = parseDateString(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [data, searchTerm, selectedMonth]);

  const availableMonths = useMemo(() => {
    if (!data || !data.historicEntries) return [];
    const months = new Set<string>();
    data.historicEntries.forEach(entry => {
      const entryDate = parseDateString(entry.date);
      months.add(format(entryDate, "MMM-yyyy"));
    });
    return Array.from(months);
  }, [data]);

  // Calculate summary data
  const summaryData = useMemo(() => {
    if (!data) return null;
    
    const totalStrings = data.blocks.reduce((total, block) => 
      total + block.inverters.reduce((blockTotal, inverter) => blockTotal + inverter.totalStrings, 0), 0
    );
    
    const totalStringsCleaned = data.blocks.reduce((total, block) => 
      total + block.inverters.reduce((blockTotal, inverter) => blockTotal + inverter.grassCuttingDone, 0), 0
    );
    
    const cyclesCompleted = totalStrings > 0 ? totalStringsCleaned / totalStrings : 0;
    
    return {
      totalStrings,
      totalStringsCleaned,
      cyclesCompleted
    };
  }, [data]);

  const handleCellEdit = (entryIndex: number, field: string, value: any) => {
    const key = `${entryIndex}-${field}`;
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = () => {
    console.log('Saving changes:', editedData);
    toast({
      title: "Changes Saved",
      description: "Historic grass cutting data has been updated successfully.",
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

    const filteredForExport = historicEntries.filter(entry => {
      const entryDate = parseDateString(entry.date);
      return entryDate >= exportStartDate && entryDate <= exportEndDate;
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

  return (
    <div className="bg-white rounded border">
      <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <span>Historic Grass Cutting Data</span>
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
            <Button 
              onClick={() => setIsEditMode(!isEditMode)} 
              variant="outline" 
              size="sm" 
              className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <span className="text-xs mt-1">Edit</span>
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
                    Select the date range for which you want to export historic grass cutting data:
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
          <div className="flex flex-col items-center">
            <Button variant="outline" size="sm" className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <span className="text-xs mt-1">Refresh</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="px-3 py-2 bg-gray-50 border-b flex flex-wrap gap-2 items-center text-xs">
        <Input
          type="search"
          placeholder="Search remarks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-7 text-xs flex-1 min-w-[120px]"
        />
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue placeholder="Filter by month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {availableMonths.map(month => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary">
          {historicEntries.length} Records
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
              {data?.blocks.map(block => (
                <CollapsibleBlockHeader
                  key={block.id}
                  blockName={block.name}
                  blockId={block.id}
                  inverterCount={block.inverters.length}
                  isExpanded={expandedBlocks[block.id]}
                  onToggle={() => toggleBlock(block.id)}
                />
              ))}
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600 w-20">Planned</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600 w-20">Actual</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600 w-20">Deviation</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500 w-32">Remarks</th>
            </tr>
            {Object.keys(expandedBlocks).some(key => expandedBlocks[key]) && (
              <tr className="bg-verdo-navy-light text-white">
                <th className="px-2 py-1 border border-gray-300">Inverter</th>
                {data?.blocks.map(block => (
                  expandedBlocks[block.id] ? (
                    block.inverters.map(inverter => (
                      <th key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center font-medium border border-gray-300 w-16">
                        {inverter.id}
                      </th>
                    ))
                  ) : null
                ))}
                <th className="px-2 py-1 border border-gray-300"></th>
                <th className="px-2 py-1 border border-gray-300"></th>
                <th className="px-2 py-1 border border-gray-300"></th>
                <th className="px-2 py-1 border border-gray-300"></th>
              </tr>
            )}
          </thead>
          <tbody>
            {/* Summary rows */}
            {summaryData && (
              <>
                <tr className="bg-gray-100">
                  <td className="px-2 py-1 border border-gray-300 font-medium">Total Strings</td>
                  {data?.blocks.map(block => {
                    if (expandedBlocks[block.id]) {
                      return block.inverters.map(inverter => (
                        <td key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300">
                          {inverter.totalStrings}
                        </td>
                      ));
                    } else {
                      const blockTotal = block.inverters.reduce((sum, inv) => sum + inv.totalStrings, 0);
                      return (
                        <td key={block.id} className="px-2 py-1 text-center border border-gray-300">
                          {blockTotal}
                        </td>
                      );
                    }
                  })}
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 border border-gray-300"></td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="px-2 py-1 border border-gray-300 font-medium">Total Strings Cleaned</td>
                  {data?.blocks.map(block => {
                    if (expandedBlocks[block.id]) {
                      return block.inverters.map(inverter => (
                        <td key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300">
                          {inverter.grassCuttingDone}
                        </td>
                      ));
                    } else {
                      const blockTotal = block.inverters.reduce((sum, inv) => sum + inv.grassCuttingDone, 0);
                      return (
                        <td key={block.id} className="px-2 py-1 text-center border border-gray-300">
                          {blockTotal}
                        </td>
                      );
                    }
                  })}
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 border border-gray-300"></td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="px-2 py-1 border border-gray-300 font-medium">Cycles Completed</td>
                  {data?.blocks.map(block => {
                    if (expandedBlocks[block.id]) {
                      return block.inverters.map(inverter => (
                        <td key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300">
                          {inverter.totalStrings > 0 ? (inverter.grassCuttingDone / inverter.totalStrings).toFixed(2) : '0.00'}
                        </td>
                      ));
                    } else {
                      const blockTotalStrings = block.inverters.reduce((sum, inv) => sum + inv.totalStrings, 0);
                      const blockTotalCleaned = block.inverters.reduce((sum, inv) => sum + inv.grassCuttingDone, 0);
                      const blockCycles = blockTotalStrings > 0 ? blockTotalCleaned / blockTotalStrings : 0;
                      return (
                        <td key={block.id} className="px-2 py-1 text-center border border-gray-300">
                          {blockCycles.toFixed(2)}
                        </td>
                      );
                    }
                  })}
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 border border-gray-300"></td>
                </tr>
              </>
            )}

            {/* Historic entries */}
            {historicEntries.map((entry, index) => (
              <tr key={`${entry.date}-${index}`} className="bg-white">
                <td className="px-2 py-1 border border-gray-300">{entry.date}</td>
                {data?.blocks.map(block => {
                  if (expandedBlocks[block.id]) {
                    return block.inverters.map(inverter => {
                      const key = `${block.id}-${inverter.id}`;
                      const value = entry.inverterData[key] || '-';
                      const editKey = `${index}-inverter-${key}`;
                      const editedValue = editedData[editKey] !== undefined ? editedData[editKey] : value;
                      const hasChanges = editedData[editKey] !== undefined;
                      
                      return (
                        <td key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300">
                          {isEditMode && value !== '-' ? (
                            <Input
                              type="number"
                              value={editedValue}
                              onChange={(e) => handleCellEdit(index, `inverter-${key}`, e.target.value)}
                              className={cn(
                                "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring text-center",
                                hasChanges && "bg-yellow-50 border border-yellow-300"
                              )}
                            />
                          ) : (
                            value
                          )}
                        </td>
                      );
                    });
                  } else {
                    const blockTotal = Object.keys(entry.inverterData)
                      .filter(key => key.startsWith(`${block.id}-`))
                      .reduce((sum, key) => sum + (Number(entry.inverterData[key]) || 0), 0);
                    return (
                      <td key={block.id} className="px-2 py-1 text-center border border-gray-300">
                        {blockTotal}
                      </td>
                    );
                  }
                })}
                <td className="px-2 py-1 text-center border border-gray-300 bg-green-50">
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={editedData[`${index}-plannedStrings`] !== undefined 
                        ? editedData[`${index}-plannedStrings`] 
                        : entry.plannedStrings}
                      onChange={(e) => handleCellEdit(index, 'plannedStrings', e.target.value)}
                      className={cn(
                        "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring text-center",
                        editedData[`${index}-plannedStrings`] !== undefined && "bg-yellow-50 border border-yellow-300"
                      )}
                    />
                  ) : (
                    entry.plannedStrings
                  )}
                </td>
                <td className="px-2 py-1 text-center border border-gray-300 bg-green-50">
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={editedData[`${index}-dailyActual`] !== undefined 
                        ? editedData[`${index}-dailyActual`] 
                        : entry.dailyActual}
                      onChange={(e) => handleCellEdit(index, 'dailyActual', e.target.value)}
                      className={cn(
                        "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring text-center",
                        editedData[`${index}-dailyActual`] !== undefined && "bg-yellow-50 border border-yellow-300"
                      )}
                    />
                  ) : (
                    entry.dailyActual
                  )}
                </td>
                <td className="px-2 py-1 text-center border border-gray-300 bg-green-50">
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={editedData[`${index}-deviation`] !== undefined 
                        ? editedData[`${index}-deviation`] 
                        : entry.deviation}
                      onChange={(e) => handleCellEdit(index, 'deviation', e.target.value)}
                      className={cn(
                        "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring text-center",
                        editedData[`${index}-deviation`] !== undefined && "bg-yellow-50 border border-yellow-300"
                      )}
                    />
                  ) : (
                    entry.deviation
                  )}
                </td>
                <td className="px-2 py-1 border border-gray-300">
                  {isEditMode ? (
                    <Input
                      value={editedData[`${index}-remarks`] !== undefined 
                        ? editedData[`${index}-remarks`] 
                        : entry.remarks}
                      onChange={(e) => handleCellEdit(index, 'remarks', e.target.value)}
                      className={cn(
                        "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                        editedData[`${index}-remarks`] !== undefined && "bg-yellow-50 border border-yellow-300"
                      )}
                    />
                  ) : (
                    entry.remarks
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
