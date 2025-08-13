
import React, { useState } from 'react';
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { CleaningDataEntry } from "@/components/cleaning/CleaningDataEntry";
import { CleaningHistoric } from "@/components/cleaning/CleaningHistoric";
import { Client, Site } from "@/types/generation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, History } from "lucide-react";

const Cleaning = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  return (
    <div className="max-w-7xl mx-auto">
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
      
      <Tabs defaultValue="data-entry" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="data-entry" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Data Entry
          </TabsTrigger>
          <TabsTrigger value="historical" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historical Data
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="data-entry">
          <CleaningDataEntry 
            selectedClient={selectedClient}
            selectedSite={selectedSite}
          />
        </TabsContent>
        
        <TabsContent value="historical">
          <CleaningHistoric 
            selectedClient={selectedClient}
            selectedSite={selectedSite}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Cleaning;
