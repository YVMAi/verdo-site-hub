
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
        <div className="w-8 h-8 bg-verdo-jade/20 rounded-lg flex items-center justify-center">
          <Building className="h-4 w-4 text-verdo-jade" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-b border-verdo-navy-light/20">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider opacity-70 flex items-center gap-2">
          <Building className="h-3 w-3" />
          Client
        </label>
        <Select onValueChange={handleClientChange} value={selectedClient?.id || ""}>
          <SelectTrigger className="bg-verdo-navy-light/20 border-verdo-navy-light/30 text-white">
            <SelectValue placeholder="Select client..." />
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
    </div>
  );
};
