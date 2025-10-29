import { useState } from "react";
import { Building2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { mockClients } from "@/data/mockGenerationData";

interface ClientStatus {
  id: string;
  enabled: boolean;
  lastSynced: string;
}

export default function ClientManagement() {
  const [syncing, setSyncing] = useState(false);
  const [clientStatuses, setClientStatuses] = useState<ClientStatus[]>(
    mockClients.map(client => ({
      id: client.id,
      enabled: true,
      lastSynced: new Date().toISOString(),
    }))
  );

  const handleSync = async () => {
    setSyncing(true);
    toast.info("Syncing clients from core app...");
    
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setClientStatuses(prev => 
      prev.map(status => ({
        ...status,
        lastSynced: new Date().toISOString(),
      }))
    );
    
    setSyncing(false);
    toast.success("Clients synced successfully");
  };

  const toggleClientStatus = (clientId: string) => {
    setClientStatuses(prev =>
      prev.map(status =>
        status.id === clientId
          ? { ...status, enabled: !status.enabled }
          : status
      )
    );
    
    const client = mockClients.find(c => c.id === clientId);
    const newStatus = !clientStatuses.find(s => s.id === clientId)?.enabled;
    toast.success(`${client?.name} ${newStatus ? 'enabled' : 'disabled'}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-verdo-navy/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-verdo-navy" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
              <p className="text-muted-foreground mt-1">
                Sync and manage client access to the application
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="bg-verdo-navy hover:bg-verdo-navy-light text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync Clients
          </Button>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Client Directory</CardTitle>
            <CardDescription>
              Clients synced from core application. Toggle to enable or disable access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-verdo-navy hover:bg-verdo-navy">
                  <TableHead className="text-white">Client Name</TableHead>
                  <TableHead className="text-white">Client ID</TableHead>
                  <TableHead className="text-white">Last Synced</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClients.map(client => {
                  const status = clientStatuses.find(s => s.id === client.id);
                  return (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="text-muted-foreground">{client.id}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {status ? formatDate(status.lastSynced) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status?.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {status?.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm text-muted-foreground">
                            {status?.enabled ? 'Disable' : 'Enable'}
                          </span>
                          <Switch
                            checked={status?.enabled || false}
                            onCheckedChange={() => toggleClientStatus(client.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
