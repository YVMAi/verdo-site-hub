import React, { useState } from 'react';
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { GrassCuttingDataEntry } from "@/components/grassCutting/GrassCuttingDataEntry";
import { GrassCuttingHistoric } from "@/components/grassCutting/GrassCuttingHistoric";
import { Client, Site } from "@/types/generation";

const GrassCutting = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#001f3f] mb-2">Grass Cutting Operations</h1>
        <p className="text-sm sm:text-base text-gray-600">Log, track, and manage grass cutting activities across solar and wind sites</p>
      </div>
      
      <ClientSiteSelector
        selectedClient={selectedClient}
        selectedSite={selectedSite}
        onClientChange={setSelectedClient}
        onSiteChange={setSelectedSite}
      />
      
      {selectedClient && selectedSite ? (
        <div className="space-y-4 sm:space-y-6">
          <GrassCuttingDataEntry site={selectedSite} />
          <GrassCuttingHistoric site={selectedSite} client={selectedClient} />
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-4 sm:p-8 text-center">
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">Select a client and site to begin grass cutting operations</p>
          <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
            <p>✅ Excel-style tabular data entry with block and inverter grouping</p>
            <p>✅ Real-time calculated metrics and percentage completion</p>
            <p>✅ Historic data with daily actual vs planned tracking</p>
            <p>✅ Date range filtering and export capabilities</p>
            <p>✅ Client/site filtering and responsive design</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrassCutting;