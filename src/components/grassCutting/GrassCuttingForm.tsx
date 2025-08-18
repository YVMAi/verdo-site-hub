
import React, { useState } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { GrassCuttingSiteData } from "@/types/grassCutting";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface GrassCuttingFormProps {
  data: GrassCuttingSiteData | null;
  onDataChange?: (data: GrassCuttingSiteData) => void;
}

interface FormRow {
  id: string;
  blockId: string;
  inverterId: string;
  stringsCleaned: string;
  remarks: string;
}

export const GrassCuttingForm: React.FC<GrassCuttingFormProps> = ({ data, onDataChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [rows, setRows] = useState<FormRow[]>([
    { id: '1', blockId: '', inverterId: '', stringsCleaned: '', remarks: '' }
  ]);

  if (!data) {
    return (
      <div className="bg-white rounded border p-6 text-center text-gray-500">
        Select client and site to view data
      </div>
    );
  }

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
    setRows(prev => [...prev, { id: newId, blockId: '', inverterId: '', stringsCleaned: '', remarks: '' }]);
  };

  const removeRow = (rowId: string) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(row => row.id !== rowId));
    }
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

  return (
    <div className="bg-white rounded border p-4">
      <div className="space-y-4">
        {/* Date Selection */}
        <div className="space-y-1">
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
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Compact Table Form */}
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border border-gray-300 px-2 py-1.5 text-left font-medium min-w-[120px]">Block</th>
                  <th className="border border-gray-300 px-2 py-1.5 text-left font-medium min-w-[120px]">Inverter</th>
                  <th className="border border-gray-300 px-2 py-1.5 text-left font-medium min-w-[100px]">Strings Cleaned</th>
                  <th className="border border-gray-300 px-2 py-1.5 text-left font-medium min-w-[150px]">Remarks</th>
                  <th className="border border-gray-300 px-2 py-1.5 text-center font-medium min-w-[80px]">Total Strings</th>
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
                          value={row.stringsCleaned}
                          onChange={(e) => handleRowChange(row.id, 'stringsCleaned', e.target.value)}
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
                          {selectedInverter ? selectedInverter.totalStrings : '-'}
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
    </div>
  );
};
