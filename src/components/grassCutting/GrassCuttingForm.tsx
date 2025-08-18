
import React, { useState } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import { GrassCuttingSiteData } from "@/types/grassCutting";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface GrassCuttingFormProps {
  data: GrassCuttingSiteData | null;
  onDataChange?: (data: GrassCuttingSiteData) => void;
}

export const GrassCuttingForm: React.FC<GrassCuttingFormProps> = ({ data, onDataChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({});
  const [rainfall, setRainfall] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  if (!data) {
    return (
      <div className="bg-white rounded border p-8 text-center text-gray-500">
        Select client and site to view data
      </div>
    );
  }

  const handleInputChange = (key: string, value: string) => {
    setInputValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const dataToSave = {
      date: format(selectedDate, "dd-MMM-yy"),
      inverterData: inputValues,
      rainfall,
      remarks,
      totalPlanned: Object.values(inputValues).reduce((sum, val) => sum + (parseInt(val) || 0), 0),
      totalActual: Object.values(inputValues).reduce((sum, val) => sum + (parseInt(val) || 0), 0),
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
          <Label htmlFor="date">Date</Label>
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
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Inverter Data Grid */}
        <div className="space-y-4">
          <Label>Grass Cutting Data by Block/Inverter</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.blocks.map(block => (
              <div key={block.id} className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 border-b pb-1">{block.name}</h4>
                <div className="space-y-2">
                  {block.inverters.map(inverter => {
                    const key = `${block.id}-${inverter.id}`;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <Label className="text-xs w-16 flex-shrink-0">{inverter.id}:</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-8 text-sm"
                          value={inputValues[key] || ""}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                        />
                        <span className="text-xs text-gray-500 w-12">
                          ({inverter.totalStrings} strings)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-xs text-gray-600">Total Planned</Label>
              <div className="font-medium">
                {Object.values(inputValues).reduce((sum, val) => sum + (parseInt(val) || 0), 0)}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Total Actual</Label>
              <div className="font-medium">
                {Object.values(inputValues).reduce((sum, val) => sum + (parseInt(val) || 0), 0)}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Deviation</Label>
              <div className="font-medium">0</div>
            </div>
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rainfall">Rainfall (MM)</Label>
            <Input
              id="rainfall"
              placeholder="0"
              value={rainfall}
              onChange={(e) => setRainfall(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Enter remarks..."
              className="min-h-[80px]"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
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
