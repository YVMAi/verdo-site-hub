
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
  stringsCleaned: string;
  remarks: string;
  totalStrings: number;
  percentCompleted: number;
}

export const GrassCuttingForm: React.FC<GrassCuttingFormProps> = ({ data, onDataChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formRows, setFormRows] = useState<FormRow[]>([
    {
      id: '1',
      blockId: '',
      inverterId: '',
      stringsCleaned: '0',
      remarks: '',
      totalStrings: 0,
      percentCompleted: 0
    }
  ]);

  if (!data) {
    return (
      <div className="text-center text-gray-500 text-sm">
        Select client and site to view data
      </div>
    );
  }

  const getInvertersForBlock = (blockId: string) => {
    const block = data.blocks.find(b => b.id === blockId);
    return block ? block.inverters : [];
  };

  const updateFormRow = (id: string, field: keyof FormRow, value: string | number) => {
    setFormRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        // Update related fields when block or inverter changes
        if (field === 'blockId') {
          updatedRow.inverterId = '';
          updatedRow.totalStrings = 0;
          updatedRow.percentCompleted = 0;
        } else if (field === 'inverterId' && updatedRow.blockId) {
          const block = data.blocks.find(b => b.id === updatedRow.blockId);
          const inverter = block?.inverters.find(i => i.id === value);
          if (inverter) {
            updatedRow.totalStrings = inverter.totalStrings;
            const cleaned = parseInt(updatedRow.stringsCleaned) || 0;
            updatedRow.percentCompleted = Math.round((cleaned / inverter.totalStrings) * 100);
          }
        } else if (field === 'stringsCleaned') {
          const cleaned = parseInt(value as string) || 0;
          if (updatedRow.totalStrings > 0) {
            updatedRow.percentCompleted = Math.round((cleaned / updatedRow.totalStrings) * 100);
          }
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  const addFormRow = () => {
    const newRow: FormRow = {
      id: Date.now().toString(),
      blockId: '',
      inverterId: '',
      stringsCleaned: '0',
      remarks: '',
      totalStrings: 0,
      percentCompleted: 0
    };
    setFormRows(prev => [...prev, newRow]);
  };

  const removeFormRow = (id: string) => {
    if (formRows.length > 1) {
      setFormRows(prev => prev.filter(row => row.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium min-w-20">Select Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                "border-gray-300"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "MMMM do, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Form Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-verdo-navy text-white">
          <div className="grid grid-cols-7 gap-0 text-sm font-medium">
            <div className="px-4 py-3 border-r border-white/20">Block</div>
            <div className="px-4 py-3 border-r border-white/20">Inverter</div>
            <div className="px-4 py-3 border-r border-white/20">Strings Cleaned</div>
            <div className="px-4 py-3 border-r border-white/20">Remarks</div>
            <div className="px-4 py-3 border-r border-white/20">Total Strings</div>
            <div className="px-4 py-3 border-r border-white/20">Completed %</div>
            <div className="px-4 py-3">Actions</div>
          </div>
        </div>

        <div className="divide-y">
          {formRows.map((row) => (
            <div key={row.id} className="grid grid-cols-7 gap-0 items-center">
              <div className="px-2 py-2 border-r">
                <Select value={row.blockId} onValueChange={(value) => updateFormRow(row.id, 'blockId', value)}>
                  <SelectTrigger className="h-8 border-0 shadow-none">
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
              </div>
              
              <div className="px-2 py-2 border-r">
                <Select 
                  value={row.inverterId} 
                  onValueChange={(value) => updateFormRow(row.id, 'inverterId', value)}
                  disabled={!row.blockId}
                >
                  <SelectTrigger className="h-8 border-0 shadow-none">
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
              </div>
              
              <div className="px-2 py-2 border-r">
                <Input
                  type="number"
                  value={row.stringsCleaned}
                  onChange={(e) => updateFormRow(row.id, 'stringsCleaned', e.target.value)}
                  className="h-8 border-0 shadow-none"
                  min="0"
                />
              </div>
              
              <div className="px-2 py-2 border-r">
                <Input
                  value={row.remarks}
                  onChange={(e) => updateFormRow(row.id, 'remarks', e.target.value)}
                  placeholder="Enter remarks..."
                  className="h-8 border-0 shadow-none"
                />
              </div>
              
              <div className="px-4 py-2 border-r text-center text-sm bg-gray-100">
                {row.totalStrings || '-'}
              </div>
              
              <div className="px-4 py-2 border-r text-center text-sm bg-gray-100">
                {row.percentCompleted || '-'}%
              </div>
              
              <div className="px-2 py-2 flex items-center justify-center gap-1">
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFormRow(row.id)}
                    disabled={formRows.length === 1}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-gray-600">Delete</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addFormRow}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-gray-600">Add</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
