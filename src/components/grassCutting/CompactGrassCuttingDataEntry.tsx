import React, { useMemo } from 'react';
import { DataGrid, Column } from 'react-data-grid';
import { GrassCuttingSiteData } from "@/types/grassCutting";
import 'react-data-grid/lib/styles.css';

interface CompactGrassCuttingDataEntryProps {
  data: GrassCuttingSiteData | null;
  onDataChange?: (data: GrassCuttingSiteData) => void;
}

export const CompactGrassCuttingDataEntry: React.FC<CompactGrassCuttingDataEntryProps> = ({ data }) => {
  const { columns, rows } = useMemo(() => {
    if (!data) {
      return { columns: [], rows: [] };
    }

    // Create columns dynamically based on blocks and inverters
    const cols: Column<any>[] = [
      { key: 'field', name: 'Field', width: 180, frozen: true }
    ];

    // Add inverter columns for each block
    data.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        cols.push({
          key: `${block.id}-${inverter.id}`,
          name: `${block.name} ${inverter.id}`,
          width: 80,
          headerCellClass: 'bg-blue-600 text-white text-xs'
        });
      });
    });

    // Add summary columns
    cols.push(
      { key: 'planned', name: 'Planned', width: 80, headerCellClass: 'bg-green-600 text-white text-xs' },
      { key: 'actual', name: 'Actual', width: 80, headerCellClass: 'bg-green-600 text-white text-xs' },
      { key: 'deviation', name: 'Deviation', width: 80, headerCellClass: 'bg-green-600 text-white text-xs' },
      { key: 'rainfall', name: 'Rainfall', width: 80, headerCellClass: 'bg-yellow-500 text-white text-xs' },
      { key: 'remarks', name: 'Remarks', width: 120, headerCellClass: 'bg-yellow-500 text-white text-xs' }
    );

    // Create rows
    const rowData: any[] = [];

    // Total Strings row
    const totalStringsRow: any = { field: 'Total Strings' };
    data.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        totalStringsRow[`${block.id}-${inverter.id}`] = inverter.totalStrings;
      });
    });
    rowData.push(totalStringsRow);

    // Grass Cutting Done row
    const grassCuttingDoneRow: any = { field: 'Grass Cutting Done' };
    data.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        grassCuttingDoneRow[`${block.id}-${inverter.id}`] = inverter.grassCuttingDone;
      });
    });
    rowData.push(grassCuttingDoneRow);

    // % Completed row
    const percentCompletedRow: any = { field: '% Completed' };
    data.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        percentCompletedRow[`${block.id}-${inverter.id}`] = `${inverter.percentCompleted}%`;
      });
    });
    rowData.push(percentCompletedRow);

    // Daily entries
    data.dailyEntries.forEach(entry => {
      const dailyRow: any = {
        field: `Input ${entry.date}`,
        planned: entry.plannedStrings,
        actual: entry.dailyActual,
        deviation: entry.deviation,
        rainfall: entry.rainfallMM,
        remarks: entry.remarks
      };
      
      data.blocks.forEach(block => {
        block.inverters.forEach(inverter => {
          dailyRow[`${block.id}-${inverter.id}`] = entry.inverterData[`${block.id}-${inverter.id}`] || 0;
        });
      });
      
      rowData.push(dailyRow);
    });

    return { columns: cols, rows: rowData };
  }, [data]);

  if (!data) {
    return (
      <div className="bg-white rounded border p-4 text-center text-gray-500 text-sm">
        Select client and site to view data
      </div>
    );
  }

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

      <div style={{ height: '300px' }}>
        <DataGrid
          columns={columns}
          rows={rows}
          className="rdg-light"
          style={{ fontSize: '12px' }}
          headerRowHeight={30}
          rowHeight={28}
        />
      </div>
    </div>
  );
};