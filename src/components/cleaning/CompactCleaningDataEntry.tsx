import React from 'react';
import { CleaningSiteData } from "@/types/cleaning";

interface CompactCleaningDataEntryProps {
  data: CleaningSiteData | null;
  onDataChange?: (data: CleaningSiteData) => void;
}

export const CompactCleaningDataEntry: React.FC<CompactCleaningDataEntryProps> = ({ data }) => {
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
    plannedModules: 0,
    totalCleaned: 0,
    totalUncleaned: 0,
    rainfallMM: "",
    remarks: ""
  };

  return (
    <div className="bg-white rounded border">
      <div className="bg-blue-600 px-3 py-2 text-white font-medium text-sm">
        Enter Cleaning Data
      </div>
      
      {/* Compact Legend */}
      <div className="px-3 py-2 bg-gray-50 border-b text-xs flex gap-4">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300"></div>
          Static
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
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Cleaned</th>
              <th className="px-2 py-1 text-center font-medium border border-gray-300 bg-green-600">Uncleaned</th>
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
            {/* Total Modules */}
            <tr className="bg-blue-50">
              <td className="px-2 py-1 font-medium border border-gray-300">Total Modules</td>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <td key={`total-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-blue-100">
                    {inverter.totalModules}
                  </td>
                ))
              ))}
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
              <td className="px-2 py-1 border border-gray-300"></td>
            </tr>

            {/* Modules Cleaned */}
            <tr className="bg-blue-50">
              <td className="px-2 py-1 font-medium border border-gray-300">Modules Cleaned</td>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <td key={`cleaned-${block.id}-${inverter.id}`} className="px-2 py-1 text-center border border-gray-300 bg-blue-100">
                    {inverter.modulesCleaned}
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
                {currentEntry.plannedModules}
              </td>
              <td className="px-2 py-1 text-center border border-gray-300 bg-green-100">
                {currentEntry.totalCleaned}
              </td>
              <td className="px-2 py-1 text-center border border-gray-300 bg-green-100">
                {currentEntry.totalUncleaned}
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