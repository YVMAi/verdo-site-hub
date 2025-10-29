import { useState } from "react";
import { FileText, Download, Search, CalendarIcon, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useClient } from "@/contexts/ClientContext";
import { mockSites } from "@/data/mockGenerationData";
import { mockReportDownloads } from "@/data/mockReportData";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Reports() {
  const { selectedClient, selectedSite, setSelectedSite } = useClient();
  const availableSites = selectedClient ? mockSites.filter(site => site.clientId === selectedClient.id) : [];
  const [startDate, setStartDate] = useState<Date>(new Date(2025, 9, 1)); // Oct 1, 2025
  const [endDate, setEndDate] = useState<Date>(new Date(2025, 9, 10)); // Oct 10, 2025
  const [searchQuery, setSearchQuery] = useState("");

  const handleSiteChange = (siteId: string) => {
    const site = availableSites.find(s => s.id === siteId) || null;
    setSelectedSite(site);
  };

  const handleGenerateReport = () => {
    if (!selectedSite) {
      toast.error("Please select a site first");
      return;
    }
    toast.success("Generating report...");
  };

  const filteredDownloads = mockReportDownloads.filter(download =>
    download.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    download.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
    download.dateRange.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Select Date Range Section */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-verdo-navy" />
                <h2 className="text-lg font-semibold">Select Date Range</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate DSM report as per the commercial data available in the sharepoint
              </p>
            </div>
            
            <div className="flex items-end gap-4">
              {/* Start Date */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[180px] justify-start text-left font-normal h-10",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? format(startDate, "dd MMM yyyy") : "Select date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  End Date <span className="text-red-500">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[180px] justify-start text-left font-normal h-10",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? format(endDate, "dd MMM yyyy") : "Select date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Generate Report Button */}
              <Button 
                onClick={handleGenerateReport}
                disabled={!selectedSite}
                className="bg-[hsl(var(--verdo-navy))] hover:bg-[hsl(var(--verdo-navy))]/90 text-white h-10 px-6"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>

        {/* Download History Section */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-verdo-navy" />
              <div>
                <h2 className="text-lg font-semibold">Download History</h2>
                <p className="text-sm text-muted-foreground">Recent DSM data downloads</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Downloads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                  <TableHead className="font-semibold text-gray-700">User Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Site</TableHead>
                  <TableHead className="font-semibold text-gray-700">Date Range</TableHead>
                  <TableHead className="font-semibold text-gray-700">File Name</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDownloads.length > 0 ? (
                  filteredDownloads.map((download) => (
                    <TableRow key={download.id}>
                      <TableCell className="font-medium">{download.dateTime}</TableCell>
                      <TableCell className="text-muted-foreground">{download.userName}</TableCell>
                      <TableCell>{download.site}</TableCell>
                      <TableCell>{download.dateRange}</TableCell>
                      <TableCell className="max-w-md truncate">{download.fileName}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-verdo-navy hover:text-verdo-navy hover:bg-verdo-navy/10"
                          onClick={() => toast.success("Downloading report...")}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No reports found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}