import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Edit, Upload } from 'lucide-react';
import { GrassCuttingSiteData, GrassCuttingEntry } from '@/types/grassCutting';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BulkUploadModal } from './BulkUploadModal';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';

interface CompactGrassCuttingDataEntryProps {
  data: GrassCuttingSiteData | null;
}

export const CompactGrassCuttingDataEntry: React.FC<CompactGrassCuttingDataEntryProps> = ({ data }) => {
  const [entries, setEntries] = useState<GrassCuttingEntry[]>([]);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterValue, setFilterValue] = useState('');
  const { toast } = useToast();
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  useEffect(() => {
    if (data && data.entries) {
      setEntries([...data.entries]);
    } else {
      setEntries([]);
    }
  }, [data]);

  const handleCellEdit = (id: string, columnId: string, value: any) => {
    const key = `${id}-${columnId}`;
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (!filterValue) return true;
      const values = Object.values(entry).join(' ').toLowerCase();
      return values.includes(filterValue.toLowerCase());
    }).sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortDirection === 'asc') {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      } else {
        if (aValue > bValue) return -1;
        if (aValue < bValue) return 1;
        return 0;
      }
    });
  }, [entries, filterValue, sortColumn, sortDirection]);

  const handleBulkUploadComplete = (newEntries: GrassCuttingEntry[]) => {
    setEntries(newEntries);
    setShowBulkUploadModal(false);
    toast({
      title: "Bulk Upload Complete",
      description: `${newEntries.length} entries have been added.`,
    });
  };

  const handleSaveClick = () => {
    setShowSaveConfirmation(true);
  };

  const handleConfirmSave = () => {
    console.log('Saving grass cutting data:', editedData);
    toast({
      title: "Changes Saved",
      description: "Grass cutting data has been updated successfully.",
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
          <span>Daily Grass Cutting Data Entry</span>
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
              <BulkUploadModal>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </BulkUploadModal>
              <span className="text-xs mt-1">Upload</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="px-3 py-2 bg-gray-50 border-b flex flex-wrap gap-2 items-center text-xs">
          <Input
            type="search"
            placeholder="Search entries..."
            value={filterValue}
            onChange={handleFilterChange}
            className="h-7 text-xs flex-1 min-w-[120px]"
          />
          <Badge variant="secondary">
            {filteredEntries.length} Records
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
                  onClick={() => handleSort('operator')}
                >
                  <div className="flex items-center justify-between">
                    Operator
                    {sortColumn === 'operator' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center justify-between">
                    Duration (hours)
                    {sortColumn === 'duration' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left font-medium border border-gray-300 min-w-[100px] cursor-pointer hover:bg-verdo-navy/80"
                  onClick={() => handleSort('notes')}
                >
                  <div className="flex items-center justify-between">
                    Notes
                    {sortColumn === 'notes' && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody>
              {filteredEntries.map((entry, index) => {
                return (
                  <tr key={entry.id} className={cn(
                    "hover:bg-muted/20",
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  )}>
                    <td className="px-2 py-1 border border-gray-300">
                      <div className="text-xs py-1 px-2 bg-muted/50 rounded">
                        {format(new Date(entry.date), 'yyyy-MM-dd')}
                      </div>
                    </td>
                    <td className="px-2 py-1 border border-gray-300">
                      <Input
                        type="text"
                        value={editedData[`${entry.id}-operator`] !== undefined ? editedData[`${entry.id}-operator`] : entry.operator}
                        onChange={(e) => handleCellEdit(entry.id, 'operator', e.target.value)}
                        className={cn(
                          "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                          isEditMode && "bg-blue-100",
                          editedData[`${entry.id}-operator`] !== undefined && "bg-yellow-50 border border-yellow-300"
                        )}
                        readOnly={!isEditMode}
                      />
                    </td>
                    <td className="px-2 py-1 border border-gray-300">
                      <Input
                        type="number"
                        value={editedData[`${entry.id}-duration`] !== undefined ? editedData[`${entry.id}-duration`] : entry.duration}
                        onChange={(e) => handleCellEdit(entry.id, 'duration', e.target.value)}
                        className={cn(
                          "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                          isEditMode && "bg-blue-100",
                          editedData[`${entry.id}-duration`] !== undefined && "bg-yellow-50 border border-yellow-300"
                        )}
                        readOnly={!isEditMode}
                        step="0.5"
                      />
                    </td>
                    <td className="px-2 py-1 border border-gray-300">
                      <Input
                        type="text"
                        value={editedData[`${entry.id}-notes`] !== undefined ? editedData[`${entry.id}-notes`] : entry.notes}
                        onChange={(e) => handleCellEdit(entry.id, 'notes', e.target.value)}
                        className={cn(
                          "h-6 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                          isEditMode && "bg-blue-100",
                          editedData[`${entry.id}-notes`] !== undefined && "bg-yellow-50 border border-yellow-300"
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
        description={`Are you sure you want to save ${Object.keys(editedData).length} change(s) to the grass cutting data?`}
        confirmText="Save Changes"
        cancelText="Cancel"
      />
    </>
  );
};
