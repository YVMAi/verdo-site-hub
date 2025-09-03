
import React, { useState, useMemo } from 'react';
import { CompactCleaningDataEntry } from "@/components/cleaning/CompactCleaningDataEntry";
import { CompactCleaningHistoric } from "@/components/cleaning/CompactCleaningHistoric";
import { useClientContext } from "@/contexts/ClientContext";
import { mockCleaningData } from "@/data/mockCleaningData";
import { CleaningSiteData } from "@/types/cleaning";
import { Droplets } from "lucide-react";

interface CleaningTabProps {
  selectedDate: Date;
}

export const CleaningTab: React.FC<CleaningTabProps> = ({ selectedDate }) => {
  const {
    selectedClient,
    selectedSite
  } = useClientContext();
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
        <div></div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Droplets className="h-4 w-4" />
            Cleaning Type
          </label>
          <div className="flex items-center bg-gray-100 rounded-md p-0.5">
            <button 
              onClick={() => setCleaningType('wet')} 
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                cleaningType === 'wet' 
                  ? 'bg-verdo-navy text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Wet Cleaning
            </button>
            <button 
              onClick={() => setCleaningType('dry')} 
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                cleaningType === 'dry' 
                  ? 'bg-verdo-navy text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dry Cleaning
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        <CompactCleaningDataEntry data={currentData} onDataChange={handleDataChange} />
        <CompactCleaningHistoric data={currentData} />
      </div>
    </div>
  );
};
