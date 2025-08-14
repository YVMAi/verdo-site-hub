import React, { useState, useMemo } from 'react';
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { CompactGrassCuttingDataEntry } from "@/components/grassCutting/CompactGrassCuttingDataEntry";
import { CompactGrassCuttingHistoric } from "@/components/grassCutting/CompactGrassCuttingHistoric";
import { Client, Site } from "@/types/generation";
import { GrassCuttingSiteData } from "@/types/grassCutting";
import { mockGrassCuttingData } from "@/data/mockGrassCuttingData";

const GrassCutting = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const currentData: GrassCuttingSiteData | null = useMemo(() => {
    if (!selectedClient || !selectedSite) return null;
    
    const key = `${selectedClient.id}-${selectedSite.id}`;
    return mockGrassCuttingData[key] || null;
  }, [selectedClient, selectedSite]);

  return (
    <div className="max-w-full mx-auto space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Grass Cutting Management</h1>
        <p className="text-gray-600 text-sm">Track and manage grass cutting operations</p>
      </div>
      
      <ClientSiteSelector
        selectedClient={selectedClient}
        selectedSite={selectedSite}
        onClientChange={setSelectedClient}
        onSiteChange={setSelectedSite}
      />

      <div className="space-y-4">
        <CompactGrassCuttingDataEntry data={currentData} />
        <CompactGrassCuttingHistoric data={currentData} />
      </div>
    </div>
  );
};

export default GrassCutting;