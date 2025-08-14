import React from 'react';
import { GrassCuttingSiteData } from "@/types/grassCutting";

interface CompactGrassCuttingDataEntryProps {
  data: GrassCuttingSiteData | null;
  onDataChange?: (data: GrassCuttingSiteData) => void;
}

export const CompactGrassCuttingDataEntry: React.FC<CompactGrassCuttingDataEntryProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded border p-4 text-center text-gray-500 text-sm">
        Select client and site to view data
      </div>
    );
  }

  const currentEntry = data.dailyEntries[0] || {
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
    inverterData: {},
    plannedStrings: 0,
    dailyActual: 0,
    deviation: 0,
    rainfallMM: "",
    remarks: ""
  };

  return (
    <div className="bg-white rounded border">
      <div className="bg-blue-600 px-3 py-2 text-white font-medium text-sm">
        Enter Grass Cutting Data
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

      <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
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
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-yellow-500">Remarks</th>
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

            {/* Grass Cutting Done */}
            <tr className="bg-blue-50">
              <td className="px-2 py-1 font-medium border border-gray-300">Grass Cutting Done</td>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <td key={`done-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-blue-100">
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

            {/* % Completed */}
            <tr className="bg-green-50">
              <td className="px-2 py-1 font-medium border border-gray-300">% Completed</td>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <td key={`percent-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-green-100">
                    {inverter.percentCompleted}%
                  </td>
                ))
              ))}
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
            </tr>

            {/* Daily Entry */}
            <tr className="bg-yellow-50">
              <td className="px-2 py-1 font-medium border border-gray-300">&lt;Input&gt; {currentEntry.date}</td>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <td key={`input-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-yellow-100">
                    <input 
                      type="number" 
                      className="w-full h-6 text-center text-xs border-0 bg-transparent focus:bg-white"
                      defaultValue={currentEntry.inverterData[`${block.id}-${inverter.id}`] || 0}
                    />
                  </td>
                ))
              ))}
              <td className="px-2 py-1 text-center border border-gray-300 bg-green-100">
                {currentEntry.plannedStrings}
              </td>
              <td className="px-2 py-1 text-center border border-gray-300 bg-green-100">
                {currentEntry.dailyActual}
              </td>
              <td className="px-2 py-1 text-center border border-gray-300 bg-green-100">
                {currentEntry.deviation}
              </td>
              <td className="px-2 py-1 text-center border border-gray-300 bg-yellow-100">
                <input 
                  className="w-full h-6 text-center text-xs border-0 bg-transparent focus:bg-white"
                  placeholder={currentEntry.rainfallMM}
                />
              </td>
              <td className="px-2 py-1 text-center border border-gray-300 bg-yellow-100">
                <input 
                  className="w-full h-6 text-center text-xs border-0 bg-transparent focus:bg-white"
                  placeholder={currentEntry.remarks}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};