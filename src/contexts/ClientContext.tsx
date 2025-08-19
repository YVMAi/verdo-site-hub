
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Client } from '@/types/generation';
import { mockClients } from '@/data/mockGenerationData';

interface ClientContextType {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  selectedSite: string | null;
  setSelectedSite: (site: string | null) => void;
}

export const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  useEffect(() => {
    // Set the first client as selected by default
    if (mockClients.length > 0 && !selectedClient) {
      setSelectedClient(mockClients[0]);
      setSelectedSite('site1');
    }
  }, [selectedClient]);

  return (
    <ClientContext.Provider value={{ 
      selectedClient, 
      setSelectedClient, 
      selectedSite, 
      setSelectedSite 
    }}>
      {children}
    </ClientContext.Provider>
  );
};
