
import React, { useState } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Save, Upload, Table, FileText } from "lucide-react";
import { CleaningSiteData, CleaningDailyEntry } from "@/types/cleaning";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BulkUploadModal } from '../grassCutting/BulkUploadModal';
import { cn } from "@/lib/utils";

interface CompactCleaningDataEntryProps {
  data: CleaningSiteData | null;
  onDataChange?: (data: CleaningSiteData) => void;
}

export const CompactCleaningDataEntry: React.FC<CompactCleaningDataEntryProps> = ({ data, onDataChange }) => {
  const [viewMode, setViewMode] = useState<'table' | 'form'>('table');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [rainfall, setRainfall] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

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
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.blocks.map(block => (
          <div key={block.id} className="space-y-2">
            <h3 className="font-medium text-sm text-gray-900">{block.name}</h3>
            <div className="space-y-2">
              {block.inverters.map(inverter => {
                const key = `${block.id}-${inverter.id}`;
                return (
                  <div key={inverter.id} className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 w-12">{inverter.id}:</label>
                    <input
                      type="number"
                      className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                      defaultValue={currentEntry.inverterData[key] || 0}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                    <span className="text-xs text-gray-500">/{inverter.totalModules}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Rainfall (mm)</label>
          <input
            type="text"
            className="w-full h-8 px-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            placeholder={currentEntry.rainfallMM}
            value={rainfall}
            onChange={(e) => setRainfall(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
          <input
            type="text"
            className="w-full h-8 px-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            placeholder={currentEntry.remarks}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded border">
      <div className="bg-[#1e3a8a] px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <span>Enter Cleaning Data</span>
        <div className="flex gap-2">
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

      {viewMode === 'table' ? renderTableView() : renderFormView()}
    </div>
  );
};
