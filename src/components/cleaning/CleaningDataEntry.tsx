
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Camera, Plus, Trash2, RotateCcw, Upload, CalendarIcon, Droplets, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site } from '@/types/generation';
import { CleaningTableRow } from '@/types/cleaning';
import { mockBlocks, mockInverters } from '@/data/mockGrassCuttingData';
import { mockCleaningConfig } from '@/data/mockCleaningData';
import { useSidebar } from '@/components/ui/sidebar';

interface CleaningDataEntryProps {
  site: Site;
}

export const CleaningDataEntry: React.FC<CleaningDataEntryProps> = ({ site }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const [rows, setRows] = useState<CleaningTableRow[]>([]);
  const [cleaningType, setCleaningType] = useState<'wet' | 'dry'>('wet');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [globalPhotos, setGlobalPhotos] = useState<File[]>([]);
  const [verifiedBy, setVerifiedBy] = useState('');

  // Auto-populate rows when site changes
  useEffect(() => {
    if (site) {
      const siteBlocks = mockBlocks.filter(block => block.siteId === site.id);
      if (siteBlocks.length > 0) {
        const newRows = siteBlocks.map((block, index) => {
          const blockInverters = mockInverters.filter(inv => inv.blockId === block.id);
          const inverter = blockInverters[0]?.name || '';
          const totalModules = mockCleaningConfig.totalModulesPerInverter[inverter] || 0;
          const plannedModules = mockCleaningConfig.plannedModulesPerDay[inverter] || 0;
          
          return {
            id: `row-${index}`,
            block: block.name,
            inverter,
            scb: '',
            stringTableNumber: '',
            modulesCleaned: 0,
            waterConsumption: 0,
            rainfall: 0,
            remarks: '',
            photos: [],
            totalModules,
            cyclesCleaned: 0,
            plannedModules,
            percentCleaned: 0,
            uncleanedModules: plannedModules
          };
        });
        setRows(newRows);
      }
    }
  }, [site]);

  const addRow = () => {
    const newRow: CleaningTableRow = {
      id: `row-${Date.now()}`,
      block: '',
      inverter: '',
      scb: '',
      stringTableNumber: '',
      modulesCleaned: 0,
      waterConsumption: 0,
      rainfall: 0,
      remarks: '',
      photos: [],
      totalModules: 0,
      cyclesCleaned: 0,
      plannedModules: 0,
      percentCleaned: 0,
      uncleanedModules: 0
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof CleaningTableRow, value: any) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        // Update calculated values when inverter or modules cleaned changes
        if (field === 'inverter') {
          updatedRow.totalModules = mockCleaningConfig.totalModulesPerInverter[value] || 0;
          updatedRow.plannedModules = mockCleaningConfig.plannedModulesPerDay[value] || 0;
        }
        
        // Recalculate derived values
        const modulesCleaned = field === 'modulesCleaned' ? value : updatedRow.modulesCleaned;
        updatedRow.cyclesCleaned = updatedRow.totalModules > 0 ? Number((modulesCleaned / updatedRow.totalModules).toFixed(2)) : 0;
        updatedRow.percentCleaned = updatedRow.plannedModules > 0 ? Math.round((modulesCleaned / updatedRow.plannedModules) * 100) : 0;
        updatedRow.uncleanedModules = updatedRow.plannedModules - modulesCleaned;
        
        return updatedRow;
      }
      return row;
    }));
  };

  const handlePhotoUpload = (rowId: string, files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files);
      updateRow(rowId, 'photos', [...rows.find(r => r.id === rowId)?.photos || [], ...newPhotos]);
    }
  };

  const handleGlobalPhotoUpload = (files: FileList | null) => {
    if (files) {
      setGlobalPhotos([...globalPhotos, ...Array.from(files)]);
    }
  };

  const removePhoto = (rowId: string, photoIndex: number) => {
    const row = rows.find(r => r.id === rowId);
    if (row) {
      const updatedPhotos = row.photos.filter((_, index) => index !== photoIndex);
      updateRow(rowId, 'photos', updatedPhotos);
    }
  };

  const removeGlobalPhoto = (photoIndex: number) => {
    setGlobalPhotos(globalPhotos.filter((_, index) => index !== photoIndex));
  };

  const getAvailableInverters = (blockName: string) => {
    const block = mockBlocks.find(b => b.name === blockName && b.siteId === site.id);
    if (block) {
      return mockInverters.filter(inv => inv.blockId === block.id);
    }
    return [];
  };

  const getAvailableBlocks = () => {
    return mockBlocks.filter(block => block.siteId === site.id);
  };

  const totalModulesCleaned = rows.reduce((sum, row) => sum + row.modulesCleaned, 0);
  const totalWaterConsumption = rows.reduce((sum, row) => sum + (row.waterConsumption || 0), 0);
  const totalPlannedModules = rows.reduce((sum, row) => sum + row.plannedModules, 0);
  const overallPercentage = totalPlannedModules > 0 ? Math.round((totalModulesCleaned / totalPlannedModules) * 100) : 0;

  // Group rows by block for Excel-style display
  const groupedRows = rows.reduce((acc, row) => {
    if (!acc[row.block]) {
      acc[row.block] = [];
    }
    acc[row.block].push(row);
    return acc;
  }, {} as Record<string, CleaningTableRow[]>);

  return (
    <Card className="w-full">
      <CardHeader className={`${isCollapsed ? 'px-3 py-3' : 'px-4 py-4'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            {cleaningType === 'wet' ? <Droplets className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            Cleaning Data Entry
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button onClick={addRow} size="sm" className="text-xs h-7">
              <Plus className="w-3 h-3 mr-1" />
              Add Row
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`${isCollapsed ? 'px-3 py-3' : 'px-4 py-4'} space-y-4`}>
        {/* Top Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Cleaning Type *</label>
            <Select value={cleaningType} onValueChange={(value: 'wet' | 'dry') => setCleaningType(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wet" className="text-xs">Wet Cleaning</SelectItem>
                <SelectItem value="dry" className="text-xs">Dry Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 justify-start text-left font-normal text-xs",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) =>
                    date > new Date() || date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  }
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Verified By *</label>
            <Select value={verifiedBy} onValueChange={setVerifiedBy}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select verifier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervisor1" className="text-xs">Site Supervisor</SelectItem>
                <SelectItem value="engineer1" className="text-xs">Field Engineer</SelectItem>
                <SelectItem value="manager1" className="text-xs">Operations Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Excel-style Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header */}
              <div className="bg-[#8B4513] text-white">
                <div className="grid grid-cols-12 gap-1 p-2 text-xs font-medium">
                  <div className="col-span-1">Block</div>
                  <div className="col-span-1">Inverter</div>
                  <div className="col-span-1">SCB</div>
                  <div className="col-span-1">String Table</div>
                  <div className="col-span-1">Modules Cleaned</div>
                  {cleaningType === 'wet' && <div className="col-span-1">Water (L)</div>}
                  {cleaningType === 'wet' ? (
                    <div className="col-span-1">Rainfall (mm)</div>
                  ) : (
                    <div className="col-span-2"></div>
                  )}
                  <div className="col-span-1">Total Modules</div>
                  <div className="col-span-1">Cycles</div>
                  <div className="col-span-1">% Cleaned</div>
                  <div className="col-span-1">Uncleaned</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Data Rows */}
              {rows.map((row, index) => (
                <div key={row.id} className={`grid grid-cols-12 gap-1 p-2 border-b text-xs ${
                  index % 2 === 0 ? 'bg-white' : 'bg-green-50'
                }`}>
                  {/* Block */}
                  <div className="col-span-1">
                    <Select value={row.block} onValueChange={(value) => updateRow(row.id, 'block', value)}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Block" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableBlocks().map(block => (
                          <SelectItem key={block.id} value={block.name} className="text-xs">
                            {block.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Inverter */}
                  <div className="col-span-1">
                    <Select
                      value={row.inverter}
                      onValueChange={(value) => updateRow(row.id, 'inverter', value)}
                      disabled={!row.block}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Inv" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableInverters(row.block).map(inverter => (
                          <SelectItem key={inverter.id} value={inverter.name} className="text-xs">
                            {inverter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* SCB */}
                  <div className="col-span-1">
                    <Input
                      value={row.scb}
                      onChange={(e) => updateRow(row.id, 'scb', e.target.value)}
                      placeholder="SCB"
                      className="h-7 text-xs"
                    />
                  </div>

                  {/* String Table */}
                  <div className="col-span-1">
                    <Input
                      value={row.stringTableNumber || ''}
                      onChange={(e) => updateRow(row.id, 'stringTableNumber', e.target.value)}
                      placeholder="ST-01"
                      className="h-7 text-xs"
                    />
                  </div>

                  {/* Modules Cleaned */}
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={row.modulesCleaned || ''}
                      onChange={(e) => updateRow(row.id, 'modulesCleaned', Number(e.target.value) || 0)}
                      placeholder="0"
                      className="h-7 text-xs"
                    />
                  </div>

                  {/* Water Consumption (Wet only) */}
                  {cleaningType === 'wet' && (
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={row.waterConsumption || ''}
                        onChange={(e) => updateRow(row.id, 'waterConsumption', Number(e.target.value) || 0)}
                        placeholder="0"
                        className="h-7 text-xs"
                      />
                    </div>
                  )}

                  {/* Rainfall */}
                  <div className="col-span-1">
                    <Input
                      type="number"
                      step="0.1"
                      value={row.rainfall || ''}
                      onChange={(e) => updateRow(row.id, 'rainfall', Number(e.target.value) || 0)}
                      placeholder="0.0"
                      className="h-7 text-xs"
                    />
                  </div>

                  {/* Total Modules (Read-only) */}
                  <div className="col-span-1">
                    <div className="h-7 px-2 rounded border bg-gray-50 text-xs flex items-center justify-center font-medium">
                      {row.totalModules}
                    </div>
                  </div>

                  {/* Cycles Cleaned (Read-only) */}
                  <div className="col-span-1">
                    <div className="h-7 px-2 rounded border bg-gray-50 text-xs flex items-center justify-center font-medium">
                      {row.cyclesCleaned}
                    </div>
                  </div>

                  {/* Percent Cleaned (Read-only) */}
                  <div className="col-span-1">
                    <div className={`h-7 px-2 rounded border text-xs flex items-center justify-center font-medium ${
                      row.percentCleaned >= 100 ? 'text-green-700 bg-green-50 border-green-200' :
                      row.percentCleaned >= 80 ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                      'text-red-700 bg-red-50 border-red-200'
                    }`}>
                      {row.percentCleaned}%
                    </div>
                  </div>

                  {/* Uncleaned Modules (Read-only) */}
                  <div className="col-span-1">
                    <div className={`h-7 px-2 rounded border text-xs flex items-center justify-center font-medium ${
                      row.uncleanedModules <= 0 ? 'text-green-700 bg-green-50 border-green-200' :
                      'text-red-700 bg-red-50 border-red-200'
                    }`}>
                      {row.uncleanedModules}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRow(row.id)}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Summary Row */}
              {rows.length > 0 && (
                <div className="bg-[#001F3F] text-white font-bold">
                  <div className="grid grid-cols-12 gap-1 p-2 text-xs">
                    <div className="col-span-4 flex items-center">TOTALS</div>
                    <div className="col-span-1 flex items-center justify-center">{totalModulesCleaned}</div>
                    {cleaningType === 'wet' && (
                      <div className="col-span-1 flex items-center justify-center">{totalWaterConsumption}L</div>
                    )}
                    <div className="col-span-3"></div>
                    <div className="col-span-1 flex items-center justify-center text-[#00A86B]">
                      {overallPercentage}%
                    </div>
                    <div className="col-span-2"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Photos */}
        <div>
          <label className="block text-xs font-medium mb-2">Photos</label>
          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleGlobalPhotoUpload(e.target.files)}
              className="hidden"
              id="global-photos"
            />
            <label htmlFor="global-photos" className="cursor-pointer">
              <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                <span>
                  <Upload className="w-3 h-3 mr-1" />
                  Add Photos
                </span>
              </Button>
            </label>
            
            {globalPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-75"
                  onClick={() => removeGlobalPhoto(index)}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full text-xs"
                  onClick={() => removeGlobalPhoto(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button size="sm" className="text-xs bg-[#00A86B] hover:bg-[#008c5a]">
            Submit Cleaning Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
