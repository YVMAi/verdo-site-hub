
import React, { useState } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Save, FileText, Table, Upload } from "lucide-react";
import { CleaningSiteData } from "@/types/cleaning";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CleaningForm } from "./CleaningForm";
import { cn } from "@/lib/utils";

interface CompactCleaningDataEntryProps {
  data: CleaningSiteData | null;
  onDataChange?: (data: CleaningSiteData) => void;
}

export const CompactCleaningDataEntry: React.FC<CompactCleaningDataEntryProps> = ({ data, onDataChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({});
  const [rainfallMM, setRainfallMM] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [viewMode, setViewMode] = useState<"form" | "table">("table");

  if (!data) {
    return (
      <div className="bg-white rounded border p-4 text-center text-gray-500 text-sm">
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
      rainfallMM,
      remarks,
      totalCleaned: Object.values(inputValues).reduce((sum, val) => sum + (parseInt(val) || 0), 0),
    };
    
    console.log('Saving cleaning data:', dataToSave);
    if (onDataChange) {
      // This would update the parent with the new data
    }
  };

  const handleBulkUpload = () => {
    console.log('Opening bulk upload modal');
    // This would open a bulk upload modal similar to grass cutting
  };

  const getColumnWidth = (key: string, defaultWidth: string = "w-16") => {
    const value = inputValues[key] || "";
    if (value.length > 8) return "w-24";
    if (value.length > 4) return "w-20";
    return defaultWidth;
  };

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
              className="text-white data-[state=on]:bg-white data-[state=on]:text-verdo-navy"
            >
              <FileText className="h-3 w-3 mr-1" />
              Form
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="table" 
              size="sm"
              className="text-white data-[state=on]:bg-white data-[state=on]:text-verdo-navy"
            >
              <Table className="h-3 w-3 mr-1" />
              Table
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <Button 
              onClick={handleBulkUpload}
              variant="outline"
              size="sm" 
              className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <span className="text-xs mt-1">Upload</span>
          </div>
          <div className="flex flex-col items-center">
            <Button 
              onClick={handleSave}
              variant="outline"
              size="sm" 
              className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
            >
              <Save className="h-4 w-4" />
            </Button>
            <span className="text-xs mt-1">Save</span>
          </div>
        </div>
      </div>
      
      {viewMode === "form" ? (
        <div className="p-4">
          <CleaningForm data={data} onDataChange={onDataChange} />
        </div>
      ) : (
        <>
          {/* Single Legend */}
          <div className="px-3 py-2 bg-gray-50 border-b text-xs flex gap-4">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300"></div>
              Enter cleaning data
            </span>
          </div>

          <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-verdo-navy text-white">
                  <th className="px-2 py-1 text-left font-medium border border-gray-300 w-32">Field</th>
                  {data.blocks.map(block => (
                    <th key={block.id} className="px-2 py-1 text-center font-medium border border-gray-300" colSpan={block.inverters.length}>
                      {block.name}
                    </th>
                  ))}
                  <th className="px-2 py-1 text-center font-medium border border-gray-300 w-32">Remarks</th>
                </tr>
                <tr className="bg-verdo-navy text-white">
                  <th className="px-2 py-1 text-left font-medium border border-gray-300">Inverter</th>
                  {data.blocks.map(block => (
                    block.inverters.map(inverter => (
                      <th key={`${block.id}-${inverter.id}`} className={cn("px-2 py-1 text-center font-medium border border-gray-300", getColumnWidth(`${block.id}-${inverter.id}`))}>
                        {inverter.id}
                      </th>
                    ))
                  ))}
                  <th className="px-2 py-1 border border-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-200">
                  <td className="px-2 py-1 font-medium border border-gray-300">Total Modules</td>
                  {data.blocks.map(block => (
                    block.inverters.map(inverter => (
                      <td key={`total-${block.id}-${inverter.id}`} className={cn("px-2 py-1 text-center border border-gray-300", getColumnWidth(`${block.id}-${inverter.id}`))}>
                        {inverter.totalModules}
                      </td>
                    ))
                  ))}
                  <td className="px-2 py-1 border border-gray-300"></td>
                </tr>

                <tr className="bg-gray-200">
                  <td className="px-2 py-1 font-medium border border-gray-300">Cleaned %</td>
                  {data.blocks.map(block => (
                    block.inverters.map(inverter => (
                      <td key={`percent-${block.id}-${inverter.id}`} className={cn("px-2 py-1 text-center border border-gray-300", getColumnWidth(`${block.id}-${inverter.id}`))}>
                        {Math.round((inverter.modulesCleaned / inverter.totalModules) * 100)}%
                      </td>
                    ))
                  ))}
                  <td className="px-2 py-1 border border-gray-300"></td>
                </tr>

                <tr className="bg-gray-200">
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
                        <td key={`input-${key}`} className={cn("px-2 py-1 text-center border border-gray-300", getColumnWidth(key))}>
                          <input 
                            type="number" 
                            className="w-full h-6 text-center text-xs border-0 bg-transparent focus:bg-white"
                            value={inputValues[key] || ""}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                          />
                        </td>
                      );
                    })
                  ))}
                  <td className="px-2 py-1 border border-gray-300">
                    <textarea 
                      className="w-full h-6 text-xs border-0 bg-transparent focus:bg-white resize-none"
                      style={{ minHeight: '24px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
