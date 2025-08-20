
import React, { useState, useMemo } from 'react';
import { CompactCleaningDataEntry } from "@/components/cleaning/CompactCleaningDataEntry";
import { CompactCleaningHistoric } from "@/components/cleaning/CompactCleaningHistoric";
import { useClientContext } from "@/contexts/ClientContext";
import { mockCleaningData } from "@/data/mockCleaningData";
import { CleaningSiteData } from "@/types/cleaning";
import { Toggle } from "@/components/ui/toggle";
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

  const handleToggleChange = (pressed: boolean) => {
    setCleaningType(pressed ? 'dry' : 'wet');
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
          <div className="flex items-center gap-2 text-xs">
            <span className={cleaningType === 'wet' ? 'font-medium' : 'text-gray-500'}>
              Wet Cleaning
            </span>
            <Toggle 
              pressed={cleaningType === 'dry'} 
              onPressedChange={handleToggleChange}
              size="sm"
            />
            <span className={cleaningType === 'dry' ? 'font-medium' : 'text-gray-500'}>
              Dry Cleaning
            </span>
          </div>
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
