import React, { useState } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Save, FileText, Table } from "lucide-react";
import { GrassCuttingSiteData } from "@/types/grassCutting";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BulkUploadModal } from "./BulkUploadModal";
import { GrassCuttingForm } from "./GrassCuttingForm";
import { cn } from "@/lib/utils";
interface CompactGrassCuttingDataEntryProps {
  data: GrassCuttingSiteData | null;
  onDataChange?: (data: GrassCuttingSiteData) => void;
}
export const CompactGrassCuttingDataEntry: React.FC<CompactGrassCuttingDataEntryProps> = ({
  data,
  onDataChange
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [inputValues, setInputValues] = useState<{
    [key: string]: string;
  }>({});
  const [rainfall, setRainfall] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [viewMode, setViewMode] = useState<"form" | "table">("form");
  if (!data) {
    return <div className="bg-white rounded border p-4 text-center text-gray-500 text-sm">
        Select client and site to view data
      </div>;
  }
  const handleInputChange = (key: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSave = () => {
    const dataToSave = {
      date: format(selectedDate, "dd-MMM-yy"),
      inverterData: inputValues,
      rainfall,
      remarks,
      totalPlanned: Object.values(inputValues).reduce((sum, val) => sum + (parseInt(val) || 0), 0),
      totalActual: Object.values(inputValues).reduce((sum, val) => sum + (parseInt(val) || 0), 0)
    };
    console.log('Saving grass cutting data:', dataToSave);
    if (onDataChange) {
      // This would update the parent with the new data
    }
  };
  const handleBulkUpload = (uploadedData: any[]) => {
    console.log('Bulk upload data:', uploadedData);
    uploadedData.forEach(row => {
      if (row['Block-Inverter'] && row['Daily Grass Cutting']) {
        setInputValues(prev => ({
          ...prev,
          [row['Block-Inverter']]: row['Daily Grass Cutting']
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
  const getColumnWidth = (key: string, defaultWidth: string = "w-16") => {
    const value = inputValues[key] || "";
    if (value.length > 8) return "w-24";
    if (value.length > 4) return "w-20";
    return defaultWidth;
  };
  return <div className="bg-white rounded border">
      <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span>Enter Grass Cutting Data</span>
          <ToggleGroup type="single" value={viewMode} onValueChange={value => value && setViewMode(value as "form" | "table")} className="bg-white/10 rounded p-1">
            <ToggleGroupItem value="form" size="sm" className="text-white data-[state=on]:bg-white data-[state=on]:text-verdo-navy">
              <FileText className="h-3 w-3 mr-1" />
              Form
            </ToggleGroupItem>
            <ToggleGroupItem value="table" size="sm" className="text-white data-[state=on]:bg-white data-[state=on]:text-verdo-navy">
              <Table className="h-3 w-3 mr-1" />
              Table
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex gap-2">
          <BulkUploadModal onUpload={handleBulkUpload} />
          <Button onClick={handleSave} size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
      
      {viewMode === "form" ? <div className="p-4">
          <GrassCuttingForm data={data} onDataChange={onDataChange} />
        </div> : <>
          {/* Compact Legend */}
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

          <div className="overflow-x-auto" style={{
        maxHeight: '400px'
      }}>
            
          </div>
        </>}
    </div>;
};