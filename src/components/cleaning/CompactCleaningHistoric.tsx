
import React, { useState, useMemo } from 'react';
import { format, parseISO, isValid } from "date-fns";
import { Calendar, Filter, ChevronDown, ChevronRight, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CleaningSiteData, CleaningHistoricEntry } from "@/types/cleaning";

interface CompactCleaningHistoricProps {
  data: CleaningSiteData | null;
}

// Helper function to safely parse and format dates
const safeDateFormat = (dateString: string, formatPattern: string): string => {
  try {
    const parsedDate = parseISO(dateString);
    if (isValid(parsedDate)) {
      return format(parsedDate, formatPattern);
    }
    // If parseISO fails, return the original string
    return dateString;
  } catch (error) {
    console.warn(`Error formatting date: ${dateString}`, error);
    return dateString;
  }
};

export const CompactCleaningHistoric: React.FC<CompactCleaningHistoricProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [expandedBlocks, setExpandedBlocks] = useState<{[key: string]: boolean}>({});

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  const filteredHistoricData = useMemo(() => {
    if (!data || !data.historicEntries) return [];

    let filteredData = data.historicEntries;

    if (searchTerm) {
      filteredData = filteredData.filter(entry =>
        entry.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        safeDateFormat(entry.date, "dd-MMM-yy").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMonth) {
      filteredData = filteredData.filter(entry => {
        const monthFromDate = safeDateFormat(entry.date, "MMM");
        return monthFromDate.toLowerCase() === selectedMonth.toLowerCase();
      });
    }

    return filteredData;
  }, [data, searchTerm, selectedMonth]);

  const availableMonths = useMemo(() => {
    if (!data || !data.historicEntries) return [];
    const months = new Set<string>();
    data.historicEntries.forEach(entry => {
      const month = safeDateFormat(entry.date, "MMM");
      if (month && month !== entry.date) { // Only add if formatting was successful
        months.add(month);
      }
    });
    return Array.from(months);
  }, [data]);

  return (
    <div className="bg-white rounded border">
      <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <span>Historic Cleaning Data</span>
        <Badge variant="outline">
          {data?.historicEntries?.length || 0} entries
        </Badge>
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
            <SelectItem value="all">All Months</SelectItem>
            {availableMonths.map(month => (
              <SelectItem key={month} value={month} className="text-xs">
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearchTerm("");
            setSelectedMonth("");
          }}
          className="h-7 w-7 p-0 hover:bg-gray-200"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0">
            <tr className="bg-[hsl(var(--verdo-navy))] text-white">
              <th className="px-2 py-1 text-left font-medium border border-gray-300 w-24">Date</th>
              {data?.blocks.map(block => (
                <th key={block.id} className="px-2 py-1 text-center font-medium border border-gray-300" colSpan={expandedBlocks[block.id] ? block.inverters.length : 1}>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBlock(block.id)}
                      className="h-5 w-5 p-0 hover:bg-blue-800 text-white"
                    >
                      {expandedBlocks[block.id] ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </Button>
                    <span className="text-xs">
                      {block.name} {!expandedBlocks[block.id] && `(${block.inverters.length})`}
                    </span>
                  </div>
                </th>
              ))}
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600 w-20">Total</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500 w-20">Rainfall</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500 w-32">Remarks</th>
            </tr>
            {Object.keys(expandedBlocks).some(key => expandedBlocks[key]) && (
              <tr className="bg-[hsl(var(--verdo-navy-light))] text-white">
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
            {filteredHistoricData.map(entry => (
              <tr key={entry.date} className="bg-white">
                <td className="px-2 py-1 border border-gray-300">{safeDateFormat(entry.date, "dd-MMM-yy")}</td>
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
                      .reduce((sum, key) => sum + (parseInt(entry.inverterData[key]?.toString() || '0') || 0), 0);
                    return (
                      <td key={block.id} className="px-2 py-1 text-center border border-gray-300">
                        {blockTotal}
                      </td>
                    );
                  }
                })}
                <td className="px-2 py-1 text-center border border-gray-300">{entry.totalCleaned}</td>
                <td className="px-2 py-1 text-center border border-gray-300">{entry.rainfallMM}</td>
                <td className="px-2 py-1 border border-gray-300">{entry.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
