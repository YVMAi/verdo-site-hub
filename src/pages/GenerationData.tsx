
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { DataEntryTable } from '@/components/generation/DataEntryTable';
import { HistoricDataTable } from '@/components/generation/HistoricDataTable';
import { ClientSiteSelector } from '@/components/ClientSiteSelector';
import { BulkUploadModal } from '@/components/generation/BulkUploadModal';
import { tabConfigs } from '@/data/mockGenerationData';
import { Site, TabType } from '@/types/generation';
import { Building, Factory, Gauge, CloudSun, Zap, Cpu, CalendarIcon, Upload } from 'lucide-react';
import { useClient } from '@/contexts/ClientContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabType>('plant-data');

  const handleBulkUpload = (data: any[]) => {
    console.log('Bulk upload data:', data);
    // TODO: Implement bulk upload logic
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Daily Generation Data</h1>
        <p className="text-muted-foreground">
          Enter and manage solar and wind generation data across multiple sites
        </p>
      </div>

      {/* Site Selection and Date Picker */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <ClientSiteSelector
            selectedClient={selectedClient}
            selectedSite={selectedSite}
            onSiteChange={setSite}
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1 text-gray-700">
            <CalendarIcon className="h-3 w-3" />
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-8 text-xs justify-start text-left font-normal min-w-[120px]",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-3 w-3 mr-2" />
                {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Select date"}
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

        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1 text-gray-700">
            <Upload className="h-3 w-3" />
            Bulk Upload
          </label>
          <BulkUploadModal 
            selectedSite={selectedSite}
            activeTab={activeTab}
            onUpload={handleBulkUpload}
          />
        </div>
      </div>

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
