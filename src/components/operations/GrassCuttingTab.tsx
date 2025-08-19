
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompactGrassCuttingDataEntry } from "@/components/grassCutting/CompactGrassCuttingDataEntry";
import { CompactGrassCuttingHistoric } from "@/components/grassCutting/CompactGrassCuttingHistoric";
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { useClientContext } from "@/contexts/ClientContext";
import { mockGrassCuttingData } from "@/data/mockGrassCuttingData";

export const GrassCuttingTab: React.FC = () => {
  const { selectedClient, selectedSite, setSelectedSite } = useClientContext();
  const [subTab, setSubTab] = useState('entry');

  const siteData = selectedClient && selectedSite 
    ? mockGrassCuttingData[selectedClient.id]?.[selectedSite.id] || null
    : null;

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Grass Cutting Management</h2>
          <p className="text-sm text-gray-600">Track and manage grass cutting operations</p>
        </div>
      </div>

      {/* Compact Client Site Selector */}
      <div className="bg-gray-50 rounded-lg p-3">
        <ClientSiteSelector 
          selectedClient={selectedClient}
          selectedSite={selectedSite}
          onSiteChange={setSelectedSite}
        />
      </div>

      {/* Compact Tabs */}
      <div className="flex-1 flex flex-col">
        <Tabs value={subTab} onValueChange={setSubTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-48 grid-cols-2 h-8">
            <TabsTrigger value="entry" className="text-xs">Data Entry</TabsTrigger>
            <TabsTrigger value="historic" className="text-xs">Historic Data</TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="flex-1 mt-3">
            <CompactGrassCuttingDataEntry data={siteData} />
          </TabsContent>

          <TabsContent value="historic" className="flex-1 mt-3">
            <CompactGrassCuttingHistoric data={siteData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
