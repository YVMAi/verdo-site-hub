import React, { useState, useMemo } from 'react';
import { CleaningSiteData } from "@/types/cleaning";
import { Button } from "@/components/ui/button";
import { Download, Edit2, Save } from "lucide-react";
import { SearchAndFilter } from '../grassCutting/SearchAndFilter';
import { CollapsibleBlockHeader } from '../grassCutting/CollapsibleBlockHeader';

interface CompactCleaningHistoricProps {
  data: CleaningSiteData | null;
  onDataChange?: (data: CleaningSiteData) => void;
}

export const CompactCleaningHistoric: React.FC<CompactCleaningHistoricProps> = ({ data, onDataChange }) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [editingEntries, setEditingEntries] = useState<Set<string>>(new Set());
  const [expandedBlocks, setExpandedBlocks] = useState<{[key: string]: boolean}>({
    'block-1': true,
    'block-2': true,
    'block-3': true,
    'block-4': true
  });

  // Function to determine which blocks should be visible based on search
  const getVisibleBlocks = useMemo(() => {
    if (!data) return [];
    
    if (!searchTerm) {
      return data.blocks; // Show all blocks if no search term
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    // Check if searching for a specific block
    const blockMatches = data.blocks.filter(block => {
      return block.name.toLowerCase().includes(searchLower) || 
             `block ${block.id}`.toLowerCase().includes(searchLower);
    });
    
    if (blockMatches.length > 0) {
      return blockMatches; // Return only matching blocks
    }
    
    // If not searching for blocks specifically, show all blocks
    return data.blocks;
  }, [data?.blocks, searchTerm]);

  // Enhanced filtering with search capabilities
  const filteredEntries = useMemo(() => {
    if (!data || !data.historicEntries) return [];
    
    let entries = data.historicEntries;

    // Enhanced search filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      entries = entries.filter(entry => {
        // Search in date
        if (entry.date.toLowerCase().includes(searchLower)) return true;
        
        // Search in remarks
        if (entry.remarks.toLowerCase().includes(searchLower)) return true;
        
        // Search in rainfall
        if (entry.rainfallMM.toLowerCase().includes(searchLower)) return true;
        
        // Search in block names
        if (searchLower.includes('block')) {
          data.blocks.forEach(block => {
            if (block.name.toLowerCase().includes(searchLower)) return true;
          });
        }
        
        // Search in inverter IDs
        if (searchLower.includes('inv')) {
          return true;
        }
        
        // Search in numerical values
        const numericSearch = searchTerm.replace(/[^\d.-]/g, '');
        if (numericSearch) {
          // Check planned, cleaned, uncleaned
          if (String(entry.plannedModules).includes(numericSearch)) return true;
          if (String(entry.totalCleaned).includes(numericSearch)) return true;
          if (String(entry.totalUncleaned).includes(numericSearch)) return true;
          
          // Check inverter data
          for (const [key, value] of Object.entries(entry.inverterData)) {
            if (String(value).includes(numericSearch)) return true;
          }
        }
        
        return false;
      });
    }

    // Date range filtering
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

    // Month filtering
    if (selectedMonths.length > 0) {
      entries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        const monthName = entryDate.toLocaleDateString('en-US', { month: 'long' });
        return selectedMonths.includes(monthName);
      });
    }

    return entries;
  }, [data?.historicEntries, searchTerm, dateFilter, selectedMonths]);

  if (!data) {
    return (
      <div className="bg-white rounded border p-4 text-center text-gray-500 text-sm">
        Select client and site to view historic data
      </div>
    );
  }

  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

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
          entry.plannedModules = Number(editValues[cellKey]) || 0;
        } else if (field === 'cleaned') {
          entry.totalCleaned = Number(editValues[cellKey]) || 0;
        } else if (field === 'uncleaned') {
          entry.totalUncleaned = Number(editValues[cellKey]) || 0;
        } else if (field === 'rainfall') {
          entry.rainfallMM = editValues[cellKey];
        } else if (field === 'remarks') {
          entry.remarks = editValues[cellKey];
        } else {
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
    getVisibleBlocks.forEach(block => {
      block.inverters.forEach(inverter => {
        headers.push(`${block.name}-${inverter.id}`);
      });
    });
    headers.push('Planned', 'Cleaned', 'Uncleaned', 'Rainfall', 'Remarks');

    const rows: string[][] = [];
    
    const totalModulesRow = ['', 'Total Modules'];
    getVisibleBlocks.forEach(block => {
      block.inverters.forEach(inverter => {
        totalModulesRow.push(String(inverter.totalModules));
      });
    });
    totalModulesRow.push('', '', '', '', '');
    rows.push(totalModulesRow);

    const cyclesRow = ['', 'Cycles Completed'];
    getVisibleBlocks.forEach(block => {
      block.inverters.forEach(inverter => {
        cyclesRow.push((inverter.modulesCleaned / inverter.totalModules).toFixed(2));
      });
    });
    cyclesRow.push('', '', '', '', '');
    rows.push(cyclesRow);

    filteredEntries.forEach(entry => {
      const row = [entry.date, 'Historic Data'];
      getVisibleBlocks.forEach(block => {
        block.inverters.forEach(inverter => {
          const value = entry.inverterData[`${block.id}-${inverter.id}`] || 0;
          row.push(String(value));
        });
      });
      row.push(
        String(entry.plannedModules),
        String(entry.totalCleaned),
        String(entry.totalUncleaned),
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
    link.setAttribute('download', `cleaning-historic-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <span>Historic Cleaning Data</span>
        <div className="flex gap-2">
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="bg-white text-[#1e3a8a] hover:bg-gray-100"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onClearSearch={clearSearch}
        selectedMonths={selectedMonths}
        onMonthsChange={setSelectedMonths}
      />

      <div className="overflow-x-auto" style={{ maxHeight: '500px' }}>
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0">
            <tr className="bg-blue-900 text-white">
              <th className="px-2 py-1 text-left font-medium border border-gray-300 w-32">Field</th>
              {getVisibleBlocks.map(block => (
                <CollapsibleBlockHeader
                  key={block.id}
                  blockName={block.name}
                  blockId={block.id}
                  inverterCount={block.inverters.length}
                  isExpanded={expandedBlocks[block.id]}
                  onToggle={() => toggleBlockExpansion(block.id)}
                />
              ))}
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Planned</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Cleaned</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Uncleaned</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500">Rainfall</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500 w-32">Remarks</th>
            </tr>
            <tr className="bg-blue-800 text-white">
              <th className="px-2 py-1 text-left font-medium border border-gray-300">Inverter</th>
              {getVisibleBlocks.map(block => (
                expandedBlocks[block.id] ? (
                  block.inverters.map(inverter => (
                    <th key={`${block.id}-${inverter.id}`} className="px-2 py-1 text-center font-medium border border-gray-300 w-16">
                      {inverter.id}
                    </th>
                  ))
                ) : (
                  <th key={`${block.id}-collapsed`} className="px-2 py-1 text-center font-medium border border-gray-300 w-16">
                    {block.inverters.length} INVs
                  </th>
                )
              ))}
              <th className="px-2 py-1 border border-gray-300"></th>
              <th className="px-2 py-1 border border-gray-300"></th>
              <th className="px-2 py-1 border border-gray-300"></th>
              <th className="px-2 py-1 border border-gray-300"></th>
              <th className="px-2 py-1 border border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {/* Total Modules */}
            <tr className="bg-blue-50">
              <td className="px-2 py-1 font-medium border border-gray-300">Total Modules</td>
              {getVisibleBlocks.map(block => (
                expandedBlocks[block.id] ? (
                  block.inverters.map(inverter => (
                    <td key={`total-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-blue-100">
                      {inverter.totalModules}
                    </td>
                  ))
                ) : (
                  <td key={`total-${block.id}-collapsed`} className="px-2 py-1 text-center border border-gray-300 bg-blue-100">
                    {block.inverters.reduce((sum, inv) => sum + inv.totalModules, 0)}
                  </td>
                )
              ))}
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
            </tr>

            {/* Modules Cleaned */}
            <tr className="bg-purple-50">
              <td className="px-2 py-1 font-medium border border-gray-300">Modules Cleaned</td>
              {getVisibleBlocks.map(block => (
                expandedBlocks[block.id] ? (
                  block.inverters.map(inverter => (
                    <td key={`cleaned-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-purple-100">
                      {inverter.modulesCleaned}
                    </td>
                  ))
                ) : (
                  <td key={`cleaned-${block.id}-collapsed`} className="px-2 py-1 text-center border border-gray-300 bg-purple-100">
                    {block.inverters.reduce((sum, inv) => sum + inv.modulesCleaned, 0)}
                  </td>
                )
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
              {getVisibleBlocks.map(block => (
                expandedBlocks[block.id] ? (
                  block.inverters.map(inverter => (
                    <td key={`cycles-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-green-100">
                      {(inverter.modulesCleaned / inverter.totalModules).toFixed(2)}
                    </td>
                  ))
                ) : (
                  <td key={`cycles-${block.id}-collapsed`} className="px-2 py-1 text-center border border-gray-300 bg-green-100">
                    {(block.inverters.reduce((sum, inv) => sum + inv.modulesCleaned, 0) / 
                      block.inverters.reduce((sum, inv) => sum + inv.totalModules, 0)).toFixed(2)}
                  </td>
                )
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
                  {getVisibleBlocks.map(block => (
                    expandedBlocks[block.id] ? (
                      block.inverters.map(inverter => {
                        const cellKey = `${entry.date}-${block.id}-${inverter.id}`;
                        const value = entry.inverterData[`${block.id}-${inverter.id}`] || 0;
                        return (
                          <td key={cellKey} className={`px-2 py-1 border border-gray-300 ${isEditable ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                            {renderEditableCell(cellKey, value)}
                          </td>
                        );
                      })
                    ) : (
                      <td key={`${entry.date}-${block.id}-collapsed`} className={`px-2 py-1 border border-gray-300 ${isEditable ? 'bg-yellow-100' : 'bg-gray-100'} text-center text-xs`}>
                        {block.inverters.reduce((sum, inv) => sum + (entry.inverterData[`${block.id}-${inv.id}`] || 0), 0)}
                      </td>
                    )
                  ))}
                  <td className={`px-2 py-1 border border-gray-300 ${isEditable ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {renderEditableCell(`${entry.date}-planned`, entry.plannedModules)}
                  </td>
                  <td className={`px-2 py-1 border border-gray-300 ${isEditable ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {renderEditableCell(`${entry.date}-cleaned`, entry.totalCleaned)}
                  </td>
                  <td className={`px-2 py-1 border border-gray-300 ${isEditable ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {renderEditableCell(`${entry.date}-uncleaned`, entry.totalUncleaned)}
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
                <td colSpan={getVisibleBlocks.reduce((acc, block) => acc + (expandedBlocks[block.id] ? block.inverters.length : 1), 0) + 6} className="px-2 py-4 text-center text-gray-500">
                  {searchTerm || dateFilter !== 'all' || selectedMonths.length > 0 ? 'No matching records found' : 'No historic entries found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
