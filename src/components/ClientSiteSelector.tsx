
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockSites } from '@/data/mockGenerationData';
import { Client, Site } from '@/types/generation';
import { MapPin, Droplets } from 'lucide-react';

interface ClientSiteSelectorProps {
  selectedClient: Client | null;
  selectedSite: Site | null;
  onSiteChange: (site: Site | null) => void;
  // Optional props for cleaning type
  cleaningType?: 'wet' | 'dry';
  onCleaningTypeChange?: (type: 'wet' | 'dry') => void;
  showCleaningType?: boolean;
}

export const ClientSiteSelector: React.FC<ClientSiteSelectorProps> = ({
  selectedClient,
  selectedSite,
  onSiteChange,
  cleaningType,
  onCleaningTypeChange,
  showCleaningType = false
}) => {
  const availableSites = selectedClient 
    ? mockSites.filter(site => site.clientId === selectedClient.id)
    : [];

  const handleSiteChange = (siteId: string) => {
    const site = availableSites.find(s => s.id === siteId) || null;
    onSiteChange(site);
  };

  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Site
          </label>
          <Select onValueChange={handleSiteChange} disabled={!selectedClient} value={selectedSite?.id || ""}>
            <SelectTrigger>
              <SelectValue placeholder={selectedClient ? "Select a site..." : "Select client from sidebar first"} />
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

        {showCleaningType && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Cleaning Type
            </label>
            <Select value={cleaningType} onValueChange={onCleaningTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wet">Wet Cleaning</SelectItem>
                <SelectItem value="dry">Dry Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {selectedClient && selectedSite && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">Selected:</span> {selectedClient.name} → {selectedSite.name}
            </div>
            <div className="text-muted-foreground">
              Edit window: {selectedClient.allowedEditDays} days • 
              Columns: {selectedSite.columns.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
