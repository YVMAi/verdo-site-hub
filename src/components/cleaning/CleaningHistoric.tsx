import React from 'react';
import { Button } from "@/components/ui/button";
import { CleaningSiteData } from "@/types/cleaning";

interface CleaningHistoricProps {
  data: CleaningSiteData | null;
  onDataChange?: (data: CleaningSiteData) => void;
}

export const CleaningHistoric: React.FC<CleaningHistoricProps> = ({ data, onDataChange }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-500 text-center">Please select a client and site to view historic cleaning data.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">Historic Cleaning Data</h2>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-gray-50 border-b">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300"></div>
            <span>Status Fields</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300"></div>
            <span>Calculated Fields</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300"></div>
            <span>Input Fields</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="px-4 py-3 text-left font-medium">Block</th>
              {data.blocks.map(block => (
                <th key={block.id} className="px-4 py-3 text-center font-medium" colSpan={block.inverters.length}>
                  {block.name}
                </th>
              ))}
              <th className="px-4 py-3 text-center font-medium bg-green-100 text-gray-900">Planned Modules</th>
              <th className="px-4 py-3 text-center font-medium bg-green-100 text-gray-900">Total Modules Cleaned</th>
              <th className="px-4 py-3 text-center font-medium bg-green-100 text-gray-900">Total Modules Uncleaned</th>
              <th className="px-4 py-3 text-center font-medium bg-yellow-100 text-gray-900">Rainfall MM</th>
              <th className="px-4 py-3 text-center font-medium bg-yellow-100 text-gray-900">Remarks</th>
            </tr>
            <tr className="bg-blue-800 text-white">
              <th className="px-4 py-2 text-left font-medium">Inverter</th>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <th key={`${block.id}-${inverter.id}`} className="px-4 py-2 text-center font-medium text-sm">
                    {inverter.id}
                  </th>
                ))
              ))}
              <th className="px-4 py-2 text-center font-medium bg-green-100 text-gray-900"></th>
              <th className="px-4 py-2 text-center font-medium bg-green-100 text-gray-900"></th>
              <th className="px-4 py-2 text-center font-medium bg-green-100 text-gray-900"></th>
              <th className="px-4 py-2 text-center font-medium bg-yellow-100 text-gray-900"></th>
              <th className="px-4 py-2 text-center font-medium bg-yellow-100 text-gray-900"></th>
            </tr>
          </thead>
          <tbody>
            {/* Total Number of Modules */}
            <tr className="border-b bg-blue-50">
              <td className="px-4 py-3 font-medium text-gray-900">Total Number of Modules</td>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <td key={`total-${block.id}-${inverter.id}`} className="px-4 py-3 text-center bg-blue-100 border border-blue-300">
                    {inverter.totalModules}
                  </td>
                ))
              ))}
              <td className="px-4 py-3 text-center bg-green-100 border border-green-300"></td>
              <td className="px-4 py-3 text-center bg-green-100 border border-green-300"></td>
              <td className="px-4 py-3 text-center bg-green-100 border border-green-300"></td>
              <td className="px-4 py-3 text-center bg-yellow-100 border border-yellow-300"></td>
              <td className="px-4 py-3 text-center bg-yellow-100 border border-yellow-300"></td>
            </tr>

            {/* Total Number of Modules Cleaned */}
            <tr className="border-b bg-blue-50">
              <td className="px-4 py-3 font-medium text-gray-900">Total Number of Modules Cleaned</td>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <td key={`cleaned-${block.id}-${inverter.id}`} className="px-4 py-3 text-center bg-blue-100 border border-blue-300">
                    {inverter.modulesCleaned}
                  </td>
                ))
              ))}
              <td className="px-4 py-3 text-center bg-green-100 border border-green-300"></td>
              <td className="px-4 py-3 text-center bg-green-100 border border-green-300"></td>
              <td className="px-4 py-3 text-center bg-green-100 border border-green-300"></td>
              <td className="px-4 py-3 text-center bg-yellow-100 border border-yellow-300"></td>
              <td className="px-4 py-3 text-center bg-yellow-100 border border-yellow-300"></td>
            </tr>

            {/* Cycles Completed */}
            <tr className="border-b bg-green-50">
              <td className="px-4 py-3 font-medium text-gray-900">Cycles Completed</td>
              {data.blocks.map(block => (
                block.inverters.map(inverter => (
                  <td key={`cycles-${block.id}-${inverter.id}`} className="px-4 py-3 text-center bg-green-100 border border-green-300">
                    {(inverter.modulesCleaned / inverter.totalModules).toFixed(2)}
                  </td>
                ))
              ))}
              <td className="px-4 py-3 text-center bg-green-100 border border-green-300"></td>
              <td className="px-4 py-3 text-center bg-green-100 border border-green-300"></td>
              <td className="px-4 py-3 text-center bg-green-100 border border-green-300"></td>
              <td className="px-4 py-3 text-center bg-yellow-100 border border-yellow-300"></td>
              <td className="px-4 py-3 text-center bg-yellow-100 border border-yellow-300"></td>
            </tr>

            {/* Historic Entry Rows */}
            {data.historicEntries.map((entry, index) => (
              <tr key={entry.date} className="border-b bg-yellow-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                      &lt;EDIT&gt;
                    </Button>
                    {entry.date}
                  </div>
                </td>
                {data.blocks.map(block => (
                  block.inverters.map(inverter => (
                    <td key={`entry-${entry.date}-${block.id}-${inverter.id}`} className="px-4 py-3 text-center bg-yellow-100 border border-yellow-300">
                      {entry.inverterData[`${block.id}-${inverter.id}`] || 0}
                    </td>
                  ))
                ))}
                <td className="px-4 py-3 text-center bg-green-100 border border-green-300">
                  {entry.plannedModules}
                </td>
                <td className="px-4 py-3 text-center bg-green-100 border border-green-300">
                  {entry.totalCleaned}
                </td>
                <td className="px-4 py-3 text-center bg-green-100 border border-green-300">
                  {entry.totalUncleaned}
                </td>
                <td className="px-4 py-3 text-center bg-yellow-100 border border-yellow-300">
                  {entry.rainfallMM}
                </td>
                <td className="px-4 py-3 text-center bg-yellow-100 border border-yellow-300">
                  {entry.remarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};