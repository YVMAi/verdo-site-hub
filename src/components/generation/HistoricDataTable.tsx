
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, Save } from 'lucide-react';
import { Site, TabType, GenerationData } from '@/types/generation';
import { mockHistoricData } from '@/data/mockGenerationData';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { MeterHistoricDataTable } from './MeterHistoricDataTable';

interface HistoricDataTableProps {
  site: Site | null;
  activeTab: TabType;
  allowedEditDays: number;
}

export const HistoricDataTable: React.FC<HistoricDataTableProps> = ({ 
  site, 
  activeTab, 
  allowedEditDays 
}) => {
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterValue, setFilterValue] = useState('');
  const { toast } = useToast();

  const historicData = useMemo(() => {
    if (!site) return [];
    
    return mockHistoricData.filter(
      item => item.siteId === site.id && item.tabType === activeTab
    ).filter(item => {
      if (!filterValue) return true;
      return Object.values(item.values).some(val =>
        val?.toString().toLowerCase().includes(filterValue.toLowerCase())
      ) || item.date.includes(filterValue);
    }).sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortColumn === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else {
        aValue = a.values[sortColumn] || '';
        bValue = b.values[sortColumn] || '';
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });
  }, [site, activeTab, filterValue, sortColumn, sortDirection]);

  // Use specialized meter historic table for meter-data tab
  if (activeTab === 'meter-data') {
    return <MeterHistoricDataTable site={site} allowedEditDays={allowedEditDays} />;
  }

  if (!site) {
    return (
      <div className="bg-white border rounded">
        <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm">
          <span>Historic Data - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Select a site to view historic data</p>
        </div>
      </div>
    );
  }

  if (historicData.length === 0) {
    return (
      <div className="bg-white border rounded">
        <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm">
          <span>Historic Data - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No historic data available for this site</p>
        </div>
      </div>
    );
  }

  const isEditable = (date: string) => {
    const daysDiff = differenceInDays(new Date(), new Date(date));
    return daysDiff <= allowedEditDays;
  };

  const handleCellEdit = (date: string, columnId: string, value: any) => {
    const key = `${date}-${columnId}`;
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleSaveChanges = () => {
    console.log('Saving changes:', editedData);
    toast({
      title: "Changes Saved",
      description: "Historic data has been updated successfully.",
    });
    setEditedData({});
    setIsEditMode(false);
  };

  const handleExport = () => {
    console.log(`Exporting ${historicData.length} records for ${activeTab}`);
    toast({
      title: "Export Started",
      description: `Downloading ${historicData.length} records as CSV`,
    });
  };

  const hasUnsavedChanges = Object.keys(editedData).length > 0;

  return (
    <div className="bg-white rounded border">
      <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <span>Historic Data - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <div className="flex flex-col items-center">
              <Button 
                onClick={handleSaveChanges} 
                variant="outline"
                size="sm" 
                className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
              <span className="text-xs mt-1">Save</span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <Button 
              onClick={() => setIsEditMode(!isEditMode)} 
              variant="outline" 
              size="sm" 
              className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <span className="text-xs mt-1">{isEditMode ? 'View' : 'Edit'}</span>
          </div>
          <div className="flex flex-col items-center">
            <Button 
              onClick={handleExport}
              variant="outline" 
              size="sm" 
              className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            <span className="text-xs mt-1">Export</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="px-3 py-2 bg-gray-50 border-b flex flex-wrap gap-2 items-center text-xs">
        <Input
          type="search"
          placeholder="Search historic data..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="h-7 text-xs flex-1 min-w-[120px]"
        />
        <Badge variant="secondary">
          {historicData.length} Records
        </Badge>
        {isEditMode && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Edit Mode
          </Badge>
        )}
        {hasUnsavedChanges && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
            {Object.keys(editedData).length} Unsaved Changes
          </Badge>
        )}
      </div>
      
      <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0">
            <tr className="bg-verdo-navy text-white">
              {site.columns.map((column) => (
                <th 
                  key={column.id}
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort(column.id)}
                >
                  <div className="flex items-center justify-between">
                    {column.name}
                    {sortColumn === column.id && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {historicData.map((row, index) => {
              const isLocked = !isEditable(row.date);

              return (
                <tr key={row.id} className={cn(
                  "hover:bg-muted/20",
                  index % 2 === 0 ? "bg-background" : "bg-muted/10"
                )}>
                  {site.columns.map((column) => {
                    const cellKey = `${row.date}-${column.id}`;
                    const currentValue = editedData[cellKey] !== undefined 
                      ? editedData[cellKey] 
                      : row.values[column.id];
                    const hasChanges = editedData[cellKey] !== undefined;

                    return (
                      <td key={column.id} className="px-2 py-1 border border-gray-300">
                        {column.id === 'date' ? (
                          <div className="text-xs py-1 px-2 bg-muted/50 rounded">
                            {format(new Date(row.date), 'yyyy-MM-dd')}
                          </div>
                        ) : isLocked ? (
                          <div className="text-xs py-1 px-2 bg-muted/50 text-muted-foreground rounded">
                            {currentValue || '-'}
                            <span className="ml-1 text-xs">🔒</span>
                          </div>
                        ) : (
                          <Input
                            type={column.type === 'number' ? 'number' : 'text'}
                            value={currentValue || ''}
                            onChange={(e) => handleCellEdit(row.date, column.id, e.target.value)}
                            className={cn(
                              "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                              isEditMode && "bg-blue-100",
                              hasChanges && "bg-yellow-50 border border-yellow-300"
                            )}
                            readOnly={!isEditMode}
                            step={column.type === 'number' ? '0.01' : undefined}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 bg-muted/20 text-xs text-muted-foreground border-t flex justify-between">
        <span>
          Showing {historicData.length} records • 
          Editable within {allowedEditDays} days • 
          🔒 = Locked (older than {allowedEditDays} days)
        </span>
        {hasUnsavedChanges && (
          <span className="text-yellow-600 font-medium">
            {Object.keys(editedData).length} unsaved change(s)
          </span>
        )}
      </div>
    </div>
  );
};
