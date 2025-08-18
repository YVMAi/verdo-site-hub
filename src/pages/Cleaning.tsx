
import React, { useState, useMemo } from 'react';
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { CompactCleaningDataEntry } from "@/components/cleaning/CompactCleaningDataEntry";
import { CompactCleaningHistoric } from "@/components/cleaning/CompactCleaningHistoric";
import { Site } from "@/types/generation";
import { CleaningSiteData } from "@/types/cleaning";
import { mockCleaningData } from "@/data/mockCleaningData";
import { useClient } from '@/contexts/ClientContext';

const Cleaning = () => {
  const { selectedClient } = useClient();
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [wetDryType, setWetDryType] = useState<'wet' | 'dry'>('wet');

  const currentData: CleaningSiteData | null = useMemo(() => {
    if (!selectedClient || !selectedSite) return null;
    
    const key = `${selectedClient.id}-${selectedSite.id}-${wetDryType}`;
    return mockCleaningData[key] || null;
  }, [selectedClient, selectedSite, wetDryType]);

  return (
    <div className="max-w-full mx-auto space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Cleaning Management</h1>
        <p className="text-gray-600 text-sm">Track and manage solar module cleaning operations</p>
      </div>
      
      <ClientSiteSelector
        selectedClient={selectedClient}
        selectedSite={selectedSite}
        onSiteChange={setSelectedSite}
        cleaningType={wetDryType}
        onCleaningTypeChange={setWetDryType}
        showCleaningType={true}
      />

      <div className="space-y-4">
        <CompactCleaningDataEntry data={currentData} />
        <CompactCleaningHistoric data={currentData} />
      </div>
    </div>
  );
};

export default Cleaning;
