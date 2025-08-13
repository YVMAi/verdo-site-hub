
import React, { useState } from 'react';
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { CleaningDataEntry } from "@/components/cleaning/CleaningDataEntry";
import { CleaningHistoric } from "@/components/cleaning/CleaningHistoric";
import { Client, Site } from "@/types/generation";

const Cleaning = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#001f3f] mb-2">Cleaning Operations</h1>
        <p className="text-sm sm:text-base text-gray-600">Log, track, and manage cleaning activities for solar panels and wind turbines</p>
      </div>
      
      <ClientSiteSelector
        selectedClient={selectedClient}
        selectedSite={selectedSite}
        onClientChange={setSelectedClient}
        onSiteChange={setSelectedSite}
      />
      
      {selectedClient && selectedSite ? (
        <div className="space-y-4 sm:space-y-6">
          <CleaningDataEntry site={selectedSite} />
          <CleaningHistoric site={selectedSite} client={selectedClient} />
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-4 sm:p-8 text-center">
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">Select a client and site to begin cleaning operations</p>
          <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
            <p>✅ Excel-style tabular data entry with color-coded rows</p>
            <p>✅ Wet/Dry cleaning type selection with conditional fields</p>
            <p>✅ Real-time calculated metrics (cycles, percentages, uncleaned modules)</p>
            <p>✅ Historical data with advanced filtering and pagination</p>
            <p>✅ Date restrictions (up to 30 days back) and photo uploads</p>
            <p>✅ Export capabilities (CSV/Excel) and responsive design</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cleaning;
