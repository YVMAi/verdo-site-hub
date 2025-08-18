
import React, { useState, useMemo } from 'react';
import { GrassCuttingSiteData } from "@/types/grassCutting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, Filter, Edit2, Save, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompactGrassCuttingHistoricProps {
  data: GrassCuttingSiteData | null;
  onDataChange?: (data: GrassCuttingSiteData) => void;
}

export const CompactGrassCuttingHistoric: React.FC<CompactGrassCuttingHistoricProps> = ({ data, onDataChange }) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [editingEntries, setEditingEntries] = useState<Set<string>>(new Set());

  // Move all hooks before any conditional logic
  const filteredEntries = useMemo(() => {
    if (!data || !data.historicEntries) return [];
    
    let entries = data.historicEntries;

    // Filter by search term
    if (searchTerm) {
      entries = entries.filter(entry => 
        entry.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.rainfallMM.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(today.getMonth() - 3);
          break;
      }
      
      entries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= filterDate;
      });
    }

    return entries;
  }, [data?.historicEntries, searchTerm, dateFilter]);

  // Now handle the conditional return after all hooks
  if (!data) {
    return (
      <div className="bg-white rounded border p-4 text-center text-gray-500 text-sm">
        Select client and site to view historic data
      </div>
    );
  }

  const toggleEntryEditing = (date: string) => {
    setEditingEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
        setEditingCell(null);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const handleCellClick = (cellKey: string, currentValue: any) => {
    const [date] = cellKey.split('-', 1);
    if (editingEntries.has(date)) {
      setEditingCell(cellKey);
      setEditValues(prev => ({ ...prev, [cellKey]: String(currentValue) }));
    }
  };

  const handleCellBlur = (cellKey: string) => {
    setEditingCell(null);
    if (onDataChange && editValues[cellKey] !== undefined) {
      const newData = { ...data };
      const [date, field] = cellKey.split('-', 2);
      const entryIndex = newData.historicEntries.findIndex(entry => entry.date === date);
      
      if (entryIndex !== -1) {
        const entry = { ...newData.historicEntries[entryIndex] };
        
        if (field === 'planned') {
          entry.plannedStrings = Number(editValues[cellKey]) || 0;
        } else if (field === 'actual') {
          entry.dailyActual = Number(editValues[cellKey]) || 0;
        } else if (field === 'deviation') {
          entry.deviation = Number(editValues[cellKey]) || 0;
        } else if (field === 'rainfall') {
          entry.rainfallMM = editValues[cellKey];
        } else if (field === 'remarks') {
          entry.remarks = editValues[cellKey];
        } else {
          // Handle inverter data
          const remainingKey = cellKey.replace(`${date}-`, '');
          entry.inverterData = {
            ...entry.inverterData,
            [remainingKey]: Number(editValues[cellKey]) || 0
          };
        }
        
        newData.historicEntries[entryIndex] = entry;
        onDataChange(newData);
      }
    }
    console.log(`Saving ${cellKey}: ${editValues[cellKey]}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent, cellKey: string) => {
    if (e.key === 'Enter') {
      handleCellBlur(cellKey);
    }
  };

  const exportToCSV = () => {
    if (!data) return;

    const headers = ['Date', 'Field'];
    data.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        headers.push(`${block.name}-${inverter.id}`);
      });
    });
    headers.push('Planned', 'Actual', 'Deviation', 'Rainfall', 'Remarks');

    const rows: string[][] = [];
    
    // Add total strings row
    const totalStringsRow = ['', 'Total Strings'];
    data.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        totalStringsRow.push(String(inverter.totalStrings));
      });
    });
    totalStringsRow.push('', '', '', '', '');
    rows.push(totalStringsRow);

    // Add cycles completed row
    const cyclesRow = ['', 'Cycles Completed'];
    data.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        cyclesRow.push((inverter.grassCuttingDone / inverter.totalStrings).toFixed(2));
      });
    });
    cyclesRow.push('', '', '', '', '');
    rows.push(cyclesRow);

    // Add historic entries
    filteredEntries.forEach(entry => {
      const row = [entry.date, 'Historic Data'];
      data.blocks.forEach(block => {
        block.inverters.forEach(inverter => {
          const value = entry.inverterData[`${block.id}-${inverter.id}`] || 0;
          row.push(String(value));
        });
      });
      row.push(
        String(entry.plannedStrings),
        String(entry.dailyActual),
        String(entry.deviation),
        entry.rainfallMM,
        entry.remarks
      );
      rows.push(row);
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `grass-cutting-historic-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getColumnWidth = (values: any[], defaultWidth: string = "w-16") => {
    const maxLength = Math.max(...values.map(v => String(v).length), 0);
    if (maxLength > 8) return "w-24";
    if (maxLength > 4) return "w-20";
    return defaultWidth;
  };

  const renderEditableCell = (cellKey: string, value: any, className: string = "", isRemarks: boolean = false) => {
    const [date] = cellKey.split('-', 1);
    const isEntryEditable = editingEntries.has(date);
    const isEditing = editingCell === cellKey && isEntryEditable;
    
    if (isEditing) {
      if (isRemarks) {
        return (
          <textarea
            className={`w-full h-auto min-h-6 text-xs border border-blue-500 bg-white p-1 resize-none ${className}`}
            style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            value={editValues[cellKey] || String(value)}
            onChange={(e) => setEditValues(prev => ({ ...prev, [cellKey]: e.target.value }))}
            onBlur={() => handleCellBlur(cellKey)}
            onKeyPress={(e) => handleKeyPress(e, cellKey)}
            autoFocus
          />
        );
      }
      
      return (
        <input
          type="text"
          className={`w-full h-6 text-center text-xs border border-blue-500 bg-white ${className}`}
          value={editValues[cellKey] || String(value)}
          onChange={(e) => setEditValues(prev => ({ ...prev, [cellKey]: e.target.value }))}
          onBlur={() => handleCellBlur(cellKey)}
          onKeyPress={(e) => handleKeyPress(e, cellKey)}
          autoFocus
        />
      );
    }

    return (
      <div
        className={`w-full h-6 text-center text-xs ${isEntryEditable ? 'cursor-pointer hover:bg-blue-50' : ''} flex items-center justify-center ${className} ${isRemarks ? 'whitespace-pre-wrap break-words' : ''}`}
        onClick={() => isEntryEditable && handleCellClick(cellKey, value)}
        style={isRemarks ? { minHeight: '24px', textAlign: 'left', padding: '2px' } : {}}
      >
        {value}
      </div>
    );
  };

  return (
    <div className="bg-white rounded border">
       <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <span>Historic Grass Cutting Data</span>
        <div className="flex gap-2">
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="px-3 py-2 bg-gray-50 border-b space-y-2">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
            <Input
              placeholder="Search by date, remarks, or rainfall..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Compact Legend */}
        <div className="text-xs flex gap-4">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300"></div>
            Status
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300"></div>
            Calculated
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300"></div>
            Input (Click to Edit)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto" style={{ maxHeight: '500px' }}>
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0">
            <tr className="bg-blue-900 text-white">
              <th className="px-2 py-1 text-left font-medium border border-gray-300 w-32">Field</th>
              {data.blocks.map(block => (
                <th key={block.id} className="px-2 py-1 text-center font-medium border border-gray-300" colSpan={block.inverters.length}>
                  {block.name}
                </th>
              ))}
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Planned</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Actual</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Deviation</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500">Rainfall</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500 w-32">Remarks</th>
            </tr>
            <tr className="bg-blue-800 text-white">
              <th className="px-2 py-1 text-left font-medium border border-gray-300">Inverter</th>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <th key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center font-medium border border-gray-300 w-16">
                    {inverter.id}
                  </th>
                ))
              ))}
              <th className="px-2 py-1 border border-gray-300"></th>
              <th className="px-2 py-1 border border-gray-300"></th>
              <th className="px-2 py-1 border border-gray-300"></th>
              <th className="px-2 py-1 border border-gray-300"></th>
              <th className="px-2 py-1 border border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {/* Total Strings */}
            <tr className="bg-blue-50">
              <td className="px-2 py-1 font-medium border border-gray-300">Total Strings</td>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <td key={`total-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-blue-100">
                    {inverter.totalStrings}
                  </td>
                ))
              ))}
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
            </tr>

            {/* Total Strings Cleaned */}
            <tr className="bg-purple-50">
              <td className="px-2 py-1 font-medium border border-gray-300">Total Strings Cleaned</td>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <td key={`cleaned-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-purple-100">
                    {inverter.grassCuttingDone}
                  </td>
                ))
              ))}
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
            </tr>

            {/* Cycles Completed */}
            <tr className="bg-green-50">
              <td className="px-2 py-1 font-medium border border-gray-300">Cycles Completed</td>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <td key={`cycles-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-green-100">
                    {(inverter.grassCuttingDone / inverter.totalStrings).toFixed(2)}
                  </td>
                ))
              ))}
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
            </tr>

            {/* Historic Entries */}
            {filteredEntries.map((entry, index) => {
              const isEditable = editingEntries.has(entry.date);
              return (
                <tr key={entry.date} className={isEditable ? "bg-yellow-50" : "bg-gray-50"}>
                  <td className="px-2 py-1 font-medium border border-gray-300">
                    <div className="flex items-center justify-between">
                      <div>
                        {isEditable && (
                          <span className="text-xs bg-orange-200 px-1 rounded mr-1">EDIT</span>
                        )}
                        {entry.date}
                      </div>
                      <button
                        onClick={() => toggleEntryEditing(entry.date)}
                        className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                        title={isEditable ? "Save changes" : "Edit entry"}
                      >
                        {isEditable ? (
                          <Save className="w-3 h-3 text-green-600" />
                        ) : (
                          <Edit2 className="w-3 h-3 text-blue-600" />
                        )}
                      </button>
                    </div>
                  </td>
                  {data.blocks.map(block => (
                    block.inverters.map(inverter => {
                      const cellKey = `${entry.date}-${block.id}-${inverter.id}`;
                      const value = entry.inverterData[`${block.id}-${inverter.id}`] || 0;
                      return (
                        <td key={cellKey} className={`px-2 py-1 border border-gray-300 ${isEditable ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                          {renderEditableCell(cellKey, value)}
                        </td>
                      );
                    })
                  ))}
                  <td className={`px-2 py-1 border border-gray-300 ${isEditable ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {renderEditableCell(`${entry.date}-planned`, entry.plannedStrings)}
                  </td>
                  <td className={`px-2 py-1 border border-gray-300 ${isEditable ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {renderEditableCell(`${entry.date}-actual`, entry.dailyActual)}
                  </td>
                  <td className={`px-2 py-1 border border-gray-300 ${isEditable ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {renderEditableCell(`${entry.date}-deviation`, entry.deviation)}
                  </td>
                  <td className={`px-2 py-1 border border-gray-300 ${isEditable ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    {renderEditableCell(`${entry.date}-rainfall`, entry.rainfallMM)}
                  </td>
                  <td className={`px-2 py-1 border border-gray-300 ${isEditable ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    {renderEditableCell(`${entry.date}-remarks`, entry.remarks, "", true)}
                  </td>
                </tr>
              );
            })}
            
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={data.blocks.reduce((acc, block) => acc + block.inverters.length, 0) + 6} className="px-2 py-4 text-center text-gray-500">
                  No historic entries found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
