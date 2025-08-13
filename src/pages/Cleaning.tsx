
import React, { useState } from 'react';
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { Client, Site } from "@/types/generation";

const Cleaning = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cleaning Operations</h1>
        <p className="text-gray-600">Track equipment cleaning and maintenance schedules</p>
      </div>
      
      <ClientSiteSelector
        selectedClient={selectedClient}
        selectedSite={selectedSite}
        onClientChange={setSelectedClient}
        onSiteChange={setSelectedSite}
      />
      
      <ComingSoonCard 
        title="Cleaning Management"
        description="Monitor and schedule cleaning operations for solar panels and wind turbines."
      />
    </div>
  );
};

export default Cleaning;
