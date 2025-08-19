
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
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Site
          </label>
          <Select onValueChange={handleSiteChange} disabled={!selectedClient} value={selectedSite?.id || ""}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={selectedClient ? "Select a site..." : "Select client from sidebar first"} />
            </SelectTrigger>
            <SelectContent>
              {availableSites.map(site => (
                <SelectItem key={site.id} value={site.id} className="text-xs">
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showCleaningType && (
          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              Cleaning Type
            </label>
            <Select value={cleaningType} onValueChange={onCleaningTypeChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wet" className="text-xs">Wet Cleaning</SelectItem>
                <SelectItem value="dry" className="text-xs">Dry Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {selectedClient && selectedSite && (
        <div className="p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-medium text-blue-900">Selected:</span> 
              <span className="text-blue-800"> {selectedClient.name} → {selectedSite.name}</span>
            </div>
            <div className="text-blue-600">
              Edit: {selectedClient.allowedEditDays}d • 
              Cols: {selectedSite.columns.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
