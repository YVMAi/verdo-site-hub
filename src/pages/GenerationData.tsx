
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataEntryTable } from '@/components/generation/DataEntryTable';
import { HistoricDataTable } from '@/components/generation/HistoricDataTable';
import { BulkUploadModal } from '@/components/generation/BulkUploadModal';
import { tabConfigs } from '@/data/mockGenerationData';
import { Site, TabType } from '@/types/generation';
import { Building, Factory, Gauge, CloudSun, Zap, Cpu, CalendarIcon, Upload } from 'lucide-react';
import { useClient } from '@/contexts/ClientContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockSites } from '@/data/mockGenerationData';

const iconMap = {
  'factory': Factory,
  'gauge': Gauge,
  'cloud-sun': CloudSun,
  'zap': Zap,
  'cpu': Cpu,
};

const GenerationData = () => {
  const { selectedClient, selectedSite, setSelectedSite } = useClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabType>('plant-data');

  const availableSites = selectedClient ? mockSites.filter(site => site.clientId === selectedClient.id) : [];

  const handleSiteChange = (siteId: string) => {
    const site = availableSites.find(s => s.id === siteId) || null;
    setSelectedSite(site);
  };

  const handleBulkUpload = (data: any[]) => {
    console.log('Bulk upload data:', data);
    // TODO: Implement bulk upload logic
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-[hsl(var(--verdo-navy))] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Daily Generation Data</h1>
          <p className="text-sm text-white/80">Enter and manage solar and wind generation data across multiple sites</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Site Selector */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Select onValueChange={handleSiteChange} disabled={!selectedClient} value={selectedSite?.id || ""}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white h-8 text-sm">
                <SelectValue placeholder={selectedClient ? "Select a site..." : "Select client from sidebar first"} />
              </SelectTrigger>
              <SelectContent>
                {availableSites.map(site => (
                  <SelectItem key={site.id} value={site.id} className="text-sm">
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white h-8 text-sm hover:bg-white/20"
                >
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {format(selectedDate, "dd MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Bulk Upload */}
          <div className="flex items-center gap-2">
            <BulkUploadModal 
              selectedSite={selectedSite}
              activeTab={activeTab}
              onUpload={handleBulkUpload}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex-1 bg-white overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="h-full flex flex-col">
          <div className="border-b bg-gray-50/50 px-6 py-3 flex-shrink-0">
            <TabsList className="flex h-auto p-0 gap-1 bg-transparent">
              {tabConfigs.map(tab => {
                const IconComponent = iconMap[tab.icon as keyof typeof iconMap];
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="flex items-center gap-2 h-10 px-4 data-[state=active]:bg-[hsl(var(--verdo-navy))] data-[state=active]:text-white data-[state=active]:shadow-sm border data-[state=active]:border-[hsl(var(--verdo-navy))] text-gray-600 text-sm whitespace-nowrap"
                  >
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Fixed Main Content Area - Scrollable Independently */}
          <div className="flex-1 overflow-auto">
            {tabConfigs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="h-full m-0 p-6">
                {/* Data Entry Table */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">New Data Entry</h2>
                  <DataEntryTable 
                    site={selectedSite} 
                    activeTab={activeTab}
                    selectedDate={selectedDate}
                  />
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

            {/* Info Panel */}
            {(!selectedClient || !selectedSite) && (
              <div className="bg-muted/30 border border-dashed rounded-lg p-8 text-center m-6">
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
        </Tabs>
      </div>
    </div>
  );
};

export default GenerationData;
