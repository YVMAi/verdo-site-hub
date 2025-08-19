
import React, { useState, useMemo } from 'react';
import { GrassCuttingSiteData } from "@/types/grassCutting";
import { Button } from "@/components/ui/button";
import { Download, Edit2 } from "lucide-react";
import { SearchAndFilter } from './SearchAndFilter';
import { CollapsibleBlockHeader } from './CollapsibleBlockHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CompactGrassCuttingHistoricProps {
  data: GrassCuttingSiteData | null;
  onDataChange?: (data: GrassCuttingSiteData) => void;
}

export const CompactGrassCuttingHistoric: React.FC<CompactGrassCuttingHistoricProps> = ({ data, onDataChange }) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [globalEditMode, setGlobalEditMode] = useState<boolean>(false);
  const [expandedBlocks, setExpandedBlocks] = useState<{[key: string]: boolean}>({
    '1': true,
    '2': true,
    '3': true,
    '4': true
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
          // Check planned, actual, deviation
          if (String(entry.plannedStrings).includes(numericSearch)) return true;
          if (String(entry.dailyActual).includes(numericSearch)) return true;
          if (String(entry.deviation).includes(numericSearch)) return true;
          
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

  const enableGlobalEditMode = () => {
    setGlobalEditMode(true);
  };

  const disableGlobalEditMode = () => {
    setGlobalEditMode(false);
    setEditingCell(null);
    setEditValues({});
  };

  const handleCellClick = (cellKey: string, currentValue: any) => {
    if (globalEditMode) {
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
    headers.push('Planned', 'Actual', 'Deviation', 'Remarks');

    const rows: string[][] = [];
    
    const totalStringsRow = ['', 'Total Strings'];
    getVisibleBlocks.forEach(block => {
      block.inverters.forEach(inverter => {
        totalStringsRow.push(String(inverter.totalStrings));
      });
    });
    totalStringsRow.push('', '', '', '');
    rows.push(totalStringsRow);

    const cyclesRow = ['', 'Cycles Completed'];
    getVisibleBlocks.forEach(block => {
      block.inverters.forEach(inverter => {
        cyclesRow.push((inverter.grassCuttingDone / inverter.totalStrings).toFixed(2));
      });
    });
    cyclesRow.push('', '', '', '');
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
        String(entry.plannedStrings),
        String(entry.dailyActual),
        String(entry.deviation),
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

  const renderEditableCell = (cellKey: string, value: any, className: string = "", isRemarks: boolean = false) => {
    const isEditing = editingCell === cellKey && globalEditMode;
    
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
        className={`w-full h-6 text-center text-xs ${globalEditMode ? 'cursor-pointer hover:bg-blue-50' : ''} flex items-center justify-center ${className} ${isRemarks ? 'whitespace-pre-wrap break-words' : ''}`}
        onClick={() => globalEditMode && handleCellClick(cellKey, value)}
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 hover:bg-gray-100"
                disabled={globalEditMode}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit Historic Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Enable Edit Mode</AlertDialogTitle>
                <AlertDialogDescription>
                  This will allow you to edit all historic data entries. Click on any cell to edit its value. 
                  Are you sure you want to proceed?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={enableGlobalEditMode}>
                  Enable Edit Mode
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {globalEditMode && (
            <Button
              onClick={disableGlobalEditMode}
              variant="outline"
              size="sm"
              className="bg-red-100 text-red-600 hover:bg-red-200"
            >
              Exit Edit Mode
            </Button>
          )}
          
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
      
      {globalEditMode && (
        <div className="bg-yellow-100 border-b px-3 py-2 text-sm text-yellow-800">
          <strong>Edit Mode Active:</strong> Click on any cell to edit its value. Changes are saved automatically when you click outside the cell or press Enter.
        </div>
      )}
      
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
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Actual</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Deviation</th>
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
            </tr>
          </thead>
          <tbody>
            {/* Total Strings */}
            <tr className="bg-blue-50">
              <td className="px-2 py-1 font-medium border border-gray-300">Total Strings</td>
              {getVisibleBlocks.map(block => (
                expandedBlocks[block.id] ? (
                  block.inverters.map(inverter => (
                    <td key={`total-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-blue-100">
                      {inverter.totalStrings}
                    </td>
                  ))
                ) : (
                  <td key={`total-${block.id}-collapsed`} className="px-2 py-1 text-center border border-gray-300 bg-blue-100">
                    {block.inverters.reduce((sum, inv) => sum + inv.totalStrings, 0)}
                  </td>
                )
              ))}
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
            </tr>

            {/* Total Strings Cleaned */}
            <tr className="bg-purple-50">
              <td className="px-2 py-1 font-medium border border-gray-300">Total Strings Cleaned</td>
              {getVisibleBlocks.map(block => (
                expandedBlocks[block.id] ? (
                  block.inverters.map(inverter => (
                    <td key={`cleaned-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-purple-100">
                      {inverter.grassCuttingDone}
                    </td>
                  ))
                ) : (
                  <td key={`cleaned-${block.id}-collapsed`} className="px-2 py-1 text-center border border-gray-300 bg-purple-100">
                    {block.inverters.reduce((sum, inv) => sum + inv.grassCuttingDone, 0)}
                  </td>
                )
              ))}
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
                      {(inverter.grassCuttingDone / inverter.totalStrings).toFixed(2)}
                    </td>
                  ))
                ) : (
                  <td key={`cycles-${block.id}-collapsed`} className="px-2 py-1 text-center border border-gray-300 bg-green-100">
                    {(block.inverters.reduce((sum, inv) => sum + inv.grassCuttingDone, 0) / 
                      block.inverters.reduce((sum, inv) => sum + inv.totalStrings, 0)).toFixed(2)}
                  </td>
                )
              ))}
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
            </tr>

            {/* Historic Entries */}
            {filteredEntries.map((entry, index) => (
              <tr key={entry.date} className={globalEditMode ? "bg-yellow-50" : "bg-gray-50"}>
                <td className="px-2 py-1 font-medium border border-gray-300">
                  <div className="flex items-center justify-between">
                    <div>
                      {globalEditMode && (
                        <span className="text-xs bg-orange-200 px-1 rounded mr-1">EDIT</span>
                      )}
                      {entry.date}
                    </div>
                  </div>
                </td>
                {getVisibleBlocks.map(block => (
                  expandedBlocks[block.id] ? (
                    block.inverters.map(inverter => {
                      const cellKey = `${entry.date}-${block.id}-${inverter.id}`;
                      const value = entry.inverterData[`${block.id}-${inverter.id}`] || 0;
                      return (
                        <td key={cellKey} className={`px-2 py-1 border border-gray-300 ${globalEditMode ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                          {renderEditableCell(cellKey, value)}
                        </td>
                      );
                    })
                  ) : (
                    <td key={`${entry.date}-${block.id}-collapsed`} className={`px-2 py-1 border border-gray-300 ${globalEditMode ? 'bg-yellow-100' : 'bg-gray-100'} text-center text-xs`}>
                      {block.inverters.reduce((sum, inv) => sum + (entry.inverterData[`${block.id}-${inv.id}`] || 0), 0)}
                    </td>
                  )
                ))}
                <td className={`px-2 py-1 border border-gray-300 ${globalEditMode ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {renderEditableCell(`${entry.date}-planned`, entry.plannedStrings)}
                </td>
                <td className={`px-2 py-1 border border-gray-300 ${globalEditMode ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {renderEditableCell(`${entry.date}-actual`, entry.dailyActual)}
                </td>
                <td className={`px-2 py-1 border border-gray-300 ${globalEditMode ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {renderEditableCell(`${entry.date}-deviation`, entry.deviation)}
                </td>
                <td className={`px-2 py-1 border border-gray-300 ${globalEditMode ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  {renderEditableCell(`${entry.date}-remarks`, entry.remarks, "", true)}
                </td>
              </tr>
            ))}
            
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={getVisibleBlocks.reduce((acc, block) => acc + (expandedBlocks[block.id] ? block.inverters.length : 1), 0) + 5} className="px-2 py-4 text-center text-gray-500">
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
