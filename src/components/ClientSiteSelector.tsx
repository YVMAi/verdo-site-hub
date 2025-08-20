
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
    <div className="space-y-2">
      <div className={`grid gap-2 ${showCleaningType ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1 text-gray-700">
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
            <label className="text-xs font-medium flex items-center gap-1 text-gray-700">
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
        <div className="px-2 py-1 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs text-blue-800">
            <span className="font-medium">{selectedClient.name}</span> → {selectedSite.name}
          </div>
        </div>
      )}
    </div>
  );
};
