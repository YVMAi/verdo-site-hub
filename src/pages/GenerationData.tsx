
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataEntryTable } from '@/components/generation/DataEntryTable';
import { HistoricDataTable } from '@/components/generation/HistoricDataTable';
import { ClientSiteSelector } from '@/components/ClientSiteSelector';
import { tabConfigs } from '@/data/mockGenerationData';
import { Site, TabType } from '@/types/generation';
import { Building, Factory, Gauge, CloudSun, Zap, Cpu } from 'lucide-react';
import { useClient } from '@/contexts/ClientContext';

const iconMap = {
  'factory': Factory,
  'gauge': Gauge,
  'cloud-sun': CloudSun,
  'zap': Zap,
  'cpu': Cpu,
};

const GenerationData = () => {
  const { selectedClient } = useClient();
  const [selectedSite, setSite] = useState<Site | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('plant-data');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Daily Generation Data</h1>
        <p className="text-muted-foreground">
          Enter and manage solar and wind generation data across multiple sites
        </p>
      </div>

      {/* Site Selection */}
      <ClientSiteSelector
        selectedClient={selectedClient}
        selectedSite={selectedSite}
        onSiteChange={setSite}
      />

      {/* Tabs and Data Tables */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
        <TabsList className="grid w-full grid-cols-5 bg-gray-100">
          {tabConfigs.map(tab => {
            const IconComponent = iconMap[tab.icon as keyof typeof iconMap];
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center gap-2 data-[state=active]:bg-verdo-navy data-[state=active]:text-white hover:bg-gray-200"
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabConfigs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6 mt-6">
            {/* Data Entry Table */}
            <div>
              <h2 className="text-xl font-semibold mb-4">New Data Entry</h2>
              <DataEntryTable site={selectedSite} activeTab={activeTab} />
            </div>

            {/* Historic Data Table */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Historic Data</h2>
              <HistoricDataTable 
                site={selectedSite} 
                activeTab={activeTab}
                allowedEditDays={selectedClient?.allowedEditDays || 30}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Info Panel */}
      {(!selectedClient || !selectedSite) && (
        <div className="bg-muted/30 border border-dashed rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Get Started</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {!selectedClient 
                  ? "Select a client from the sidebar to begin entering and viewing generation data."
                  : "Select a site from the dropdown above to begin entering and viewing generation data."
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationData;
