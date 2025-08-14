import React, { useState, useMemo } from 'react';
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { CleaningDataEntry } from "@/components/cleaning/CleaningDataEntry";
import { CleaningHistoric } from "@/components/cleaning/CleaningHistoric";
import { Client, Site } from "@/types/generation";
import { CleaningSiteData } from "@/types/cleaning";
import { mockCleaningData } from "@/data/mockCleaningData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Cleaning = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [wetDryType, setWetDryType] = useState<'wet' | 'dry'>('wet');

  const currentData: CleaningSiteData | null = useMemo(() => {
    if (!selectedClient || !selectedSite) return null;
    
    const key = `${selectedClient.id}-${selectedSite.id}-${wetDryType}`;
    return mockCleaningData[key] || null;
  }, [selectedClient, selectedSite, wetDryType]);

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cleaning Management</h1>
        <p className="text-gray-600">Track and manage solar module cleaning operations</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1">
          <ClientSiteSelector
            selectedClient={selectedClient}
            selectedSite={selectedSite}
            onClientChange={setSelectedClient}
            onSiteChange={setSelectedSite}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cleaning Type
          </label>
          <Select value={wetDryType} onValueChange={(value: 'wet' | 'dry') => setWetDryType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wet">Wet Cleaning</SelectItem>
              <SelectItem value="dry">Dry Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <CleaningDataEntry data={currentData} />
        <CleaningHistoric data={currentData} />
      </div>
    </div>
  );
};

export default Cleaning;