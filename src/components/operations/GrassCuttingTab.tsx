
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompactGrassCuttingDataEntry } from "@/components/grassCutting/CompactGrassCuttingDataEntry";
import { CompactGrassCuttingHistoric } from "@/components/grassCutting/CompactGrassCuttingHistoric";
import { useClientContext } from "@/contexts/ClientContext";
import { mockGrassCuttingData } from "@/data/mockGrassCuttingData";

export const GrassCuttingTab: React.FC = () => {
  const { selectedClient, selectedSite } = useClientContext();
  const [subTab, setSubTab] = useState('entry');

  const siteData = selectedClient && selectedSite 
    ? mockGrassCuttingData[selectedClient]?.[selectedSite] || null
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grass Cutting Management</h2>
          <p className="text-gray-600">Track and manage grass cutting operations</p>
        </div>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entry">Data Entry</TabsTrigger>
          <TabsTrigger value="historic">Historic Data</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="mt-4">
          <CompactGrassCuttingDataEntry data={siteData} />
        </TabsContent>

        <TabsContent value="historic" className="mt-4">
          <CompactGrassCuttingHistoric data={siteData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
