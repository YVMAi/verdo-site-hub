
import React, { useState, useMemo } from 'react';
import { GrassCuttingSiteData } from "@/types/grassCutting";
import { Button } from "@/components/ui/button";
import { Upload, Save, RotateCcw } from "lucide-react";
import { CollapsibleBlockHeader } from './CollapsibleBlockHeader';

interface CompactGrassCuttingDataEntryProps {
  data: GrassCuttingSiteData | null;
  onDataChange?: (data: GrassCuttingSiteData) => void;
}

export const CompactGrassCuttingDataEntry: React.FC<CompactGrassCuttingDataEntryProps> = ({ data, onDataChange }) => {
  const [expandedBlocks, setExpandedBlocks] = useState<{[key: string]: boolean}>({
    '1': true,
    '2': true,
    '3': true,
    '4': true
  });

  // Function to determine which blocks should be visible
  const getVisibleBlocks = useMemo(() => {
    if (!data) return [];
    return data.blocks;
  }, [data?.blocks]);

  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-gray-500">
        <p className="text-sm">Select client and site to view data entry</p>
      </div>
    );
  }

  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 text-white font-medium text-sm flex justify-between items-center rounded-t-lg">
        <span>Enter Grass Cutting Data</span>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-50 h-7 text-xs px-3"
          >
            <Upload className="w-3 h-3 mr-1" />
            Bulk Upload
          </Button>
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white h-7 text-xs px-3"
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Date Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">Select Date</label>
          <input 
            type="date" 
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Data Entry Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="px-3 py-2 text-left font-medium border border-gray-300 w-32">Field</th>
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
                <th className="px-3 py-2 text-center font-medium border border-gray-300 bg-orange-600 w-32">Remarks</th>
              </tr>
              <tr className="bg-blue-800 text-white">
                <th className="px-3 py-2 text-left font-medium border border-gray-300">Inverter</th>
                {getVisibleBlocks.map(block => (
                  expandedBlocks[block.id] ? (
                    block.inverters.map(inverter => (
                      <th key={`${block.id}-${inverter.id}`} className="px-2 py-2 text-center font-medium border border-gray-300 w-16">
                        {inverter.id}
                      </th>
                    ))
                  ) : (
                    <th key={`${block.id}-collapsed`} className="px-2 py-2 text-center font-medium border border-gray-300 w-16">
                      {block.inverters.length} INVs
                    </th>
                  )
                ))}
                <th className="px-3 py-2 border border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {/* Total Strings */}
              <tr className="bg-gray-50">
                <td className="px-3 py-2 font-medium border border-gray-300">Total Strings</td>
                {getVisibleBlocks.map(block => (
                  expandedBlocks[block.id] ? (
                    block.inverters.map(inverter => (
                      <td key={`total-${block.id}-${inverter.id}`} className="px-2 py-2 text-center border border-gray-300 bg-gray-100">
                        {inverter.totalStrings}
                      </td>
                    ))
                  ) : (
                    <td key={`total-${block.id}-collapsed`} className="px-2 py-2 text-center border border-gray-300 bg-gray-100">
                      {block.inverters.reduce((sum, inv) => sum + inv.totalStrings, 0)}
                    </td>
                  )
                ))}
                <td className="px-3 py-2 border border-gray-300"></td>
              </tr>

              {/* % Completed */}
              <tr className="bg-green-50">
                <td className="px-3 py-2 font-medium border border-gray-300">% Completed</td>
                {getVisibleBlocks.map(block => (
                  expandedBlocks[block.id] ? (
                    block.inverters.map(inverter => (
                      <td key={`completed-${block.id}-${inverter.id}`} className="px-2 py-2 text-center border border-gray-300 bg-green-100">
                        {inverter.percentCompleted}%
                      </td>
                    ))
                  ) : (
                    <td key={`completed-${block.id}-collapsed`} className="px-2 py-2 text-center border border-gray-300 bg-green-100">
                      {Math.round(block.inverters.reduce((sum, inv) => sum + inv.percentCompleted, 0) / block.inverters.length)}%
                    </td>
                  )
                ))}
                <td className="px-3 py-2 border border-gray-300"></td>
              </tr>

              {/* Data Entry Row */}
              <tr className="bg-blue-50">
                <td className="px-3 py-2 font-medium border border-gray-300">
                  <input 
                    type="date" 
                    className="border rounded px-2 py-1 text-xs w-full"
                    defaultValue="2025-08-20"
                  />
                </td>
                {getVisibleBlocks.map(block => (
                  expandedBlocks[block.id] ? (
                    block.inverters.map(inverter => (
                      <td key={`input-${block.id}-${inverter.id}`} className="px-2 py-2 border border-gray-300 bg-blue-50">
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full h-6 text-center text-xs border border-blue-200 rounded focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                    ))
                  ) : (
                    <td key={`input-${block.id}-collapsed`} className="px-2 py-2 border border-gray-300 bg-blue-50">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full h-6 text-center text-xs border border-blue-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                  )
                ))}
                <td className="px-3 py-2 border border-gray-300 bg-orange-50">
                  <textarea
                    placeholder="Enter remarks..."
                    className="w-full h-6 text-xs border border-orange-200 rounded focus:border-orange-500 focus:outline-none resize-none"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
