
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Upload, X } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site } from '@/types/generation';
import { GrassCuttingFormData } from '@/types/grassCutting';
import { mockBlocks, mockInverters, mockSCBs, mockUsers } from '@/data/mockGrassCuttingData';
import { useToast } from '@/hooks/use-toast';

interface GrassCuttingDataEntryProps {
  site: Site | null;
}

interface TableData {
  [blockName: string]: {
    [inverterName: string]: {
      totalStrings: number;
      grassCuttingDone: number;
      percentCompleted: number;
    };
  };
}

export const GrassCuttingDataEntry: React.FC<GrassCuttingDataEntryProps> = ({ site }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [tableData, setTableData] = useState<TableData>({});
  const [verifiedBy, setVerifiedBy] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const { toast } = useToast();

  // Initialize table data when site changes
  useMemo(() => {
    if (!site) return;
    
    const blocks = mockBlocks.filter(block => block.siteId === site.id);
    const newTableData: TableData = {};
    
    blocks.forEach(block => {
      const blockInverters = mockInverters.filter(inv => inv.blockId === block.id);
      newTableData[block.name] = {};
      
      blockInverters.forEach(inverter => {
        newTableData[block.name][inverter.name] = {
          totalStrings: 768, // Mock total strings per inverter
          grassCuttingDone: 0,
          percentCompleted: 0,
        };
      });
    });
    
    setTableData(newTableData);
  }, [site]);

  const blocks = Object.keys(tableData);
  
  const totalSummary = useMemo(() => {
    let totalDone = 0;
    let totalPlanned = 0;
    
    Object.values(tableData).forEach(blockData => {
      Object.values(blockData).forEach(inverterData => {
        totalDone += inverterData.grassCuttingDone;
        totalPlanned += inverterData.totalStrings;
      });
    });
    
    const deviation = totalDone - totalPlanned;
    
    return { totalDone, totalPlanned, deviation };
  }, [tableData]);

  if (!site) {
    return (
      <div className="bg-card border rounded-lg p-4 sm:p-8 text-center">
        <p className="text-muted-foreground">Select a site to begin grass cutting data entry</p>
      </div>
    );
  }

  const updateCellValue = (blockName: string, inverterName: string, value: number) => {
    setTableData(prev => {
      const updated = { ...prev };
      if (updated[blockName] && updated[blockName][inverterName]) {
        const totalStrings = updated[blockName][inverterName].totalStrings;
        updated[blockName][inverterName] = {
          ...updated[blockName][inverterName],
          grassCuttingDone: value,
          percentCompleted: totalStrings > 0 ? Math.round((value / totalStrings) * 100) : 0,
        };
      }
      return updated;
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!date || !verifiedBy) {
      toast({
        title: "Validation Error",
        description: "Date and Verified By are required fields.",
        variant: "destructive",
      });
      return;
    }

    console.log('Saving grass cutting data:', { 
      date, 
      tableData, 
      verifiedBy, 
      remarks, 
      photos: selectedPhotos 
    });
    
    toast({
      title: "Data Saved",
      description: `Grass cutting data for ${format(date, 'PPP')} has been saved successfully.`,
    });
  };

  const thirtyDaysAgo = subDays(new Date(), 30);

  return (
    <div className="bg-card border rounded-lg mb-6">
      <div className="p-4 border-b bg-muted/50">
        <h3 className="font-semibold text-sm sm:text-base">Grass Cutting Data Entry</h3>
      </div>
      
      <div className="p-4 sm:p-6 space-y-6">
        {/* Date and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal text-sm">
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span>{date ? format(date, 'MMM dd, yyyy') : 'Pick a date'}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  disabled={(date) => date > new Date() || date < thirtyDaysAgo}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Excel-style Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Header Row */}
            <div className="grid grid-cols-[120px_repeat(16,_80px)_120px_120px_100px] gap-0 border">
              {/* First cell - empty */}
              <div className="h-12 bg-[#8B4513] border-r border-gray-300"></div>
              
              {/* Block headers */}
              {blocks.map(blockName => {
                const inverters = Object.keys(tableData[blockName] || {});
                return (
                  <div 
                    key={blockName} 
                    className={`h-12 bg-[#8B4513] text-white text-sm font-medium flex items-center justify-center border-r border-gray-300`}
                    style={{ gridColumn: `span ${inverters.length}` }}
                  >
                    {blockName}
                  </div>
                );
              })}
              
              {/* Summary headers */}
              <div className="h-12 bg-[#8B4513] text-white text-sm font-medium flex items-center justify-center border-r border-gray-300">
                Daily Actual Grasscutting
              </div>
              <div className="h-12 bg-[#8B4513] text-white text-sm font-medium flex items-center justify-center border-r border-gray-300">
                Daily Planned
              </div>
              <div className="h-12 bg-[#8B4513] text-white text-sm font-medium flex items-center justify-center">
                Deviation
              </div>
            </div>

            {/* Inverter sub-headers */}
            <div className="grid grid-cols-[120px_repeat(16,_80px)_120px_120px_100px] gap-0 border-t-0">
              <div className="h-10 bg-[#A0522D] border-r border-gray-300 flex items-center justify-center text-sm font-medium">
                Inverter
              </div>
              
              {blocks.map(blockName => 
                Object.keys(tableData[blockName] || {}).map(inverterName => (
                  <div 
                    key={`${blockName}-${inverterName}`}
                    className="h-10 bg-[#A0522D] text-white text-xs flex items-center justify-center border-r border-gray-300"
                  >
                    {inverterName}
                  </div>
                ))
              )}
              
              {/* Summary sub-headers */}
              <div className="h-10 bg-[#A0522D] border-r border-gray-300"></div>
              <div className="h-10 bg-[#A0522D] border-r border-gray-300"></div>
              <div className="h-10 bg-[#A0522D]"></div>
            </div>

            {/* Data Rows */}
            {/* Total Strings Row */}
            <div className="grid grid-cols-[120px_repeat(16,_80px)_120px_120px_100px] gap-0 border-t">
              <div className="h-10 bg-cyan-100 border-r border-gray-300 flex items-center justify-center text-sm font-medium">
                Total Strings
              </div>
              
              {blocks.map(blockName => 
                Object.keys(tableData[blockName] || {}).map(inverterName => (
                  <div 
                    key={`total-${blockName}-${inverterName}`}
                    className="h-10 bg-cyan-100 border-r border-gray-300 flex items-center justify-center text-sm"
                  >
                    {tableData[blockName]?.[inverterName]?.totalStrings || 0}
                  </div>
                ))
              )}
              
              <div className="h-10 bg-cyan-100 border-r border-gray-300"></div>
              <div className="h-10 bg-cyan-100 border-r border-gray-300"></div>
              <div className="h-10 bg-cyan-100 flex items-center justify-center text-sm font-semibold">0</div>
            </div>

            {/* Grass Cutting Done Row */}
            <div className="grid grid-cols-[120px_repeat(16,_80px)_120px_120px_100px] gap-0 border-t">
              <div className="h-10 bg-cyan-100 border-r border-gray-300 flex items-center justify-center text-sm font-medium">
                Grass Cutting Done
              </div>
              
              {blocks.map(blockName => 
                Object.keys(tableData[blockName] || {}).map(inverterName => (
                  <div 
                    key={`done-${blockName}-${inverterName}`}
                    className="h-10 bg-cyan-100 border-r border-gray-300 p-1"
                  >
                    <Input
                      type="number"
                      min="0"
                      value={tableData[blockName]?.[inverterName]?.grassCuttingDone || ''}
                      onChange={(e) => updateCellValue(blockName, inverterName, parseInt(e.target.value) || 0)}
                      className="h-8 text-xs text-center border-0 bg-transparent p-1"
                    />
                  </div>
                ))
              )}
              
              <div className="h-10 bg-cyan-100 border-r border-gray-300 flex items-center justify-center text-sm font-semibold">
                {totalSummary.totalDone}
              </div>
              <div className="h-10 bg-cyan-100 border-r border-gray-300 flex items-center justify-center text-sm">
                248
              </div>
              <div className="h-10 bg-cyan-100 flex items-center justify-center text-sm font-semibold">
                {totalSummary.totalDone - 248}
              </div>
            </div>

            {/* % Completed Row */}
            <div className="grid grid-cols-[120px_repeat(16,_80px)_120px_120px_100px] gap-0 border-t">
              <div className="h-10 bg-cyan-100 border-r border-gray-300 flex items-center justify-center text-sm font-medium">
                % Completed
              </div>
              
              {blocks.map(blockName => 
                Object.keys(tableData[blockName] || {}).map(inverterName => (
                  <div 
                    key={`percent-${blockName}-${inverterName}`}
                    className="h-10 bg-cyan-100 border-r border-gray-300 flex items-center justify-center text-sm"
                  >
                    {tableData[blockName]?.[inverterName]?.percentCompleted || 0}%
                  </div>
                ))
              )}
              
              <div className="h-10 bg-cyan-100 border-r border-gray-300"></div>
              <div className="h-10 bg-cyan-100 border-r border-gray-300"></div>
              <div className="h-10 bg-cyan-100"></div>
            </div>
          </div>
        </div>

        {/* Verified By and Remarks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Verified By *</label>
            <Select value={verifiedBy} onValueChange={setVerifiedBy}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select verifier" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks</label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks"
              rows={3}
              className="text-sm resize-none"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Photos</label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground text-center">Click to upload photos</span>
            </label>
          </div>
          
          {selectedPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
              {selectedPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-16 sm:h-20 object-cover rounded border"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="w-full sm:w-auto bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-sm">
            <Save className="h-4 w-4 mr-2" />
            Save Entry
          </Button>
        </div>
      </div>
    </div>
  );
};
