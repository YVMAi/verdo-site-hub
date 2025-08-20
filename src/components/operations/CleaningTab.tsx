
import React, { useState, useMemo } from 'react';
import { CompactCleaningDataEntry } from "@/components/cleaning/CompactCleaningDataEntry";
import { CompactCleaningHistoric } from "@/components/cleaning/CompactCleaningHistoric";
import { useClientContext } from "@/contexts/ClientContext";
import { mockCleaningData } from "@/data/mockCleaningData";
import { CleaningSiteData } from "@/types/cleaning";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets } from "lucide-react";

export const CleaningTab: React.FC = () => {
  const { selectedClient, selectedSite } = useClientContext();
  const [cleaningType, setCleaningType] = useState<'wet' | 'dry'>('wet');

  const currentData: CleaningSiteData | null = useMemo(() => {
    if (!selectedClient || !selectedSite) return null;
    
    const key = `${selectedClient.id}-${selectedSite.id}-${cleaningType}`;
    return mockCleaningData[key] || null;
  }, [selectedClient, selectedSite, cleaningType]);

  const handleDataChange = (data: CleaningSiteData) => {
    // Handle data changes here if needed
    console.log('Cleaning data updated:', data);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Cleaning Management</h2>
          <p className="text-sm text-gray-600">Monitor solar panel cleaning activities</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            Cleaning Type
          </label>
          <Select value={cleaningType} onValueChange={(value: 'wet' | 'dry') => setCleaningType(value)}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wet" className="text-xs">Wet Cleaning</SelectItem>
              <SelectItem value="dry" className="text-xs">Dry Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        <CompactCleaningDataEntry 
          data={currentData} 
          onDataChange={handleDataChange}
        />
        <CompactCleaningHistoric 
          data={currentData} 
        />
      </div>
    </div>
  );
};
