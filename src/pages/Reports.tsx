import { useState } from "react";
import { FileText, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useClient } from "@/contexts/ClientContext";
import { mockSites } from "@/data/mockGenerationData";

export default function Reports() {
  const { selectedClient, selectedSite, setSelectedSite } = useClient();
  const availableSites = selectedClient ? mockSites.filter(site => site.clientId === selectedClient.id) : [];
  const [dateRange, setDateRange] = useState<string>("last-30-days");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

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
        
        <div className="flex items-center gap-6">
          {/* Site Selector */}
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <Label htmlFor="site-select" className="text-white text-xs">Site</Label>
            <Select onValueChange={handleSiteChange} disabled={!selectedClient} value={selectedSite?.id || ""}>
              <SelectTrigger id="site-select" className="bg-white/10 border-white/20 text-white h-9 text-sm">
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

          {/* Date Range Selector */}
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <Label htmlFor="date-range-select" className="text-white text-xs">Date Range</Label>
            <Select onValueChange={setDateRange} value={dateRange}>
              <SelectTrigger id="date-range-select" className="bg-white/10 border-white/20 text-white h-9 text-sm">
                <SelectValue placeholder="Select date range..." />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="last-7-days" className="text-sm">Last 7 Days</SelectItem>
                <SelectItem value="last-30-days" className="text-sm">Last 30 Days</SelectItem>
                <SelectItem value="last-90-days" className="text-sm">Last 90 Days</SelectItem>
                <SelectItem value="this-month" className="text-sm">This Month</SelectItem>
                <SelectItem value="last-month" className="text-sm">Last Month</SelectItem>
                <SelectItem value="this-year" className="text-sm">This Year</SelectItem>
                <SelectItem value="last-year" className="text-sm">Last Year</SelectItem>
                <SelectItem value="custom" className="text-sm">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range Pickers */}
          {dateRange === "custom" && (
            <>
              <div className="flex flex-col gap-1.5 min-w-[160px]">
                <Label htmlFor="start-date" className="text-white text-xs">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        "bg-white/10 border-white/20 text-white h-9 text-sm hover:bg-white/20 justify-start text-left font-normal",
                        !startDate && "text-white/60"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5 min-w-[160px]">
                <Label htmlFor="end-date" className="text-white text-xs">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className={cn(
                        "bg-white/10 border-white/20 text-white h-9 text-sm hover:bg-white/20 justify-start text-left font-normal",
                        !endDate && "text-white/60"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
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