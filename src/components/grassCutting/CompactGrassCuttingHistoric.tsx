import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, Save } from 'lucide-react';
import { GrassCuttingSiteData } from '@/types/grassCutting';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { ExportDialog } from '@/components/common/ExportDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';

interface CompactGrassCuttingHistoricProps {
  data: GrassCuttingSiteData | null;
}

export const CompactGrassCuttingHistoric: React.FC<CompactGrassCuttingHistoricProps> = ({ data }) => {
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterValue, setFilterValue] = useState('');
  const { toast } = useToast();
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const historicData = useMemo(() => {
    if (!data || !data.entries) return [];

    return data.entries
      .filter(item => {
        if (!filterValue) return true;
        return Object.values(item.values).some(val =>
          val?.toString().toLowerCase().includes(filterValue.toLowerCase())
        ) || item.date.includes(filterValue);
      })
      .sort((a, b) => {
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
  }, [data, filterValue, sortColumn, sortDirection]);

  if (!data) {
    return (
      <div className="bg-white border rounded">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  if (historicData.length === 0) {
    return (
      <div className="bg-white border rounded">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No historic data available</p>
        </div>
      </div>
    );
  }

  const allowedEditDays = 30; // Define how many days back editing is allowed

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

  const handleExportWithDateRange = (startDate: Date, endDate: Date) => {
    console.log(`Exporting grass cutting data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    toast({
      title: "Export Started",
      description: "Downloading grass cutting data for selected date range as CSV",
    });
  };

  const handleSaveClick = () => {
    setShowSaveConfirmation(true);
  };

  const handleConfirmSave = () => {
    console.log('Saving changes:', editedData);
    toast({
      title: "Changes Saved",
      description: "Historic grass cutting data has been updated successfully.",
    });
    setEditedData({});
    setIsEditMode(false);
    setShowSaveConfirmation(false);
  };

  const handleCancelSave = () => {
    setShowSaveConfirmation(false);
  };

  const hasUnsavedChanges = Object.keys(editedData).length > 0;

  return (
    <>
      <div className="bg-white rounded border">
        <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
          <span>Historic Grass Cutting Data</span>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <Button 
                onClick={isEditMode ? handleSaveClick : () => setIsEditMode(true)} 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
              >
                {isEditMode ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
              <span className="text-xs mt-1">{isEditMode ? 'Save' : 'Edit'}</span>
            </div>
            <div className="flex flex-col items-center">
              <ExportDialog
                title="Export Historic Grass Cutting Data"
                description="Select the date range for which you want to export historic grass cutting data:"
                onExport={handleExportWithDateRange}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </ExportDialog>
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
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center justify-between">
                    Date
                    {sortColumn === 'date' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('cut')}
                >
                  <div className="flex items-center justify-between">
                    Cut
                    {sortColumn === 'cut' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('fertilized')}
                >
                  <div className="flex items-center justify-between">
                    Fertilized
                    {sortColumn === 'fertilized' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('comments')}
                >
                  <div className="flex items-center justify-between">
                    Comments
                    {sortColumn === 'comments' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody>
              {historicData.map((row, index) => {
                const isLocked = !isEditable(row.date);

                return (
                  <tr key={index} className={cn(
                    "hover:bg-muted/20",
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  )}>
                    <td className="px-2 py-1 border border-gray-300">
                      <div className="text-xs py-1 px-2 bg-muted/50 rounded">
                        {format(new Date(row.date), 'yyyy-MM-dd')}
                      </div>
                    </td>
                    <td className="px-2 py-1 border border-gray-300">
                      <Input
                        type="number"
                        value={editedData[`${row.date}-cut`] !== undefined ? editedData[`${row.date}-cut`] : row.values.cut || ''}
                        onChange={(e) => handleCellEdit(row.date, 'cut', e.target.value)}
                        className={cn(
                          "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                          isEditMode && "bg-blue-100",
                          editedData[`${row.date}-cut`] !== undefined && "bg-yellow-50 border border-yellow-300"
                        )}
                        readOnly={!isEditMode}
                        step="0.01"
                      />
                    </td>
                    <td className="px-2 py-1 border border-gray-300">
                      <Input
                        type="text"
                        value={editedData[`${row.date}-fertilized`] !== undefined ? editedData[`${row.date}-fertilized`] : row.values.fertilized || ''}
                        onChange={(e) => handleCellEdit(row.date, 'fertilized', e.target.value)}
                        className={cn(
                          "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                          isEditMode && "bg-blue-100",
                          editedData[`${row.date}-fertilized`] !== undefined && "bg-yellow-50 border border-yellow-300"
                        )}
                        readOnly={!isEditMode}
                      />
                    </td>
                    <td className="px-2 py-1 border border-gray-300">
                      <Input
                        type="text"
                        value={editedData[`${row.date}-comments`] !== undefined ? editedData[`${row.date}-comments`] : row.values.comments || ''}
                        onChange={(e) => handleCellEdit(row.date, 'comments', e.target.value)}
                        className={cn(
                          "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                          isEditMode && "bg-blue-100",
                          editedData[`${row.date}-comments`] !== undefined && "bg-yellow-50 border border-yellow-300"
                        )}
                        readOnly={!isEditMode}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirmation}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        title="Save Changes"
        description={`Are you sure you want to save ${Object.keys(editedData).length} change(s) to the historic grass cutting data?`}
        confirmText="Save Changes"
        cancelText="Cancel"
      />
    </>
  );
};
