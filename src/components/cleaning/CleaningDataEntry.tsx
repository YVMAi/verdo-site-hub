
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Plus, Save, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CleaningTableRow } from '@/types/cleaning';
import { mockSiteConfig } from '@/data/mockCleaningData';

interface CleaningDataEntryProps {
  selectedClient: any;
  selectedSite: any;
}

export const CleaningDataEntry: React.FC<CleaningDataEntryProps> = ({
  selectedClient,
  selectedSite
}) => {
  const [cleaningType, setCleaningType] = useState<'Wet' | 'Dry'>('Wet');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tableData, setTableData] = useState<CleaningTableRow[]>([]);
  const [globalRemarks, setGlobalRemarks] = useState('');
  const [rainfall, setRainfall] = useState<number | undefined>();

  // Calculate totals and percentages
  const calculateRowData = (row: Partial<CleaningTableRow>): CleaningTableRow => {
    const blockConfig = mockSiteConfig.blocks[row.block || ''];
    const totalModules = blockConfig?.totalModules || 0;
    const dailyPlannedModules = blockConfig?.dailyPlannedModules || 0;
    const modulesCleaned = row.modulesCleaned || 0;
    
    return {
      ...row,
      totalModules,
      totalModulesCleaned: modulesCleaned,
      cyclesCleaned: totalModules > 0 ? modulesCleaned / totalModules : 0,
      dailyPlannedModules,
      totalCleanedPercent: dailyPlannedModules > 0 ? (modulesCleaned / dailyPlannedModules) * 100 : 0,
      uncleanedModules: dailyPlannedModules - modulesCleaned,
    } as CleaningTableRow;
  };

  const addNewRow = () => {
    const newRow: CleaningTableRow = calculateRowData({
      block: undefined,
      inverter: undefined,
      scbNumber: '',
      stringTableNumber: '',
      modulesCleaned: 0,
      waterConsumption: 0,
      remarks: '',
    });
    setTableData([...tableData, newRow]);
  };

  const updateRow = (index: number, field: keyof CleaningTableRow, value: any) => {
    const updatedData = [...tableData];
    updatedData[index] = calculateRowData({
      ...updatedData[index],
      [field]: value,
    });
    setTableData(updatedData);
  };

  const removeRow = (index: number) => {
    setTableData(tableData.filter((_, i) => i !== index));
  };

  if (!selectedClient || !selectedSite) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Please select a client and site to begin data entry.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-card border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cleaning Type</label>
            <Select value={cleaningType} onValueChange={(value: 'Wet' | 'Dry') => setCleaningType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Wet">Wet Cleaning</SelectItem>
                <SelectItem value="Dry">Dry Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => 
                    date > new Date() || date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rainfall (mm)</label>
            <Input
              type="number"
              step="0.1"
              value={rainfall || ''}
              onChange={(e) => setRainfall(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Photos</label>
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload Photos
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">General Remarks</label>
          <Textarea
            value={globalRemarks}
            onChange={(e) => setGlobalRemarks(e.target.value)}
            placeholder="Enter general remarks for today's cleaning activities..."
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* Data Entry Table */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b bg-[hsl(var(--verdo-navy))] text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cleaning Data Entry</h3>
            <Button onClick={addNewRow} size="sm" className="bg-[hsl(var(--verdo-jade))] hover:bg-[hsl(var(--verdo-jade-light))]">
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-amber-100">
              <TableRow>
                <TableHead>Block</TableHead>
                <TableHead>Inverter</TableHead>
                <TableHead>SCB Number</TableHead>
                <TableHead>String Table</TableHead>
                <TableHead>Modules Cleaned</TableHead>
                {cleaningType === 'Wet' && <TableHead>Water (L)</TableHead>}
                <TableHead>Total Modules</TableHead>
                <TableHead>Cycles Cleaned</TableHead>
                <TableHead>Planned Modules</TableHead>
                <TableHead>Cleaned (%)</TableHead>
                <TableHead>Uncleaned</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-green-50"}>
                  <TableCell>
                    <Select 
                      value={row.block || undefined} 
                      onValueChange={(value) => updateRow(index, 'block', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(mockSiteConfig.blocks).map(block => (
                          <SelectItem key={block} value={block}>{block}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={row.inverter || undefined} 
                      onValueChange={(value) => updateRow(index, 'inverter', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="INV" />
                      </SelectTrigger>
                      <SelectContent>
                        {row.block && mockSiteConfig.blocks[row.block]?.inverters.map(inv => (
                          <SelectItem key={inv} value={inv}>{inv}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.scbNumber}
                      onChange={(e) => updateRow(index, 'scbNumber', e.target.value)}
                      className="w-24"
                      placeholder="SCB"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.stringTableNumber || ''}
                      onChange={(e) => updateRow(index, 'stringTableNumber', e.target.value)}
                      className="w-24"
                      placeholder="ST"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.modulesCleaned || ''}
                      onChange={(e) => updateRow(index, 'modulesCleaned', parseInt(e.target.value) || 0)}
                      className="w-24"
                      placeholder="0"
                    />
                  </TableCell>
                  {cleaningType === 'Wet' && (
                    <TableCell>
                      <Input
                        type="number"
                        value={row.waterConsumption || ''}
                        onChange={(e) => updateRow(index, 'waterConsumption', parseInt(e.target.value) || 0)}
                        className="w-24"
                        placeholder="0"
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{row.totalModules}</TableCell>
                  <TableCell className="font-medium">{row.cyclesCleaned.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">{row.dailyPlannedModules}</TableCell>
                  <TableCell className="font-medium">{row.totalCleanedPercent.toFixed(1)}%</TableCell>
                  <TableCell className="font-medium">{row.uncleanedModules}</TableCell>
                  <TableCell>
                    <Input
                      value={row.remarks || ''}
                      onChange={(e) => updateRow(index, 'remarks', e.target.value)}
                      className="w-32"
                      placeholder="Notes"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRow(index)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {tableData.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p>No data entries yet. Click "Add Row" to start adding cleaning data.</p>
          </div>
        )}

        <div className="p-4 border-t">
          <Button className="bg-[hsl(var(--verdo-jade))] hover:bg-[hsl(var(--verdo-jade-light))]">
            <Save className="mr-2 h-4 w-4" />
            Save Cleaning Data
          </Button>
        </div>
      </div>
    </div>
  );
};
