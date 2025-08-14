import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Edit, Filter } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site, Client } from '@/types/generation';
import { mockBlocks, mockHistoricalData, mockGrassCuttingData } from '@/data/mockGrassCuttingData';

interface GrassCuttingHistoricProps {
  site: Site | null;
  client: Client | null;
}

export const GrassCuttingHistoric: React.FC<GrassCuttingHistoricProps> = ({ site, client }) => {
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [filterValue, setFilterValue] = useState('');

  const availableBlocks = useMemo(() => {
    return site ? mockBlocks.filter(block => block.siteId === site.id) : [];
  }, [site]);

  const siteData = useMemo(() => {
    if (!site) return [];
    return mockGrassCuttingData.filter(data => 
      availableBlocks.some(block => block.id === data.blockId)
    );
  }, [site, availableBlocks]);

  const filteredData = useMemo(() => {
    return mockHistoricalData.filter(entry => {
      const entryDate = new Date(entry.date);
      const matchesDateRange = entryDate >= dateRange.from && entryDate <= dateRange.to;
      const matchesFilter = filterValue === '' || 
        entry.date.includes(filterValue) ||
        entry.dailyActual.toString().includes(filterValue);
      
      return matchesDateRange && matchesFilter;
    });
  }, [dateRange, filterValue]);

  const isEditable = (date: string) => {
    if (!client) return false;
    const entryDate = new Date(date);
    const daysDiff = Math.floor((new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= (client.allowedEditDays || 7);
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    console.log(`Exporting grass cutting data as ${format}`);
    // Implementation for export functionality
  };

  if (!site) {
    return (
      <div className="bg-card border rounded-lg p-4 sm:p-8 text-center">
        <p className="text-muted-foreground">Select a site to view grass cutting historic data</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-semibold text-sm sm:text-base">Grass Cutting Historic Data</h3>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Input
                placeholder="Filter..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="h-8 w-32 text-xs"
              />
            </div>
            
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('csv')}
                className="text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('xlsx')}
                className="text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                XLSX
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Excel-style Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <table className="w-full border-collapse">
              {/* Header Row 1: Block Names */}
              <thead>
                <tr>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold w-24"></th>
                  {siteData.map((blockData) => (
                    <th 
                      key={blockData.blockId}
                      className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold text-center"
                      colSpan={blockData.inverters.length}
                    >
                      {blockData.blockName}
                    </th>
                  ))}
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold w-32">Remarks</th>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold w-24">Daily Actual</th>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold w-24">Daily Planned</th>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold w-24">Deviation</th>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold w-24">Deviation (%)</th>
                </tr>
                
                {/* Header Row 2: Inverter Names */}
                <tr>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold">Inverter</th>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <th 
                        key={inverter.inverterId}
                        className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold text-center w-20"
                      >
                        {inverter.inverterName}
                      </th>
                    ))
                  )}
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold"></th>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold">Grasscutting</th>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold"></th>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold"></th>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold"></th>
                </tr>

                {/* Static Rows */}
                <tr className="bg-gray-50">
                  <td className="p-2 border border-gray-300 text-xs font-medium">Total Strings</td>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <td key={`total-${inverter.inverterId}`} className="p-2 border border-gray-300 text-xs text-center">
                        {inverter.totalStrings}
                      </td>
                    ))
                  )}
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                </tr>

                <tr className="bg-white">
                  <td className="p-2 border border-gray-300 text-xs font-medium">Grass Cutting Done</td>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <td key={`done-${inverter.inverterId}`} className="p-2 border border-gray-300 text-xs text-center">
                        {inverter.grassCuttingDone}
                      </td>
                    ))
                  )}
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                </tr>

                <tr className="bg-gray-50">
                  <td className="p-2 border border-gray-300 text-xs font-medium">Cycles Completed</td>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <td key={`cycles-${inverter.inverterId}`} className="p-2 border border-gray-300 text-xs text-center">
                        {(inverter.grassCuttingDone / inverter.totalStrings).toFixed(2)}
                      </td>
                    ))
                  )}
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                  <td className="p-2 border border-gray-300"></td>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((entry, index) => (
                  <tr key={entry.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2 border border-gray-300 text-xs flex items-center gap-1">
                      {format(new Date(entry.date), 'dd-MMM-yy')}
                      {isEditable(entry.date) && (
                        <Button size="sm" variant="ghost" className="h-4 w-4 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                    {siteData.map((blockData) =>
                      blockData.inverters.map((inverter) => (
                        <td key={`data-${entry.date}-${inverter.inverterId}`} className="p-2 border border-gray-300 text-xs text-center">
                          {entry.blockInverterData[blockData.blockId]?.[inverter.inverterId]?.dailyGrassCutting || 0}
                        </td>
                      ))
                    )}
                    <td className="p-2 border border-gray-300 text-xs">NA</td>
                    <td className="p-2 border border-gray-300 text-xs text-center font-medium">
                      {entry.dailyActual}
                    </td>
                    <td className="p-2 border border-gray-300 text-xs text-center">
                      {entry.dailyPlanned}
                    </td>
                    <td className="p-2 border border-gray-300 text-xs text-center">
                      {entry.deviation}
                    </td>
                    <td className="p-2 border border-gray-300 text-xs text-center">
                      {entry.deviationPercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
          <span>Showing {filteredData.length} entries</span>
          <span>Rows per page: 25</span>
        </div>
      </div>
    </div>
  );
};