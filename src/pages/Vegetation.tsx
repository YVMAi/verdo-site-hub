
import React, { useState } from 'react';
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { Client, Site } from "@/types/generation";

const Vegetation = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vegetation Management</h1>
        <p className="text-gray-600">Monitor and control vegetation around renewable energy sites</p>
      </div>
      
      <ClientSiteSelector
        selectedClient={selectedClient}
        selectedSite={selectedSite}
        onClientChange={setSelectedClient}
        onSiteChange={setSelectedSite}
      />
      
      <ComingSoonCard 
        title="Vegetation Control"
        description="Track vegetation growth patterns and schedule maintenance to ensure optimal site performance."
      />
    </div>
  );
};

export default Vegetation;
