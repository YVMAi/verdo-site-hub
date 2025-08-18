
import React, { useState } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Save, Plus, Trash2 } from "lucide-react";
import { GrassCuttingSiteData } from "@/types/grassCutting";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface GrassCuttingFormProps {
  data: GrassCuttingSiteData | null;
  onDataChange?: (data: GrassCuttingSiteData) => void;
}

interface FormRow {
  id: string;
  blockId: string;
  inverterId: string;
  remarks: string;
}

export const GrassCuttingForm: React.FC<GrassCuttingFormProps> = ({ data, onDataChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [rows, setRows] = useState<FormRow[]>([
    { id: '1', blockId: '', inverterId: '', remarks: '' }
  ]);

  if (!data) {
    return (
      <div className="bg-white rounded border p-8 text-center text-gray-500">
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
    setRows(prev => [...prev, { id: newId, blockId: '', inverterId: '', remarks: '' }]);
  };

  const removeRow = (rowId: string) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(row => row.id !== rowId));
    }
  };

  const handleSave = () => {
    const dataToSave = {
      date: format(selectedDate, "dd-MMM-yy"),
      rows: rows,
    };
    
    console.log('Saving grass cutting data:', dataToSave);
    if (onDataChange) {
      // This would update the parent with the new data
    }
  };

  return (
    <div className="bg-white rounded border p-6">
      <div className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="date">Select Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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

        {/* Table Form */}
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium">Block</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium">Inverter</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium">Remarks</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-medium">Total Strings</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-medium">% Completed</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const selectedInverter = getSelectedInverterData(row.blockId, row.inverterId);
                  return (
                    <tr key={row.id} className="bg-white">
                      <td className="border border-gray-300 p-2">
                        <Select
                          value={row.blockId}
                          onValueChange={(value) => {
                            handleRowChange(row.id, 'blockId', value);
                            handleRowChange(row.id, 'inverterId', ''); // Reset inverter when block changes
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Block" />
                          </SelectTrigger>
                          <SelectContent>
                            {data.blocks.map(block => (
                              <SelectItem key={block.id} value={block.id}>
                                {block.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Select
                          value={row.inverterId}
                          onValueChange={(value) => handleRowChange(row.id, 'inverterId', value)}
                          disabled={!row.blockId}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Inverter" />
                          </SelectTrigger>
                          <SelectContent>
                            {getInvertersForBlock(row.blockId).map(inverter => (
                              <SelectItem key={inverter.id} value={inverter.id}>
                                {inverter.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Textarea
                          value={row.remarks}
                          onChange={(e) => handleRowChange(row.id, 'remarks', e.target.value)}
                          placeholder="Enter remarks..."
                          className="min-h-[60px] resize-none"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center bg-blue-50">
                        <span className="text-sm font-medium">
                          {selectedInverter ? selectedInverter.totalStrings : '-'}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-2 text-center bg-green-50">
                        <span className="text-sm font-medium">
                          {selectedInverter ? `${selectedInverter.percentCompleted}%` : '-'}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeRow(row.id)}
                            disabled={rows.length === 1}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addRow}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4" />
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

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4" />
            Save Data
          </Button>
        </div>
      </div>
    </div>
  );
};
