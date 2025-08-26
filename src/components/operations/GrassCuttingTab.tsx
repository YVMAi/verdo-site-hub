
import React, { useState, useMemo } from 'react';
import { CompactGrassCuttingDataEntry } from "@/components/grassCutting/CompactGrassCuttingDataEntry";
import { CompactGrassCuttingHistoric } from "@/components/grassCutting/CompactGrassCuttingHistoric";
import { useClientContext } from "@/contexts/ClientContext";
import { mockGrassCuttingData } from "@/data/mockGrassCuttingData";
import { GrassCuttingSiteData } from "@/types/grassCutting";

export const GrassCuttingTab: React.FC = () => {
  const {
    selectedClient,
    selectedSite
  } = useClientContext();

  const currentData: GrassCuttingSiteData | null = useMemo(() => {
    if (!selectedClient || !selectedSite) return null;
    const key = `${selectedClient.id}-${selectedSite.id}`;
    return mockGrassCuttingData[key] || null;
  }, [selectedClient, selectedSite]);

  if (!selectedClient || !selectedSite) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Select Client and Site</h3>
          <p className="text-muted-foreground">
            Please select a client from the sidebar and a site from the dropdown to view grass cutting data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Grass Cutting Operations</h2>
          <p className="text-sm text-muted-foreground">
            Track and manage grass cutting activities for {selectedSite.name}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* New Data Entry Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">New Data Entry</h3>
          <CompactGrassCuttingDataEntry data={currentData} />
        </div>
        
        {/* Historic Data Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Historic Data</h3>
          <CompactGrassCuttingHistoric data={currentData} />
        </div>
      </div>
    </div>
  );
};
