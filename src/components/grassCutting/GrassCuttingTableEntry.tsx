
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Save, Plus, Trash2, Upload, X } from 'lucide-react';
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

  const getAvailableInverters = (blockName: string) => {
    const block = mockBlocks.find(b => b.name === blockName);
    return block ? mockInverters.filter(inv => inv.blockId === block.id) : [];
  };

  const getAvailableSCBs = (inverterName: string) => {
    const inverter = mockInverters.find(inv => inv.name === inverterName);
    return inverter ? mockSCBs.filter(scb => scb.inverterId === inverter.id) : [];
  };

  const calculateMetrics = (numberOfStrings: number) => {
    const planned = 25; // Mock planned value
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
        
        // Clear dependent fields
        if (field === 'block') {
          updatedRow.inverter = '';
          updatedRow.scb = '';
        } else if (field === 'inverter') {
          updatedRow.scb = '';
        }
        
        // Recalculate metrics if strings cleaned changed
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

    // Reset form
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
      <div className="bg-card border rounded-lg p-4 sm:p-8 text-center">
        <p className="text-muted-foreground">Select a site to begin grass cutting data entry</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg mb-6">
      <div className="p-4 border-b bg-muted/50">
        <h3 className="font-semibold text-sm sm:text-base">Grass Cutting Data Entry</h3>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Date Selection */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(
                  "justify-start text-left font-normal text-sm min-w-[200px]",
                  !selectedDate && "text-muted-foreground"
                )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Pick a date'}
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

          <Button onClick={addRow} className="bg-[#001f3f] hover:bg-[#001f3f]/90 text-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Block Row
          </Button>
        </div>

        {/* Data Entry Table */}
        {rows.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[120px]">Block *</TableHead>
                    <TableHead className="min-w-[120px]">Inverter *</TableHead>
                    <TableHead className="min-w-[100px]">SCB</TableHead>
                    <TableHead className="min-w-[100px]">Strings *</TableHead>
                    <TableHead className="min-w-[100px]">Start *</TableHead>
                    <TableHead className="min-w-[100px]">Stop *</TableHead>
                    <TableHead className="min-w-[120px]">Verified By *</TableHead>
                    <TableHead className="min-w-[150px]">Remarks</TableHead>
                    <TableHead className="w-[60px]">Planned</TableHead>
                    <TableHead className="w-[60px]">Dev.</TableHead>
                    <TableHead className="w-[60px]">%</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Select value={row.block} onValueChange={(value) => updateRow(row.id, 'block', value)}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBlocks.map(block => (
                              <SelectItem key={block.id} value={block.name}>{block.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={row.inverter} 
                          onValueChange={(value) => updateRow(row.id, 'inverter', value)}
                          disabled={!row.block}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableInverters(row.block).map(inverter => (
                              <SelectItem key={inverter.id} value={inverter.name}>{inverter.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={row.scb || ''} 
                          onValueChange={(value) => updateRow(row.id, 'scb', value)}
                          disabled={!row.inverter}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Optional" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableSCBs(row.inverter).map(scb => (
                              <SelectItem key={scb.id} value={scb.name}>{scb.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={row.numberOfStringsCleaned || ''}
                          onChange={(e) => updateRow(row.id, 'numberOfStringsCleaned', parseInt(e.target.value) || 0)}
                          className="text-xs w-20"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={row.startTime}
                          onChange={(e) => updateRow(row.id, 'startTime', e.target.value)}
                          className="text-xs w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={row.stopTime}
                          onChange={(e) => updateRow(row.id, 'stopTime', e.target.value)}
                          className="text-xs w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={row.verifiedBy} onValueChange={(value) => updateRow(row.id, 'verifiedBy', value)}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockUsers.map(user => (
                              <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={row.remarks || ''}
                          onChange={(e) => updateRow(row.id, 'remarks', e.target.value)}
                          placeholder="Optional"
                          rows={1}
                          className="text-xs resize-none min-w-[120px]"
                        />
                      </TableCell>
                      <TableCell className="text-center text-xs font-medium">
                        {row.planned}
                      </TableCell>
                      <TableCell className={cn(
                        "text-center text-xs font-medium",
                        row.deviation > 0 ? "text-green-600" : row.deviation < 0 ? "text-red-600" : "text-gray-600"
                      )}>
                        {row.deviation > 0 ? '+' : ''}{row.deviation}
                      </TableCell>
                      <TableCell className={cn(
                        "text-center text-xs font-medium",
                        row.percentComplete >= 100 ? "text-green-600" : 
                        row.percentComplete >= 80 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {row.percentComplete}%
                      </TableCell>
                      <TableCell>
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

        {/* Global Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Photos (applies to all entries)</label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGlobalPhotoUpload}
              className="hidden"
              id="global-photo-upload"
            />
            <label htmlFor="global-photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground text-center">Click to upload photos</span>
            </label>
          </div>
          
          {globalPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
              {globalPhotos.map((photo, index) => (
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
                    onClick={() => removeGlobalPhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Metrics */}
        {rows.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Planned</p>
              <p className="text-lg sm:text-xl font-semibold">{totalPlanned}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Actual</p>
              <p className="text-lg sm:text-xl font-semibold">{totalStrings}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Deviation</p>
              <p className={cn(
                "text-lg sm:text-xl font-semibold",
                totalDeviation > 0 ? "text-green-600" : totalDeviation < 0 ? "text-red-600" : "text-gray-600"
              )}>
                {totalDeviation > 0 ? '+' : ''}{totalDeviation}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Overall %</p>
              <p className={cn(
                "text-lg sm:text-xl font-semibold",
                overallCompletion >= 100 ? "text-green-600" : 
                overallCompletion >= 80 ? "text-yellow-600" : "text-red-600"
              )}>
                {overallCompletion}%
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={rows.length === 0}
            className="w-full sm:w-auto bg-[#001f3f] hover:bg-[#001f3f]/90 text-sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Entries ({rows.length})
          </Button>
        </div>
      </div>
    </div>
  );
};
