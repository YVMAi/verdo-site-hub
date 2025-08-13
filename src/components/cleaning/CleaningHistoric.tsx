
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CalendarIcon, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockCleaningData } from '@/data/mockCleaningData';

interface CleaningHistoricProps {
  selectedClient: any;
  selectedSite: any;
}

export const CleaningHistoric: React.FC<CleaningHistoricProps> = ({
  selectedClient,
  selectedSite
}) => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [filterBlock, setFilterBlock] = useState<string>('');
  const [filterInverter, setFilterInverter] = useState<string>('');
  const [filterCleaningType, setFilterCleaningType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Filter and pagination logic
  const filteredData = mockCleaningData.filter(entry => {
    if (dateFrom && entry.date < dateFrom) return false;
    if (dateTo && entry.date > dateTo) return false;
    if (filterBlock && entry.block !== filterBlock) return false;
    if (filterInverter && entry.inverter !== filterInverter) return false;
    if (filterCleaningType && entry.cleaningType !== filterCleaningType) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Block', 'Inverter', 'SCB', 'String Table', 'Modules Cleaned', 'Water (L)', 'Rainfall', 'Remarks'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(entry => [
        format(entry.date, 'yyyy-MM-dd'),
        entry.cleaningType,
        entry.block,
        entry.inverter,
        entry.scbNumber,
        entry.stringTableNumber || '',
        entry.modulesCleaned || '',
        entry.waterConsumption || '',
        entry.rainfall || '',
        `"${entry.remarks || ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaning-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!selectedClient || !selectedSite) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Please select a client and site to view historical data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : <span>From date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : <span>To date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Block</label>
            <Select value={filterBlock} onValueChange={setFilterBlock}>
              <SelectTrigger>
                <SelectValue placeholder="All blocks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All blocks</SelectItem>
                <SelectItem value="Block A">Block A</SelectItem>
                <SelectItem value="Block B">Block B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Inverter</label>
            <Input
              value={filterInverter}
              onChange={(e) => setFilterInverter(e.target.value)}
              placeholder="Filter by inverter"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={filterCleaningType} onValueChange={setFilterCleaningType}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="Wet">Wet</SelectItem>
                <SelectItem value="Dry">Dry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={exportToCSV} className="w-full bg-[hsl(var(--verdo-jade))] hover:bg-[hsl(var(--verdo-jade-light))]">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b bg-[hsl(var(--verdo-navy))] text-white">
          <h3 className="text-lg font-semibold">Historical Cleaning Data</h3>
          <p className="text-sm opacity-90">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} records
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-amber-100">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Inverter</TableHead>
                <TableHead>SCB Number</TableHead>
                <TableHead>String Table</TableHead>
                <TableHead>Modules Cleaned</TableHead>
                <TableHead>Water (L)</TableHead>
                <TableHead>Rainfall (mm)</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Verified By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((entry, index) => (
                <TableRow key={entry.id} className={index % 2 === 0 ? "bg-white" : "bg-green-50"}>
                  <TableCell className="font-medium">{format(entry.date, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      entry.cleaningType === 'Wet' ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                    )}>
                      {entry.cleaningType}
                    </span>
                  </TableCell>
                  <TableCell>{entry.block}</TableCell>
                  <TableCell>{entry.inverter}</TableCell>
                  <TableCell>{entry.scbNumber}</TableCell>
                  <TableCell>{entry.stringTableNumber || '-'}</TableCell>
                  <TableCell>{entry.modulesCleaned || '-'}</TableCell>
                  <TableCell>{entry.waterConsumption || '-'}</TableCell>
                  <TableCell>{entry.rainfall || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.remarks || '-'}</TableCell>
                  <TableCell>{entry.verifiedBy || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {paginatedData.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No cleaning records found matching your filters.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};
