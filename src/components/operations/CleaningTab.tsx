
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CleaningDataEntry } from "@/components/cleaning/CleaningDataEntry";
import { CleaningHistoric } from "@/components/cleaning/CleaningHistoric";
import { useClientContext } from "@/contexts/ClientContext";
import { mockCleaningData } from "@/data/mockCleaningData";

export const CleaningTab: React.FC = () => {
  const { selectedClient, selectedSite } = useClientContext();
  const [subTab, setSubTab] = useState('entry');

  const siteData = selectedClient && selectedSite 
    ? mockCleaningData[selectedClient]?.[selectedSite] || null
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cleaning Management</h2>
          <p className="text-gray-600">Monitor solar panel cleaning activities</p>
        </div>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entry">Data Entry</TabsTrigger>
          <TabsTrigger value="historic">Historic Data</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="mt-4">
          <CleaningDataEntry data={siteData} />
        </TabsContent>

        <TabsContent value="historic" className="mt-4">
          <CleaningHistoric data={siteData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
