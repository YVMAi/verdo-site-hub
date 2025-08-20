
import React, { useState, useMemo } from 'react';
import { format, parseISO, parse } from "date-fns";
import { Calendar, Filter, ChevronDown, ChevronRight, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GrassCuttingSiteData, GrassCuttingHistoricEntry } from "@/types/grassCutting";
import { CollapsibleBlockHeader } from "./CollapsibleBlockHeader";

interface CompactGrassCuttingHistoricProps {
  data: GrassCuttingSiteData | null;
}

// Helper function to parse the date format used in the data (dd-MMM-yy)
const parseDateString = (dateString: string): Date => {
  try {
    // First try to parse as ISO format
    const isoDate = parseISO(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    
    // If that fails, try to parse as dd-MMM-yy format
    const parsedDate = parse(dateString, "dd-MMM-yy", new Date());
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    
    // If both fail, return current date as fallback
    console.warn(`Unable to parse date: ${dateString}`);
    return new Date();
  } catch (error) {
    console.warn(`Error parsing date: ${dateString}`, error);
    return new Date();
  }
};

export const CompactGrassCuttingHistoric: React.FC<CompactGrassCuttingHistoricProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [expandedBlocks, setExpandedBlocks] = useState<{[key: string]: boolean}>({});

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  const historicEntries: GrassCuttingHistoricEntry[] = useMemo(() => {
    if (!data || !data.historicEntries) return [];

    let filteredEntries = [...data.historicEntries];

    if (searchTerm) {
      filteredEntries = filteredEntries.filter(entry =>
        entry.remarks.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMonth) {
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = parseDateString(entry.date);
        const entryMonth = format(entryDate, "MMM-yyyy");
        return entryMonth === selectedMonth;
      });
    }

    return filteredEntries.sort((a, b) => {
      const dateA = parseDateString(a.date);
      const dateB = parseDateString(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [data, searchTerm, selectedMonth]);

  const availableMonths = useMemo(() => {
    if (!data || !data.historicEntries) return [];
    const months = new Set<string>();
    data.historicEntries.forEach(entry => {
      const entryDate = parseDateString(entry.date);
      months.add(format(entryDate, "MMM-yyyy"));
    });
    return Array.from(months);
  }, [data]);

  return (
    <div className="bg-white rounded border">
      <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <span>Historic Grass Cutting Data</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-white/10">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="px-3 py-2 bg-gray-50 border-b flex flex-wrap gap-2 items-center text-xs">
        <Input
          type="search"
          placeholder="Search remarks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-7 text-xs flex-1 min-w-[120px]"
        />
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue placeholder="Filter by month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Months</SelectItem>
            {availableMonths.map(month => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary">
          {historicEntries.length} Records
        </Badge>
      </div>

      <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0">
            <tr className="bg-verdo-navy text-white">
              <th className="px-2 py-1 text-left font-medium border border-gray-300 w-24">Date</th>
              {data?.blocks.map(block => (
                <CollapsibleBlockHeader
                  key={block.id}
                  blockName={block.name}
                  blockId={block.id}
                  inverterCount={block.inverters.length}
                  isExpanded={expandedBlocks[block.id]}
                  onToggle={() => toggleBlock(block.id)}
                />
              ))}
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600 w-20">Total</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500 w-16">Rain</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500 w-32">Remarks</th>
            </tr>
            {Object.keys(expandedBlocks).some(key => expandedBlocks[key]) && (
              <tr className="bg-verdo-navy-light text-white">
                <th className="px-2 py-1 border border-gray-300"></th>
                {data?.blocks.map(block => (
                  expandedBlocks[block.id] ? (
                    block.inverters.map(inverter => (
                      <th key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center font-medium border border-gray-300 w-16">
                        {inverter.id}
                      </th>
                    ))
                  ) : null
                ))}
                <th className="px-2 py-1 border border-gray-300"></th>
                <th className="px-2 py-1 border border-gray-300"></th>
                <th className="px-2 py-1 border border-gray-300"></th>
              </tr>
            )}
          </thead>
          <tbody>
            {historicEntries.map((entry, index) => (
              <tr key={`${entry.date}-${index}`} className="bg-white">
                <td className="px-2 py-1 border border-gray-300">{entry.date}</td>
                {data?.blocks.map(block => {
                  if (expandedBlocks[block.id]) {
                    return block.inverters.map(inverter => {
                      const key = `${block.id}-${inverter.id}`;
                      const value = entry.inverterData[key] || '-';
                      return (
                        <td key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300">
                          {value}
                        </td>
                      );
                    });
                  } else {
                    const blockTotal = Object.keys(entry.inverterData)
                      .filter(key => key.startsWith(`${block.id}-`))
                      .reduce((sum, key) => sum + (Number(entry.inverterData[key]) || 0), 0);
                    return (
                      <td key={block.id} className="px-2 py-1 text-center border border-gray-300">
                        {blockTotal}
                      </td>
                    );
                  }
                })}
                <td className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-50">{entry.dailyActual}</td>
                <td className="px-2 py-1 text-center border border-gray-300 bg-yellow-50">{entry.rainfallMM}</td>
                <td className="px-2 py-1 border border-gray-300">{entry.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
