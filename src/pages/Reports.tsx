import { FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClient } from "@/contexts/ClientContext";
import { mockSites } from "@/data/mockGenerationData";

export default function Reports() {
  const { selectedClient, selectedSite, setSelectedSite } = useClient();
  const availableSites = selectedClient ? mockSites.filter(site => site.clientId === selectedClient.id) : [];

  const handleSiteChange = (siteId: string) => {
    const site = availableSites.find(s => s.id === siteId) || null;
    setSelectedSite(site);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-[hsl(var(--verdo-navy))] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Report Generation</h1>
          <p className="text-sm text-white/80">Generate and manage reports</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Site Selector */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Select onValueChange={handleSiteChange} disabled={!selectedClient} value={selectedSite?.id || ""}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white h-8 text-sm">
                <SelectValue placeholder={selectedClient ? "Select a site..." : "Select client from sidebar first"} />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {availableSites.map(site => (
                  <SelectItem key={site.id} value={site.id} className="text-sm">
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Reports</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Generate and download reports for your sites
            </p>
          </div>
          
          <div className="bg-white border rounded-lg p-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Report generation features coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}