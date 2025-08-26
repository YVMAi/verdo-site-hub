
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockClients } from '@/data/mockGenerationData';
import { Client } from '@/types/generation';
import { Building } from 'lucide-react';

interface ClientSelectorProps {
  selectedClient: Client | null;
  onClientChange: (client: Client | null) => void;
  isCollapsed?: boolean;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  selectedClient,
  onClientChange,
  isCollapsed = false
}) => {
  const handleClientChange = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId) || null;
    onClientChange(client);
  };

  if (isCollapsed) {
    return (
      <div className="px-2 py-2">
        <div className="w-8 h-8 bg-verdo-navy rounded-lg flex items-center justify-center">
          <Building className="h-4 w-4 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-b border-gray-200">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-verdo-navy uppercase tracking-wider flex items-center gap-2">
          <Building className="h-3 w-3" />
          Client
        </label>
        <Select onValueChange={handleClientChange} value={selectedClient?.id || ""}>
          <SelectTrigger className="bg-verdo-navy border-verdo-navy text-white hover:bg-verdo-navy-light">
            <SelectValue placeholder="Select client..." />
          </SelectTrigger>
          <SelectContent className="bg-white border-verdo-navy">
            {mockClients.map(client => (
              <SelectItem key={client.id} value={client.id} className="text-verdo-navy hover:bg-gray-100">
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
