
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Client, Site } from '@/types/generation';
import { mockClients, mockSites } from '@/data/mockGenerationData';

interface ClientContextType {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  selectedSite: Site | null;
  setSelectedSite: (site: Site | null) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

export const useClientContext = () => {
  return useClient();
};

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  useEffect(() => {
    // Set the first client as selected by default
    if (mockClients.length > 0 && !selectedClient) {
      setSelectedClient(mockClients[0]);
    }
  }, [selectedClient]);

  // Reset site when client changes
  useEffect(() => {
    if (selectedClient) {
      const availableSites = mockSites.filter(site => site.clientId === selectedClient.id);
      if (availableSites.length > 0) {
        setSelectedSite(availableSites[0]);
      } else {
        setSelectedSite(null);
      }
    } else {
      setSelectedSite(null);
    }
  }, [selectedClient]);

  const handleSetSelectedSite = (site: Site | null) => {
    setSelectedSite(site);
  };

  return (
    <ClientContext.Provider value={{ 
      selectedClient, 
      setSelectedClient, 
      selectedSite, 
      setSelectedSite: handleSetSelectedSite 
    }}>
      {children}
    </ClientContext.Provider>
  );
};
