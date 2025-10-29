import { useState } from "react";
import { Download, CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useClient } from "@/contexts/ClientContext";
import { mockSites } from "@/data/mockGenerationData";
import { mockHistoricReports } from "@/data/mockReportData";

export default function Reports() {
  const { selectedClient, selectedSite, setSelectedSite } = useClient();
  const availableSites = selectedClient ? mockSites.filter(site => site.clientId === selectedClient.id) : [];
  const [dateRange, setDateRange] = useState<string>("last-30-days");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSiteChange = (siteId: string) => {
    const site = availableSites.find(s => s.id === siteId) || null;
    setSelectedSite(site);
  };

  const filteredReports = mockHistoricReports.filter(report => {
    const matchesSearch = searchQuery === "" || 
      report.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportDate.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

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
        <div className="px-6 py-6">
          {/* Historic Reports Section */}
          <Card>
            <CardHeader className="space-y-4">
              <div>
                <CardTitle>Download History</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  View and download previously generated reports
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.reportTitle}</TableCell>
                          <TableCell>{report.fileName}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() => window.open(report.fileUrl, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}