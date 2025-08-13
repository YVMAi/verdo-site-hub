
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Save, Plus, Trash2, Upload, X, RefreshCw, Camera } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site } from '@/types/generation';
import { GrassCuttingTableRow } from '@/types/grassCutting';
import { mockBlocks, mockInverters, mockSCBs, mockUsers } from '@/data/mockGrassCuttingData';
import { useToast } from '@/hooks/use-toast';

interface GrassCuttingTableEntryProps {
  site: Site | null;
}

export const GrassCuttingTableEntry: React.FC<GrassCuttingTableEntryProps> = ({ site }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [rows, setRows] = useState<GrassCuttingTableRow[]>([]);
  const [globalPhotos, setGlobalPhotos] = useState<File[]>([]);
  const { toast } = useToast();

  const availableBlocks = useMemo(() => {
    return site ? mockBlocks.filter(block => block.siteId === site.id) : [];
  }, [site]);

  // Auto-populate rows when site changes
  useEffect(() => {
    if (site && availableBlocks.length > 0) {
      const autoRows = availableBlocks.map((block) => {
        const blockInverters = mockInverters.filter(inv => inv.blockId === block.id);
        const firstInverter = blockInverters[0];
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          block: block.name,
          inverter: firstInverter ? firstInverter.name : '',
          scb: '',
          numberOfStringsCleaned: 0,
          startTime: '',
          stopTime: '',
          verifiedBy: '',
          remarks: '',
          photos: [],
          planned: 25,
          deviation: -25,
          percentComplete: 0,
        };
      });
      setRows(autoRows);
    } else {
      setRows([]);
    }
  }, [site, availableBlocks]);

  const getAvailableInverters = (blockName: string) => {
    const block = mockBlocks.find(b => b.name === blockName);
    return block ? mockInverters.filter(inv => inv.blockId === block.id) : [];
  };

  const getAvailableSCBs = (inverterName: string) => {
    const inverter = mockInverters.find(inv => inv.name === inverterName);
    return inverter ? mockSCBs.filter(scb => scb.inverterId === inverter.id) : [];
  };

  const calculateMetrics = (numberOfStrings: number) => {
    const planned = 25;
    const deviation = numberOfStrings - planned;
    const percentComplete = planned > 0 ? Math.round((numberOfStrings / planned) * 100) : 0;
    return { planned, deviation, percentComplete };
  };

  const addRow = () => {
    const newRow: GrassCuttingTableRow = {
      id: Math.random().toString(36).substr(2, 9),
      block: '',
      inverter: '',
      scb: '',
      numberOfStringsCleaned: 0,
      startTime: '',
      stopTime: '',
      verifiedBy: '',
      remarks: '',
      photos: [],
      planned: 25,
      deviation: -25,
      percentComplete: 0,
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof GrassCuttingTableRow, value: any) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        if (field === 'block') {
          updatedRow.inverter = '';
          updatedRow.scb = '';
        } else if (field === 'inverter') {
          updatedRow.scb = '';
        }
        
        if (field === 'numberOfStringsCleaned') {
          const metrics = calculateMetrics(value);
          updatedRow.planned = metrics.planned;
          updatedRow.deviation = metrics.deviation;
          updatedRow.percentComplete = metrics.percentComplete;
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  const handleRowPhotoUpload = (rowId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    updateRow(rowId, 'photos', [...(rows.find(r => r.id === rowId)?.photos || []), ...files]);
  };

  const removeRowPhoto = (rowId: string, photoIndex: number) => {
    const row = rows.find(r => r.id === rowId);
    if (row) {
      const updatedPhotos = row.photos.filter((_, index) => index !== photoIndex);
      updateRow(rowId, 'photos', updatedPhotos);
    }
  };

  const autoPopulateRows = () => {
    if (site && availableBlocks.length > 0) {
      const autoRows = availableBlocks.map((block) => {
        const blockInverters = mockInverters.filter(inv => inv.blockId === block.id);
        const firstInverter = blockInverters[0];
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          block: block.name,
          inverter: firstInverter ? firstInverter.name : '',
          scb: '',
          numberOfStringsCleaned: 0,
          startTime: '',
          stopTime: '',
          verifiedBy: '',
          remarks: '',
          photos: [],
          planned: 25,
          deviation: -25,
          percentComplete: 0,
        };
      });
      setRows(autoRows);
      toast({
        title: "Rows Auto-populated",
        description: `${autoRows.length} rows created for all blocks in ${site.name}`,
      });
    }
  };

  const handleGlobalPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setGlobalPhotos(prev => [...prev, ...files]);
  };

  const removeGlobalPhoto = (index: number) => {
    setGlobalPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateRows = () => {
    const errors: string[] = [];
    
    if (rows.length === 0) {
      errors.push('At least one row is required');
      return errors;
    }

    rows.forEach((row, index) => {
      if (!row.block) errors.push(`Row ${index + 1}: Block is required`);
      if (!row.inverter) errors.push(`Row ${index + 1}: Inverter is required`);
      if (!row.numberOfStringsCleaned || row.numberOfStringsCleaned <= 0) {
        errors.push(`Row ${index + 1}: Number of strings must be greater than 0`);
      }
      if (!row.startTime) errors.push(`Row ${index + 1}: Start time is required`);
      if (!row.stopTime) errors.push(`Row ${index + 1}: Stop time is required`);
      if (!row.verifiedBy) errors.push(`Row ${index + 1}: Verified by is required`);
    });

    return errors;
  };

  const handleSave = () => {
    const errors = validateRows();
    
    if (errors.length > 0) {
      toast({
        title: "Validation Errors",
        description: errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    console.log('Saving grass cutting data:', { 
      date: selectedDate, 
      rows, 
      globalPhotos 
    });
    
    toast({
      title: "Data Saved",
      description: `${rows.length} grass cutting entries for ${format(selectedDate, 'PPP')} have been saved successfully.`,
    });

    setRows([]);
    setGlobalPhotos([]);
  };

  const totalStrings = rows.reduce((sum, row) => sum + (row.numberOfStringsCleaned || 0), 0);
  const totalPlanned = rows.reduce((sum, row) => sum + row.planned, 0);
  const totalDeviation = totalStrings - totalPlanned;
  const overallCompletion = totalPlanned > 0 ? Math.round((totalStrings / totalPlanned) * 100) : 0;

  const thirtyDaysAgo = subDays(new Date(), 30);

  if (!site) {
    return (
      <div className="bg-card border rounded-lg p-4 text-center">
        <p className="text-muted-foreground text-sm">Select a site to begin grass cutting data entry</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg mb-4">
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-semibold text-sm">Grass Cutting Data Entry</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Compact Header Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn(
                    "justify-start text-left font-normal text-xs w-36",
                    !selectedDate && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {selectedDate ? format(selectedDate, 'MMM dd') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date > new Date() || date < thirtyDaysAgo}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={autoPopulateRows} size="sm" variant="outline" className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Auto-populate
            </Button>
            <Button onClick={addRow} size="sm" className="bg-[#001f3f] hover:bg-[#001f3f]/90 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Row
            </Button>
          </div>
        </div>

        {/* Compact Data Entry Table */}
        {rows.length > 0 && (
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[100px] text-xs p-2">Block *</TableHead>
                    <TableHead className="min-w-[100px] text-xs p-2">Inverter *</TableHead>
                    <TableHead className="min-w-[80px] text-xs p-2">SCB</TableHead>
                    <TableHead className="min-w-[70px] text-xs p-2">Strings *</TableHead>
                    <TableHead className="min-w-[70px] text-xs p-2">Start *</TableHead>
                    <TableHead className="min-w-[70px] text-xs p-2">Stop *</TableHead>
                    <TableHead className="min-w-[100px] text-xs p-2">Verified By *</TableHead>
                    <TableHead className="min-w-[120px] text-xs p-2">Remarks</TableHead>
                    <TableHead className="min-w-[100px] text-xs p-2">Photos</TableHead>
                    <TableHead className="w-[50px] text-xs p-2">Plan</TableHead>
                    <TableHead className="w-[50px] text-xs p-2">Dev</TableHead>
                    <TableHead className="w-[40px] text-xs p-2">%</TableHead>
                    <TableHead className="w-[40px] text-xs p-2"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={row.id} className="h-12">
                      <TableCell className="p-1">
                        <Select value={row.block} onValueChange={(value) => updateRow(row.id, 'block', value)}>
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBlocks.map(block => (
                              <SelectItem key={block.id} value={block.name}>{block.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-1">
                        <Select 
                          value={row.inverter} 
                          onValueChange={(value) => updateRow(row.id, 'inverter', value)}
                          disabled={!row.block}
                        >
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableInverters(row.block).map(inverter => (
                              <SelectItem key={inverter.id} value={inverter.name}>{inverter.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-1">
                        <Select 
                          value={row.scb || ''} 
                          onValueChange={(value) => updateRow(row.id, 'scb', value)}
                          disabled={!row.inverter}
                        >
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue placeholder="Optional" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableSCBs(row.inverter).map(scb => (
                              <SelectItem key={scb.id} value={scb.name}>{scb.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-1">
                        <Input
                          type="number"
                          min="0"
                          value={row.numberOfStringsCleaned || ''}
                          onChange={(e) => updateRow(row.id, 'numberOfStringsCleaned', parseInt(e.target.value) || 0)}
                          className="text-xs h-8 w-16"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Input
                          type="time"
                          value={row.startTime}
                          onChange={(e) => updateRow(row.id, 'startTime', e.target.value)}
                          className="text-xs h-8 w-20"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Input
                          type="time"
                          value={row.stopTime}
                          onChange={(e) => updateRow(row.id, 'stopTime', e.target.value)}
                          className="text-xs h-8 w-20"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Select value={row.verifiedBy} onValueChange={(value) => updateRow(row.id, 'verifiedBy', value)}>
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockUsers.map(user => (
                              <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-1">
                        <Textarea
                          value={row.remarks || ''}
                          onChange={(e) => updateRow(row.id, 'remarks', e.target.value)}
                          placeholder="Optional"
                          rows={1}
                          className="text-xs resize-none h-8 min-w-[100px]"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <div className="flex flex-col gap-1">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleRowPhotoUpload(row.id, e)}
                            className="hidden"
                            id={`row-photo-${row.id}`}
                          />
                          <label htmlFor={`row-photo-${row.id}`} className="cursor-pointer">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-6 w-full text-xs p-1"
                              asChild
                            >
                              <span>
                                <Camera className="h-3 w-3 mr-1" />
                                {row.photos.length}
                              </span>
                            </Button>
                          </label>
                          {row.photos.length > 0 && (
                            <div className="flex flex-wrap gap-1 max-w-[100px]">
                              {row.photos.slice(0, 2).map((photo, photoIndex) => (
                                <div key={photoIndex} className="relative">
                                  <img
                                    src={URL.createObjectURL(photo)}
                                    alt={`Row ${index + 1} Photo ${photoIndex + 1}`}
                                    className="w-6 h-6 object-cover rounded border"
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full p-0"
                                    onClick={() => removeRowPhoto(row.id, photoIndex)}
                                  >
                                    <X className="h-2 w-2" />
                                  </Button>
                                </div>
                              ))}
                              {row.photos.length > 2 && (
                                <div className="w-6 h-6 bg-muted rounded border flex items-center justify-center">
                                  <span className="text-xs">+{row.photos.length - 2}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs font-medium p-1">
                        {row.planned}
                      </TableCell>
                      <TableCell className={cn(
                        "text-center text-xs font-medium p-1",
                        row.deviation > 0 ? "text-green-600" : row.deviation < 0 ? "text-red-600" : "text-gray-600"
                      )}>
                        {row.deviation > 0 ? '+' : ''}{row.deviation}
                      </TableCell>
                      <TableCell className={cn(
                        "text-center text-xs font-medium p-1",
                        row.percentComplete >= 100 ? "text-green-600" : 
                        row.percentComplete >= 80 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {row.percentComplete}%
                      </TableCell>
                      <TableCell className="p-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeRow(row.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Compact Global Photo Upload */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Global Photos (applies to all entries)</label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-3">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGlobalPhotoUpload}
              className="hidden"
              id="global-photo-upload"
            />
            <label htmlFor="global-photo-upload" className="cursor-pointer flex flex-col items-center gap-1">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center">Click to upload photos</span>
            </label>
          </div>
          
          {globalPhotos.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-2">
              {globalPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-12 object-cover rounded border"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0"
                    onClick={() => removeGlobalPhoto(index)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compact Summary Metrics */}
        {rows.length > 0 && (
          <div className="grid grid-cols-4 gap-3 p-3 bg-muted/20 rounded-md">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Planned</p>
              <p className="text-sm font-semibold">{totalPlanned}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Actual</p>
              <p className="text-sm font-semibold">{totalStrings}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Deviation</p>
              <p className={cn(
                "text-sm font-semibold",
                totalDeviation > 0 ? "text-green-600" : totalDeviation < 0 ? "text-red-600" : "text-gray-600"
              )}>
                {totalDeviation > 0 ? '+' : ''}{totalDeviation}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Overall %</p>
              <p className={cn(
                "text-sm font-semibold",
                overallCompletion >= 100 ? "text-green-600" : 
                overallCompletion >= 80 ? "text-yellow-600" : "text-red-600"
              )}>
                {overallCompletion}%
              </p>
            </div>
          </div>
        )}

        {/* Compact Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={rows.length === 0}
            size="sm"
            className="bg-[#001f3f] hover:bg-[#001f3f]/90 text-xs"
          >
            <Save className="h-3 w-3 mr-1" />
            Save All ({rows.length})
          </Button>
        </div>
      </div>
    </div>
  );
};
