
import React, { useState } from 'react';
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { Site } from "@/types/generation";
import { useClient } from '@/contexts/ClientContext';

const FieldInspection = () => {
  const { selectedClient } = useClient();
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Field Inspection</h1>
        <p className="text-gray-600">Conduct and manage comprehensive field inspections</p>
      </div>
      
      <ClientSiteSelector
        selectedClient={selectedClient}
        selectedSite={selectedSite}
        onSiteChange={setSelectedSite}
      />
      
      <ComingSoonCard 
        title="Field Inspection Tools"
        description="Digital forms and checklists for conducting thorough field inspections and reporting."
      />
    </div>
  );
};

export default FieldInspection;
