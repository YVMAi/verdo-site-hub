
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
    ? mockCleaningData[selectedClient.id]?.[selectedSite.id] || null
    : null;

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Cleaning Management</h2>
          <p className="text-sm text-gray-600">Monitor solar panel cleaning activities</p>
        </div>
      </div>

      {/* Compact Tabs */}
      <div className="flex-1 flex flex-col">
        <Tabs value={subTab} onValueChange={setSubTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-48 grid-cols-2 h-8">
            <TabsTrigger value="entry" className="text-xs">Data Entry</TabsTrigger>
            <TabsTrigger value="historic" className="text-xs">Historic Data</TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="flex-1 mt-3">
            <CleaningDataEntry data={siteData} />
          </TabsContent>

          <TabsContent value="historic" className="flex-1 mt-3">
            <CleaningHistoric data={siteData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
