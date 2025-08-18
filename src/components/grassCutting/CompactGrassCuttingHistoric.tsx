
import React, { useState } from 'react';
import { GrassCuttingSiteData } from "@/types/grassCutting";

interface CompactGrassCuttingHistoricProps {
  data: GrassCuttingSiteData | null;
  onDataChange?: (data: GrassCuttingSiteData) => void;
}

export const CompactGrassCuttingHistoric: React.FC<CompactGrassCuttingHistoricProps> = ({ data }) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});

  if (!data) {
    return (
      <div className="bg-white rounded border p-4 text-center text-gray-500 text-sm">
        Select client and site to view historic data
      </div>
    );
  }

  const handleCellClick = (cellKey: string, currentValue: any) => {
    setEditingCell(cellKey);
    setEditValues(prev => ({ ...prev, [cellKey]: String(currentValue) }));
  };

  const handleCellBlur = (cellKey: string) => {
    setEditingCell(null);
    // Here you would typically save the value back to your data source
    console.log(`Saving ${cellKey}: ${editValues[cellKey]}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent, cellKey: string) => {
    if (e.key === 'Enter') {
      handleCellBlur(cellKey);
    }
  };

  const getColumnWidth = (values: any[], defaultWidth: string = "w-16") => {
    const maxLength = Math.max(...values.map(v => String(v).length), 0);
    if (maxLength > 8) return "w-24";
    if (maxLength > 4) return "w-20";
    return defaultWidth;
  };

  const renderEditableCell = (cellKey: string, value: any, className: string = "", isRemarks: boolean = false) => {
    const isEditing = editingCell === cellKey;
    
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
        className={`w-full h-6 text-center text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-center ${className} ${isRemarks ? 'whitespace-pre-wrap break-words' : ''}`}
        onClick={() => handleCellClick(cellKey, value)}
        style={isRemarks ? { minHeight: '24px', textAlign: 'left', padding: '2px' } : {}}
      >
        {value}
      </div>
    );
  };

  return (
    <div className="bg-white rounded border">
      <div className="bg-blue-600 px-3 py-2 text-white font-medium text-sm">
        Historic Grass Cutting Data
      </div>
      
      {/* Compact Legend */}
      <div className="px-3 py-2 bg-gray-50 border-b text-xs flex gap-4">
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
          Input
        </span>
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

            {/* Historic Entries - Now Editable */}
            {data.historicEntries.map((entry, index) => (
              <tr key={entry.date} className="bg-yellow-50">
                <td className="px-2 py-1 font-medium border border-gray-300">
                  <span className="text-xs bg-gray-200 px-1 rounded mr-1">EDIT</span>
                  {entry.date}
                </td>
                {data.blocks.map(block => (
                  block.inverters.map(inverter => {
                    const cellKey = `${entry.date}-${block.id}-${inverter.id}`;
                    const value = entry.inverterData[`${block.id}-${inverter.id}`] || 0;
                    return (
                      <td key={cellKey} className="px-2 py-1 border border-gray-300 bg-yellow-100">
                        {renderEditableCell(cellKey, value)}
                      </td>
                    );
                  })
                ))}
                <td className="px-2 py-1 border border-gray-300 bg-green-100">
                  {renderEditableCell(`${entry.date}-planned`, entry.plannedStrings)}
                </td>
                <td className="px-2 py-1 border border-gray-300 bg-green-100">
                  {renderEditableCell(`${entry.date}-actual`, entry.dailyActual)}
                </td>
                <td className="px-2 py-1 border border-gray-300 bg-green-100">
                  {renderEditableCell(`${entry.date}-deviation`, entry.deviation)}
                </td>
                <td className="px-2 py-1 border border-gray-300 bg-yellow-100">
                  {renderEditableCell(`${entry.date}-rainfall`, entry.rainfallMM)}
                </td>
                <td className="px-2 py-1 border border-gray-300 bg-yellow-100">
                  {renderEditableCell(`${entry.date}-remarks`, entry.remarks, "", true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
