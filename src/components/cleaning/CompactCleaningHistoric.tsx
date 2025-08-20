import React, { useState, useMemo } from 'react';
import { format, parseISO, parse, isValid } from "date-fns";
import { Calendar, Filter, ChevronDown, ChevronRight, Search, Save, Download, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CleaningSiteData, CleaningHistoricEntry } from "@/types/cleaning";
import { cn } from "@/lib/utils";

interface CompactCleaningHistoricProps {
  data: CleaningSiteData | null;
}

// Helper function to safely parse and format dates
const safeDateFormat = (dateString: string, formatPattern: string): string => {
  try {
    const parsedDate = parseISO(dateString);
    if (isValid(parsedDate)) {
      return format(parsedDate, formatPattern);
    }
    // If parseISO fails, try to parse as dd-MMM-yy format
    const parsedDateCustom = parse(dateString, "dd-MMM-yy", new Date());
    if (isValid(parsedDateCustom)) {
      return format(parsedDateCustom, formatPattern);
    }
    // If both fail, return the original string
    return dateString;
  } catch (error) {
    console.warn(`Error formatting date: ${dateString}`, error);
    return dateString;
  }
};

export const CompactCleaningHistoric: React.FC<CompactCleaningHistoricProps> = ({ data }) => {
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

  const filteredHistoricData = useMemo(() => {
    if (!data || !data.historicEntries) return [];

    let filteredData = [...data.historicEntries];

    if (searchTerm) {
      filteredData = filteredData.filter(entry =>
        entry.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        safeDateFormat(entry.date, "dd-MMM-yy").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMonth && selectedMonth !== "all") {
      filteredData = filteredData.filter(entry => {
        const monthFromDate = safeDateFormat(entry.date, "MMM-yyyy");
        return monthFromDate === selectedMonth;
      });
    }

    return filteredData.sort((a, b) => {
      const dateA = parseISO(a.date) || parse(a.date, "dd-MMM-yy", new Date());
      const dateB = parseISO(b.date) || parse(b.date, "dd-MMM-yy", new Date());
      return dateB.getTime() - dateA.getTime();
    });
  }, [data, searchTerm, selectedMonth]);

  const availableMonths = useMemo(() => {
    if (!data || !data.historicEntries) return [];
    const months = new Set<string>();
    data.historicEntries.forEach(entry => {
      const month = safeDateFormat(entry.date, "MMM-yyyy");
      if (month && month !== entry.date) {
        months.add(month);
      }
    });
    return Array.from(months);
  }, [data]);

  // Calculate summary data
  const summaryData = useMemo(() => {
    if (!data) return null;
    
    const totalModules = data.blocks.reduce((total, block) => 
      total + block.inverters.reduce((blockTotal, inverter) => blockTotal + inverter.totalModules, 0), 0
    );
    
    const totalModulesCleaned = data.blocks.reduce((total, block) => 
      total + block.inverters.reduce((blockTotal, inverter) => blockTotal + inverter.modulesCleaned, 0), 0
    );
    
    const cyclesCompleted = totalModules > 0 ? totalModulesCleaned / totalModules : 0;
    
    return {
      totalModules,
      totalModulesCleaned,
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
      description: "Historic cleaning data has been updated successfully.",
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

    const filteredForExport = filteredHistoricData.filter(entry => {
      const entryDate = parseISO(entry.date) || parse(entry.date, "dd-MMM-yy", new Date());
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
        <span>Historic Cleaning Data</span>
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
                    Select the date range for which you want to export historic cleaning data:
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
          {filteredHistoricData.length} Records
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
                <th key={block.id} className="px-2 py-1 text-center font-medium border border-gray-300" colSpan={expandedBlocks[block.id] ? block.inverters.length : 1}>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBlock(block.id)}
                      className="h-5 w-5 p-0 hover:bg-blue-800 text-white"
                    >
                      {expandedBlocks[block.id] ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </Button>
                    <span className="text-xs">
                      {block.name} {!expandedBlocks[block.id] && `(${block.inverters.length})`}
                    </span>
                  </div>
                </th>
              ))}
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-verdo-navy w-20">Rainfall</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-verdo-navy w-32">Remarks</th>
            </tr>
            {Object.keys(expandedBlocks).some(key => expandedBlocks[key]) && (
              <tr className="bg-verdo-navy text-white">
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
              </tr>
            )}
          </thead>
          <tbody>
            {/* Summary rows */}
            {summaryData && (
              <>
                <tr className="bg-gray-100">
                  <td className="px-2 py-1 border border-gray-300 font-medium">Total Modules</td>
                  {data?.blocks.map(block => {
                    if (expandedBlocks[block.id]) {
                      return block.inverters.map(inverter => (
                        <td key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300">
                          {inverter.totalModules}
                        </td>
                      ));
                    } else {
                      const blockTotal = block.inverters.reduce((sum, inv) => sum + inv.totalModules, 0);
                      return (
                        <td key={block.id} className="px-2 py-1 text-center border border-gray-300">
                          {blockTotal}
                        </td>
                      );
                    }
                  })}
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 border border-gray-300"></td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="px-2 py-1 border border-gray-300 font-medium">Total Modules Cleaned</td>
                  {data?.blocks.map(block => {
                    if (expandedBlocks[block.id]) {
                      return block.inverters.map(inverter => (
                        <td key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300">
                          {inverter.modulesCleaned}
                        </td>
                      ));
                    } else {
                      const blockTotal = block.inverters.reduce((sum, inv) => sum + inv.modulesCleaned, 0);
                      return (
                        <td key={block.id} className="px-2 py-1 text-center border border-gray-300">
                          {blockTotal}
                        </td>
                      );
                    }
                  })}
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 border border-gray-300"></td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="px-2 py-1 border border-gray-300 font-medium">Cycles Completed</td>
                  {data?.blocks.map(block => {
                    if (expandedBlocks[block.id]) {
                      return block.inverters.map(inverter => (
                        <td key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300">
                          {inverter.totalModules > 0 ? (inverter.modulesCleaned / inverter.totalModules).toFixed(2) : '0.00'}
                        </td>
                      ));
                    } else {
                      const blockTotalModules = block.inverters.reduce((sum, inv) => sum + inv.totalModules, 0);
                      const blockTotalCleaned = block.inverters.reduce((sum, inv) => sum + inv.modulesCleaned, 0);
                      const blockCycles = blockTotalModules > 0 ? blockTotalCleaned / blockTotalModules : 0;
                      return (
                        <td key={block.id} className="px-2 py-1 text-center border border-gray-300">
                          {blockCycles.toFixed(2)}
                        </td>
                      );
                    }
                  })}
                  <td className="px-2 py-1 text-center border border-gray-300"></td>
                  <td className="px-2 py-1 border border-gray-300"></td>
                </tr>
              </>
            )}

            {/* Historic entries */}
            {filteredHistoricData.map((entry, index) => (
              <tr key={`${entry.date}-${index}`} className="bg-white">
                <td className="px-2 py-1 border border-gray-300">{safeDateFormat(entry.date, "dd-MMM-yy")}</td>
                {data?.blocks.map(block => {
                  if (expandedBlocks[block.id]) {
                    return block.inverters.map(inverter => {
                      const key = `${block.id}-${inverter.id}`;
                      const value = entry.inverterData[key] || '-';
                      const editKey = `${index}-inverter-${key}`;
                      const editedValue = editedData[editKey] !== undefined ? editedData[editKey] : value;
                      const hasChanges = editedData[editKey] !== undefined;
                      
                      return (
                        <td key={`${block.id}-${inverter.id}`} className={cn(
                          "px-2 py-1 text-center border border-gray-300",
                          isEditMode && value !== '-' && "bg-blue-100"
                        )}>
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
                      <td key={block.id} className={cn(
                        "px-2 py-1 text-center border border-gray-300",
                        isEditMode && "bg-blue-100"
                      )}>
                        {blockTotal}
                      </td>
                    );
                  }
                })}
                <td className="px-2 py-1 text-center border border-gray-300 bg-green-50">
                  {entry.rainfallMM}
                </td>
                <td className={cn(
                  "px-2 py-1 border border-gray-300",
                  isEditMode && "bg-blue-100"
                )}>
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
