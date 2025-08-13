
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockClients, mockSites } from '@/data/mockGenerationData';
import { Client, Site } from '@/types/generation';
import { Building, MapPin } from 'lucide-react';

interface ClientSiteSelectorProps {
  selectedClient: Client | null;
  selectedSite: Site | null;
  onClientChange: (client: Client | null) => void;
  onSiteChange: (site: Site | null) => void;
}

export const ClientSiteSelector: React.FC<ClientSiteSelectorProps> = ({
  selectedClient,
  selectedSite,
  onClientChange,
  onSiteChange
}) => {
  const availableSites = selectedClient 
    ? mockSites.filter(site => site.clientId === selectedClient.id)
    : [];

  const handleClientChange = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId) || null;
    onClientChange(client);
    onSiteChange(null); // Reset site when client changes
  };

  const handleSiteChange = (siteId: string) => {
    const site = availableSites.find(s => s.id === siteId) || null;
    onSiteChange(site);
  };

  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
