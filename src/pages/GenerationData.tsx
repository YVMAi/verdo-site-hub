
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataEntryTable } from '@/components/generation/DataEntryTable';
import { HistoricDataTable } from '@/components/generation/HistoricDataTable';
import { mockClients, mockSites, tabConfigs } from '@/data/mockGenerationData';
import { Client, Site, TabType } from '@/types/generation';
import { Building, MapPin, Database } from 'lucide-react';

const GenerationData = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSite, setSite] = useState<Site | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('meter-reading');

  const availableSites = selectedClient 
    ? mockSites.filter(site => site.clientId === selectedClient.id)
    : [];

  const handleClientChange = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId) || null;
    setSelectedClient(client);
    setSite(null);
  };

  const handleSiteChange = (siteId: string) => {
    const site = availableSites.find(s => s.id === siteId) || null;
    setSite(site);
  };

  return (
    <div className="max-w-full mx-auto space-y-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Daily Generation Data</h1>
        <p className="text-muted-foreground">
          Enter and manage solar and wind generation data with Excel-like functionality
        </p>
      </div>

      {/* Client & Site Selection */}
      <div className="bg-card border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Client
            </label>
            <Select onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {mockClients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Site
            </label>
            <Select onValueChange={handleSiteChange} disabled={!selectedClient}>
              <SelectTrigger>
                <SelectValue placeholder={selectedClient ? "Select a site..." : "Select client first"} />
              </SelectTrigger>
              <SelectContent>
                {availableSites.map(site => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedClient && selectedSite && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="font-medium">{selectedClient.name}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{selectedSite.name}</span>
              </div>
              <div className="text-muted-foreground">
                Edit window: {selectedClient.allowedEditDays} days • 
                Columns: {selectedSite.columns.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs and Data Tables */}
      {selectedClient && selectedSite ? (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
          <TabsList className="grid w-full grid-cols-3">
            {tabConfigs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabConfigs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-8 mt-6">
              {/* Data Entry Table */}
              <div>
                <DataEntryTable site={selectedSite} activeTab={activeTab} />
              </div>

              {/* Historic Data Table */}
              <div>
                <HistoricDataTable 
                  site={selectedSite} 
                  activeTab={activeTab}
                  allowedEditDays={selectedClient.allowedEditDays || 30}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        /* Info Panel */
        <div className="bg-muted/30 border border-dashed rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Get Started</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Select a client and site from the dropdowns above to begin entering and viewing generation data
                with Excel-like functionality including copy/paste, sorting, filtering, and more.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationData;
