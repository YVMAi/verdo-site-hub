
import React, { useState, useMemo } from 'react';
import { GrassCuttingSiteData } from "@/types/grassCutting";
import { Button } from "@/components/ui/button";
import { Download, Edit2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompactGrassCuttingHistoricProps {
  data: GrassCuttingSiteData | null;
  onDataChange?: (data: GrassCuttingSiteData) => void;
}

export const CompactGrassCuttingHistoric: React.FC<CompactGrassCuttingHistoricProps> = ({ data, onDataChange }) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  const [globalEditMode, setGlobalEditMode] = useState<boolean>(false);
  const [expandedBlocks, setExpandedBlocks] = useState<{[key: string]: boolean}>({
    '1': true,
    '2': true,
    '3': true,
    '4': true
  });

  // Generate month options
  const monthOptions = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const value = i === 0 ? 'current' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({ label: monthYear, value });
    }
    
    return months;
  }, []);

  // Function to determine which blocks should be visible
  const getVisibleBlocks = useMemo(() => {
    if (!data) return [];
    return data.blocks;
  }, [data?.blocks]);

  // Simplified filtering - only by month
  const filteredEntries = useMemo(() => {
    if (!data || !data.historicEntries) return [];
    
    let entries = data.historicEntries;

    // Month filtering
    if (selectedMonth !== 'current') {
      const [year, month] = selectedMonth.split('-');
      entries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === parseInt(year) && 
               entryDate.getMonth() === parseInt(month) - 1;
      });
    } else {
      // Show current month
      const currentDate = new Date();
      entries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === currentDate.getFullYear() && 
               entryDate.getMonth() === currentDate.getMonth();
      });
    }

    return entries;
  }, [data?.historicEntries, selectedMonth]);

  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-gray-500">
        <p className="text-sm">Select client and site to view historic data</p>
      </div>
    );
  }

  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
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
        
        if (field === 'remarks') {
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
      e.preventDefault();
      e.stopPropagation();
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
    headers.push('Remarks');

    const rows: string[][] = [];
    
    const totalStringsRow = ['', 'Total Strings'];
    getVisibleBlocks.forEach(block => {
      block.inverters.forEach(inverter => {
        totalStringsRow.push(String(inverter.totalStrings));
      });
    });
    totalStringsRow.push('');
    rows.push(totalStringsRow);

    const cyclesRow = ['', 'Cycles Completed'];
    getVisibleBlocks.forEach(block => {
      block.inverters.forEach(inverter => {
        cyclesRow.push((inverter.grassCuttingDone / inverter.totalStrings).toFixed(2));
      });
    });
    cyclesRow.push('');
    rows.push(cyclesRow);

    filteredEntries.forEach(entry => {
      const row = [entry.date, 'Historic Data'];
      getVisibleBlocks.forEach(block => {
        block.inverters.forEach(inverter => {
          const value = entry.inverterData[`${block.id}-${inverter.id}`] || 0;
          row.push(String(value));
        });
      });
      row.push(entry.remarks);
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
            className={`w-full h-auto min-h-6 text-xs border-2 border-blue-500 bg-white p-1 resize-none rounded ${className}`}
            style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            value={editValues[cellKey] || String(value)}
            onChange={(e) => setEditValues(prev => ({ ...prev, [cellKey]: e.target.value }))}
            onBlur={() => handleCellBlur(cellKey)}
            onKeyDown={(e) => handleKeyPress(e, cellKey)}
            autoFocus
          />
        );
      }
      
      return (
        <input
          type="text"
          className={`w-full h-6 text-center text-xs border-2 border-blue-500 bg-white rounded ${className}`}
          value={editValues[cellKey] || String(value)}
          onChange={(e) => setEditValues(prev => ({ ...prev, [cellKey]: e.target.value }))}
          onBlur={() => handleCellBlur(cellKey)}
          onKeyDown={(e) => handleKeyPress(e, cellKey)}
          autoFocus
        />
      );
    }

    return (
      <div
        className={`w-full h-6 text-center text-xs ${globalEditMode ? 'cursor-pointer hover:bg-blue-50 rounded' : ''} flex items-center justify-center ${className} ${isRemarks ? 'whitespace-pre-wrap break-words' : ''}`}
        onClick={() => globalEditMode && handleCellClick(cellKey, value)}
        style={isRemarks ? { minHeight: '24px', textAlign: 'left', padding: '2px' } : {}}
      >
        {value}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Redesigned Header */}
      <div className="bg-gray-900 px-4 py-3 text-white font-medium text-sm flex justify-between items-center rounded-t-lg">
        <span>Historic Grass Cutting Data</span>
        <div className="flex gap-3 items-center">
          {/* Simplified Month Filter */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48 h-8 bg-white text-gray-900 text-xs">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 hover:bg-gray-50 h-8 text-xs"
                disabled={globalEditMode}
              >
                <Edit2 className="w-3 h-3 mr-1" />
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
              className="bg-red-50 text-red-600 hover:bg-red-100 h-8 text-xs"
            >
              Exit Edit Mode
            </Button>
          )}
          
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-50 h-8 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {globalEditMode && (
        <div className="bg-blue-50 border-b px-4 py-2 text-sm text-blue-800">
          <strong>Edit Mode Active:</strong> Click on any cell to edit its value. Changes are saved automatically when you click outside the cell or press Enter.
        </div>
      )}

      <div className="overflow-x-auto" style={{ maxHeight: '500px' }}>
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0">
            <tr className="bg-gray-800 text-white">
              <th className="px-3 py-2 text-left font-medium border border-gray-600 w-32">Field</th>
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
              <th className="px-3 py-2 text-center font-medium border border-gray-600 bg-orange-600 w-32">Remarks</th>
            </tr>
            <tr className="bg-gray-700 text-white">
              <th className="px-3 py-2 text-left font-medium border border-gray-600">Inverter</th>
              {getVisibleBlocks.map(block => (
                expandedBlocks[block.id] ? (
                  block.inverters.map(inverter => (
                    <th key={`${block.id}-${inverter.id}`} className="px-2 py-2 text-center font-medium border border-gray-600 w-16">
                      {inverter.id}
                    </th>
                  ))
                ) : (
                  <th key={`${block.id}-collapsed`} className="px-2 py-2 text-center font-medium border border-gray-600 w-16">
                    {block.inverters.length} INVs
                  </th>
                )
              ))}
              <th className="px-3 py-2 border border-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {/* Total Strings */}
            <tr className="bg-gray-50">
              <td className="px-3 py-2 font-medium border border-gray-200">Total Strings</td>
              {getVisibleBlocks.map(block => (
                expandedBlocks[block.id] ? (
                  block.inverters.map(inverter => (
                    <td key={`total-${block.id}-${inverter.id}`} className="px-2 py-2 text-center border border-gray-200 bg-gray-100">
                      {inverter.totalStrings}
                    </td>
                  ))
                ) : (
                  <td key={`total-${block.id}-collapsed`} className="px-2 py-2 text-center border border-gray-200 bg-gray-100">
                    {block.inverters.reduce((sum, inv) => sum + inv.totalStrings, 0)}
                  </td>
                )
              ))}
              <td className="px-3 py-2 border border-gray-200"></td>
            </tr>

            {/* Total Strings Cleaned */}
            <tr className="bg-purple-50">
              <td className="px-3 py-2 font-medium border border-gray-200">Total Strings Cleaned</td>
              {getVisibleBlocks.map(block => (
                expandedBlocks[block.id] ? (
                  block.inverters.map(inverter => (
                    <td key={`cleaned-${block.id}-${inverter.id}`} className="px-2 py-2 text-center border border-gray-200 bg-purple-100">
                      {inverter.grassCuttingDone}
                    </td>
                  ))
                ) : (
                  <td key={`cleaned-${block.id}-collapsed`} className="px-2 py-2 text-center border border-gray-200 bg-purple-100">
                    {block.inverters.reduce((sum, inv) => sum + inv.grassCuttingDone, 0)}
                  </td>
                )
              ))}
              <td className="px-3 py-2 border border-gray-200"></td>
            </tr>

            {/* Cycles Completed */}
            <tr className="bg-green-50">
              <td className="px-3 py-2 font-medium border border-gray-200">Cycles Completed</td>
              {getVisibleBlocks.map(block => (
                expandedBlocks[block.id] ? (
                  block.inverters.map(inverter => (
                    <td key={`cycles-${block.id}-${inverter.id}`} className="px-2 py-2 text-center border border-gray-200 bg-green-100">
                      {(inverter.grassCuttingDone / inverter.totalStrings).toFixed(2)}
                    </td>
                  ))
                ) : (
                  <td key={`cycles-${block.id}-collapsed`} className="px-2 py-2 text-center border border-gray-200 bg-green-100">
                    {(block.inverters.reduce((sum, inv) => sum + inv.grassCuttingDone, 0) / 
                      block.inverters.reduce((sum, inv) => sum + inv.totalStrings, 0)).toFixed(2)}
                  </td>
                )
              ))}
              <td className="px-3 py-2 border border-gray-200"></td>
            </tr>

            {/* Historic Entries */}
            {filteredEntries.map((entry, index) => (
              <tr key={entry.date} className={globalEditMode ? "bg-blue-50" : "bg-white hover:bg-gray-50"}>
                <td className="px-3 py-2 font-medium border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      {globalEditMode && (
                        <span className="text-xs bg-blue-200 text-blue-800 px-1 rounded mr-1 font-medium">EDIT</span>
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
                        <td key={cellKey} className={`px-2 py-2 border border-gray-200 ${globalEditMode ? 'bg-blue-50' : 'bg-white'}`}>
                          {renderEditableCell(cellKey, value)}
                        </td>
                      );
                    })
                  ) : (
                    <td key={`${entry.date}-${block.id}-collapsed`} className={`px-2 py-2 border border-gray-200 ${globalEditMode ? 'bg-blue-50' : 'bg-white'} text-center text-xs`}>
                      {block.inverters.reduce((sum, inv) => sum + (entry.inverterData[`${block.id}-${inv.id}`] || 0), 0)}
                    </td>
                  )
                ))}
                <td className={`px-3 py-2 border border-gray-200 ${globalEditMode ? 'bg-orange-50' : 'bg-white'}`}>
                  {renderEditableCell(`${entry.date}-remarks`, entry.remarks, "", true)}
                </td>
              </tr>
            ))}
            
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={getVisibleBlocks.reduce((acc, block) => acc + (expandedBlocks[block.id] ? block.inverters.length : 1), 0) + 2} className="px-3 py-8 text-center text-gray-500">
                  No records found for the selected month
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
