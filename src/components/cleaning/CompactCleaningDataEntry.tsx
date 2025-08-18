import React, { useState } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Save, Upload, Table, FileText, Plus, Trash2 } from "lucide-react";
import { CleaningSiteData, CleaningDailyEntry } from "@/types/cleaning";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { BulkUploadModal } from '../grassCutting/BulkUploadModal';
import { cn } from "@/lib/utils";

interface CompactCleaningDataEntryProps {
  data: CleaningSiteData | null;
  onDataChange?: (data: CleaningSiteData) => void;
}

interface FormRow {
  id: string;
  blockId: string;
  inverterId: string;
  modulesCleaned: string;
  remarks: string;
}

export const CompactCleaningDataEntry: React.FC<CompactCleaningDataEntryProps> = ({ data, onDataChange }) => {
  const [viewMode, setViewMode] = useState<'table' | 'form'>('form');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [rainfall, setRainfall] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [rows, setRows] = useState<FormRow[]>([
    { id: '1', blockId: '', inverterId: '', modulesCleaned: '', remarks: '' }
  ]);

  if (!data) {
    return (
      <div className="bg-white rounded border p-4 text-center text-gray-500 text-sm">
        Select client and site to view data
      </div>
    );
  }

  const currentEntry = data.dailyEntries[0] || {
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
    inverterData: {},
    plannedModules: 0,
    totalCleaned: 0,
    totalUncleaned: 0,
    rainfallMM: "",
    remarks: ""
  };

  const getInvertersForBlock = (blockId: string) => {
    const block = data.blocks.find(b => b.id === blockId);
    return block ? block.inverters : [];
  };

  const getSelectedInverterData = (blockId: string, inverterId: string) => {
    const block = data.blocks.find(b => b.id === blockId);
    if (!block) return null;
    return block.inverters.find(inv => inv.id === inverterId) || null;
  };

  const handleRowChange = (rowId: string, field: keyof FormRow, value: string) => {
    setRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  const addRow = () => {
    const newId = (Math.max(...rows.map(r => parseInt(r.id))) + 1).toString();
    setRows(prev => [...prev, { id: newId, blockId: '', inverterId: '', modulesCleaned: '', remarks: '' }]);
  };

  const removeRow = (rowId: string) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(row => row.id !== rowId));
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setEditValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onDataChange) {
      const newData = { ...data };
      const updatedEntry: CleaningDailyEntry = {
        ...currentEntry,
        inverterData: { ...currentEntry.inverterData },
        rainfallMM: rainfall || currentEntry.rainfallMM,
        remarks: remarks || currentEntry.remarks
      };

      // Update inverter data
      data.blocks.forEach(block => {
        block.inverters.forEach(inverter => {
          const key = `${block.id}-${inverter.id}`;
          if (editValues[key]) {
            updatedEntry.inverterData[key] = Number(editValues[key]) || 0;
          }
        });
      });

      // Calculate totals
      updatedEntry.totalCleaned = Object.values(updatedEntry.inverterData).reduce((sum, val) => sum + (val || 0), 0);
      updatedEntry.totalUncleaned = data.blocks.reduce((sum, block) => 
        sum + block.inverters.reduce((blockSum, inv) => blockSum + inv.totalModules, 0), 0
      ) - updatedEntry.totalCleaned;

      if (newData.dailyEntries.length > 0) {
        newData.dailyEntries[0] = updatedEntry;
      } else {
        newData.dailyEntries = [updatedEntry];
      }
      
      onDataChange(newData);
      console.log('Saved cleaning data entry');
    }
  };

  const handleBulkUpload = (uploadedData: any[]) => {
    console.log('Bulk upload data:', uploadedData);
    uploadedData.forEach(row => {
      if (row['Block-Inverter'] && row['Daily Cleaning']) {
        setEditValues(prev => ({
          ...prev,
          [row['Block-Inverter']]: row['Daily Cleaning']
        }));
      }
      if (row['Rainfall MM']) {
        setRainfall(row['Rainfall MM']);
      }
      if (row['Remarks']) {
        setRemarks(row['Remarks']);
      }
      if (row['Date']) {
        try {
          const date = new Date(row['Date']);
          if (!isNaN(date.getTime())) {
            setSelectedDate(date);
          }
        } catch (e) {
          console.warn('Invalid date format:', row['Date']);
        }
      }
    });
  };

  const SearchableSelect = ({ 
    value, 
    onValueChange, 
    placeholder, 
    options,
    disabled = false 
  }: {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: { id: string; name?: string }[];
    disabled?: boolean;
  }) => {
    const [open, setOpen] = useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-8 text-xs"
            disabled={disabled}
          >
            {value
              ? options.find((option) => option.id === value)?.name || options.find((option) => option.id === value)?.id
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} className="h-8" />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue);
                      setOpen(false);
                    }}
                    className="text-xs"
                  >
                    {option.name || option.id}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const renderTableView = () => (
    <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0">
          <tr className="bg-blue-900 text-white">
            <th className="px-2 py-1 text-left font-medium border border-gray-300 w-32">Field</th>
            {data.blocks.map(block => (
              <th key={block.id} className="px-2 py-1 text-center font-medium border border-gray-300" colSpan={block.inverters.length}>
                {block.name}
              </th>
            ))}
            <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Planned</th>
            <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Cleaned</th>
            <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Uncleaned</th>
            <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500">Rainfall</th>
            <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500">Remarks</th>
          </tr>
          <tr className="bg-blue-800 text-white">
            <th className="px-2 py-1 text-left font-medium border border-gray-300">Inverter</th>
            {data.blocks.map(block => (
              block.inverters.map(inverter => (
                <th key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center font-medium border border-gray-300 w-16">
                  {inverter.id}
                </th>
              ))
            ))}
            <th className="px-2 py-1 border border-gray-300"></th>
            <th className="px-2 py-1 border border-gray-300"></th>
            <th className="px-2 py-1 border border-gray-300"></th>
            <th className="px-2 py-1 border border-gray-300"></th>
            <th className="px-2 py-1 border border-gray-300"></th>
          </tr>
        </thead>
        <tbody>
          {/* Total Modules */}
          <tr className="bg-blue-50">
            <td className="px-2 py-1 font-medium border border-gray-300">Total Modules</td>
            {data.blocks.map(block => (
              block.inverters.map(inverter => (
                <td key={`total-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-blue-100">
                  {inverter.totalModules}
                </td>
              ))
            ))}
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
          </tr>

          {/* Modules Cleaned */}
          <tr className="bg-blue-50">
            <td className="px-2 py-1 font-medium border border-gray-300">Modules Cleaned</td>
            {data.blocks.map(block => (
              block.inverters.map(inverter => (
                <td key={`cleaned-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-blue-100">
                  {inverter.modulesCleaned}
                </td>
              ))
            ))}
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
          </tr>

          {/* % Completed */}
          <tr className="bg-green-50">
            <td className="px-2 py-1 font-medium border border-gray-300">% Completed</td>
            {data.blocks.map(block => (
              block.inverters.map(inverter => (
                <td key={`percent-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-green-100">
                  {inverter.percentCompleted}%
                </td>
              ))
            ))}
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
            <td className="px-2 py-1 border border-gray-300"></td>
          </tr>

          {/* Daily Entry */}
          <tr className="bg-yellow-50">
            <td className="px-2 py-1 font-medium border border-gray-300">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "h-6 px-2 justify-start text-left font-normal text-xs",
                      "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {format(selectedDate, "dd-MMM-yy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </td>
            {data.blocks.map(block => (
              block.inverters.map(inverter => {
                const key = `${block.id}-${inverter.id}`;
                return (
                  <td key={`input-${key}`} className="px-2 py-1 text-center border border-gray-300 bg-yellow-100">
                    <input 
                      type="number" 
                      className="w-full h-6 text-center text-xs border-0 bg-transparent focus:bg-white"
                      defaultValue={currentEntry.inverterData[key] || 0}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                  </td>
                );
              })
            ))}
            <td className="px-2 py-1 text-center border border-gray-300 bg-green-100">
              {currentEntry.plannedModules}
            </td>
            <td className="px-2 py-1 text-center border border-gray-300 bg-green-100">
              {currentEntry.totalCleaned}
            </td>
            <td className="px-2 py-1 text-center border border-gray-300 bg-green-100">
              {currentEntry.totalUncleaned}
            </td>
            <td className="px-2 py-1 text-center border border-gray-300 bg-yellow-100">
              <input 
                className="w-full h-6 text-center text-xs border-0 bg-transparent focus:bg-white"
                placeholder={currentEntry.rainfallMM}
                value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
              />
            </td>
            <td className="px-2 py-1 text-center border border-gray-300 bg-yellow-100">
              <input 
                className="w-full h-6 text-center text-xs border-0 bg-transparent focus:bg-white"
                placeholder={currentEntry.remarks}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderFormView = () => (
    <div className="p-4 space-y-4">
      {/* Date Selection */}
      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm">Select Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal h-8 text-xs",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date > new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Form Table */}
      <div className="space-y-2">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-[#1e3a8a] text-white">
                <th className="border border-gray-300 px-2 py-1.5 text-left font-medium min-w-[120px]">Block</th>
                <th className="border border-gray-300 px-2 py-1.5 text-left font-medium min-w-[120px]">Inverter</th>
                <th className="border border-gray-300 px-2 py-1.5 text-left font-medium min-w-[100px]">Modules Cleaned</th>
                <th className="border border-gray-300 px-2 py-1.5 text-left font-medium min-w-[150px]">Remarks</th>
                <th className="border border-gray-300 px-2 py-1.5 text-center font-medium min-w-[80px]">Total Modules</th>
                <th className="border border-gray-300 px-2 py-1.5 text-center font-medium min-w-[80px]">% Completed</th>
                <th className="border border-gray-300 px-2 py-1.5 text-center font-medium min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const selectedInverter = getSelectedInverterData(row.blockId, row.inverterId);
                return (
                  <tr key={row.id} className="bg-white">
                    <td className="border border-gray-300 p-1">
                      <SearchableSelect
                        value={row.blockId}
                        onValueChange={(value) => {
                          handleRowChange(row.id, 'blockId', value);
                          handleRowChange(row.id, 'inverterId', ''); // Reset inverter when block changes
                        }}
                        placeholder="Select Block"
                        options={data.blocks}
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <SearchableSelect
                        value={row.inverterId}
                        onValueChange={(value) => handleRowChange(row.id, 'inverterId', value)}
                        placeholder="Select Inverter"
                        options={getInvertersForBlock(row.blockId)}
                        disabled={!row.blockId}
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <Input
                        type="number"
                        value={row.modulesCleaned}
                        onChange={(e) => handleRowChange(row.id, 'modulesCleaned', e.target.value)}
                        placeholder="0"
                        className="h-8 text-xs text-center"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <Textarea
                        value={row.remarks}
                        onChange={(e) => handleRowChange(row.id, 'remarks', e.target.value)}
                        placeholder="Enter remarks..."
                        className="min-h-[32px] text-xs resize-none"
                      />
                    </td>
                    <td className="border border-gray-300 p-1 text-center bg-blue-50">
                      <span className="text-xs font-medium">
                        {selectedInverter ? selectedInverter.totalModules : '-'}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-1 text-center bg-green-50">
                      <span className="text-xs font-medium">
                        {selectedInverter ? `${selectedInverter.percentCompleted}%` : '-'}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-1 text-center">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length === 1}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addRow}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded border">
      <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span>Enter Cleaning Data</span>
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && setViewMode(value as "form" | "table")}
            className="bg-white/10 rounded p-1"
          >
            <ToggleGroupItem 
              value="form" 
              size="sm"
              className="text-white data-[state=on]:bg-white data-[state=on]:text-[#1e3a8a] px-3 py-1 text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              Form
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="table" 
              size="sm"
              className="text-white data-[state=on]:bg-white data-[state=on]:text-[#1e3a8a] px-3 py-1 text-xs"
            >
              <Table className="h-3 w-3 mr-1" />
              Table
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex gap-2">
          <BulkUploadModal onUpload={handleBulkUpload} />
          <Button 
            onClick={handleSave}
            size="sm" 
            className="gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-xs"
          >
            <Save className="h-3 w-3" />
            Save
          </Button>
        </div>
      </div>
      
      {/* Compact Legend - only show in table view */}
      {viewMode === 'table' && (
        <div className="px-3 py-2 bg-gray-50 border-b text-xs flex gap-4">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300"></div>
            Static
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300"></div>
            Calculated
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300"></div>
            Input
          </span>
        </div>
      )}

      {viewMode === 'table' ? renderTableView() : renderFormView()}
    </div>
  );
};
