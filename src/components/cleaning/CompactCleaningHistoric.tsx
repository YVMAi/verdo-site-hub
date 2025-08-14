import React, { useMemo } from 'react';
import { DataGrid, Column } from 'react-data-grid';
import { CleaningSiteData } from "@/types/cleaning";
import 'react-data-grid/lib/styles.css';

interface CompactCleaningHistoricProps {
  data: CleaningSiteData | null;
  onDataChange?: (data: CleaningSiteData) => void;
}

export const CompactCleaningHistoric: React.FC<CompactCleaningHistoricProps> = ({ data }) => {
  const { columns, rows } = useMemo(() => {
    if (!data) {
      return { columns: [], rows: [] };
    }

    // Create columns dynamically
    const cols: Column<any>[] = [
      { key: 'field', name: 'Field', width: 180, frozen: true }
    ];

    // Add inverter columns
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
      { key: 'cleaned', name: 'Cleaned', width: 80, headerCellClass: 'bg-green-600 text-white text-xs' },
      { key: 'uncleaned', name: 'Uncleaned', width: 80, headerCellClass: 'bg-green-600 text-white text-xs' },
      { key: 'rainfall', name: 'Rainfall', width: 80, headerCellClass: 'bg-yellow-500 text-white text-xs' },
      { key: 'remarks', name: 'Remarks', width: 120, headerCellClass: 'bg-yellow-500 text-white text-xs' }
    );

    // Create rows
    const rowData: any[] = [];

    // Total Modules row
    const totalModulesRow: any = { field: 'Total Modules' };
    data.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        totalModulesRow[`${block.id}-${inverter.id}`] = inverter.totalModules;
      });
    });
    rowData.push(totalModulesRow);

    // Modules Cleaned row
    const modulesCleanedRow: any = { field: 'Modules Cleaned' };
    data.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        modulesCleanedRow[`${block.id}-${inverter.id}`] = inverter.modulesCleaned;
      });
    });
    rowData.push(modulesCleanedRow);

    // Cycles Completed row
    const cyclesCompletedRow: any = { field: 'Cycles Completed' };
    data.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        cyclesCompletedRow[`${block.id}-${inverter.id}`] = (inverter.modulesCleaned / inverter.totalModules).toFixed(2);
      });
    });
    rowData.push(cyclesCompletedRow);

    // Historic entries
    data.historicEntries.forEach(entry => {
      const historicRow: any = {
        field: `${entry.date}`,
        planned: entry.plannedModules,
        cleaned: entry.totalCleaned,
        uncleaned: entry.totalUncleaned,
        rainfall: entry.rainfallMM,
        remarks: entry.remarks
      };
      
      data.blocks.forEach(block => {
        block.inverters.forEach(inverter => {
          historicRow[`${block.id}-${inverter.id}`] = entry.inverterData[`${block.id}-${inverter.id}`] || 0;
        });
      });
      
      rowData.push(historicRow);
    });

    return { columns: cols, rows: rowData };
  }, [data]);

  if (!data) {
    return (
      <div className="bg-white rounded border p-4 text-center text-gray-500 text-sm">
        Select client and site to view historic data
      </div>
    );
  }

  return (
    <div className="bg-white rounded border">
      <div className="bg-blue-600 px-3 py-2 text-white font-medium text-sm">
        Historic Cleaning Data
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

      <div style={{ height: '400px' }}>
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