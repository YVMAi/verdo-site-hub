
import React, { useState, useMemo } from 'react';
import { CompactGrassCuttingDataEntry } from "@/components/grassCutting/CompactGrassCuttingDataEntry";
import { CompactGrassCuttingHistoric } from "@/components/grassCutting/CompactGrassCuttingHistoric";
import { useClientContext } from "@/contexts/ClientContext";
import { mockGrassCuttingData } from "@/data/mockGrassCuttingData";
import { GrassCuttingSiteData } from "@/types/grassCutting";

export const GrassCuttingTab: React.FC = () => {
  const { selectedClient, selectedSite } = useClientContext();

  const currentData: GrassCuttingSiteData | null = useMemo(() => {
    if (!selectedClient || !selectedSite) return null;
    
    const key = `${selectedClient.id}-${selectedSite.id}`;
    return mockGrassCuttingData[key] || null;
  }, [selectedClient, selectedSite]);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Grass Cutting Management</h2>
          <p className="text-sm text-gray-600">Track and manage grass cutting operations</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        <CompactGrassCuttingDataEntry data={currentData} />
        <CompactGrassCuttingHistoric data={currentData} />
      </div>
    </div>
  );
};
