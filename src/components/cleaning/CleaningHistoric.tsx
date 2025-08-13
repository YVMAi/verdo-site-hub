
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Download, Search, CalendarIcon, Filter, Droplets, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Client, Site } from '@/types/generation';
import { mockCleaningData } from '@/data/mockCleaningData';
import { useSidebar } from '@/components/ui/sidebar';

interface CleaningHistoricProps {
  site: Site;
  client: Client;
}

export const CleaningHistoric: React.FC<CleaningHistoricProps> = ({ site, client }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [selectedInverter, setSelectedInverter] = useState<string>('');
  const [selectedCleaningType, setSelectedCleaningType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Filter data based on search criteria
  const filteredData = mockCleaningData.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.inverter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.scb.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBlock = !selectedBlock || entry.block === selectedBlock;
    const matchesInverter = !selectedInverter || entry.inverter === selectedInverter;
    const matchesCleaningType = !selectedCleaningType || entry.cleaningType === selectedCleaningType;
    
    const entryDate = new Date(entry.date);
    const matchesDateFrom = !dateFrom || entryDate >= dateFrom;
    const matchesDateTo = !dateTo || entryDate <= dateTo;

    return matchesSearch && matchesBlock && matchesInverter && matchesCleaningType && matchesDateFrom && matchesDateTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = (format: 'csv' | 'excel') => {
    console.log(`Exporting ${filteredData.length} records as ${format}`);
    // Implementation would go here
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBlock('');
    setSelectedInverter('');
    setSelectedCleaningType('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setCurrentPage(1);
  };

  // Get unique values for filter dropdowns
  const uniqueBlocks = [...new Set(mockCleaningData.map(entry => entry.block))];
  const uniqueInverters = [...new Set(mockCleaningData.map(entry => entry.inverter))];

  return (
    <Card className="w-full">
      <CardHeader className={`${isCollapsed ? 'px-3 py-3' : 'px-4 py-4'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base sm:text-lg">Historical Cleaning Data</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={clearFilters}
              variant="outline" 
              size="sm"
              className="text-xs h-7"
            >
              <Filter className="w-3 h-3 mr-1" />
              Clear Filters
            </Button>
            <Button 
              onClick={() => handleExport('csv')}
              variant="outline" 
              size="sm"
              className="text-xs h-7"
            >
              <Download className="w-3 h-3 mr-1" />
              CSV
            </Button>
            <Button 
              onClick={() => handleExport('excel')}
              variant="outline" 
              size="sm"
              className="text-xs h-7"
            >
              <Download className="w-3 h-3 mr-1" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`${isCollapsed ? 'px-3 py-3' : 'px-4 py-4'} space-y-4`}>
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <div>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div>
            <Select value={selectedBlock} onValueChange={setSelectedBlock}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Blocks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" className="text-xs">All Blocks</SelectItem>
                {uniqueBlocks.map(block => (
                  <SelectItem key={block} value={block} className="text-xs">
                    {block}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={selectedInverter} onValueChange={setSelectedInverter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Inverters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" className="text-xs">All Inverters</SelectItem>
                {uniqueInverters.map(inverter => (
                  <SelectItem key={inverter} value={inverter} className="text-xs">
                    {inverter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={selectedCleaningType} onValueChange={setSelectedCleaningType}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" className="text-xs">All Types</SelectItem>
                <SelectItem value="wet" className="text-xs">Wet Cleaning</SelectItem>
                <SelectItem value="dry" className="text-xs">Dry Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 justify-start text-left font-normal text-xs",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 justify-start text-left font-normal text-xs",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {dateTo ? format(dateTo, "MMM dd") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Showing {paginatedData.length} of {filteredData.length} entries</span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#001F3F] hover:bg-[#001F3F]">
                  <TableHead className="text-white text-xs">Date</TableHead>
                  <TableHead className="text-white text-xs">Type</TableHead>
                  <TableHead className="text-white text-xs">Block</TableHead>
                  <TableHead className="text-white text-xs">Inverter</TableHead>
                  <TableHead className="text-white text-xs">SCB</TableHead>
                  <TableHead className="text-white text-xs">String Table</TableHead>
                  <TableHead className="text-white text-xs">Modules Cleaned</TableHead>
                  <TableHead className="text-white text-xs">Water (L)</TableHead>
                  <TableHead className="text-white text-xs">Rainfall (mm)</TableHead>
                  <TableHead className="text-white text-xs">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((entry, index) => (
                  <TableRow key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                    <TableCell className="text-xs">{format(new Date(entry.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge
                        variant={entry.cleaningType === 'wet' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {entry.cleaningType === 'wet' ? (
                          <><Droplets className="w-3 h-3 mr-1" />Wet</>
                        ) : (
                          <><Sun className="w-3 h-3 mr-1" />Dry</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{entry.block}</TableCell>
                    <TableCell className="text-xs">{entry.inverter}</TableCell>
                    <TableCell className="text-xs">{entry.scb}</TableCell>
                    <TableCell className="text-xs">{entry.stringTableNumber || '-'}</TableCell>
                    <TableCell className="text-xs font-medium">{entry.modulesCleaned}</TableCell>
                    <TableCell className="text-xs">{entry.waterConsumption || '-'}</TableCell>
                    <TableCell className="text-xs">{entry.rainfall || '0'}</TableCell>
                    <TableCell className="text-xs max-w-32 truncate" title={entry.remarks}>
                      {entry.remarks || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
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
        )}
      </CardContent>
    </Card>
  );
};
