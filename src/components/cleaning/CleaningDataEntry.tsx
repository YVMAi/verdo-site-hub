
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
            <div className="text-sm">Excel-style Data Entry</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {Object.entries(mockSiteConfig.blocks).map(([blockName, blockConfig]) => (
            <div key={blockName} className="border-b last:border-b-0">
              {/* Block Header */}
              <div className="bg-amber-200 border-b">
                <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(80px,1fr))_200px_100px_100px_100px_100px_150px] gap-px">
                  <div className="p-3 font-semibold text-center bg-amber-300">Block</div>
                  {blockConfig.inverters.map((inverter) => (
                    <div key={inverter} className="p-3 font-semibold text-center bg-amber-200 text-sm">
                      {inverter}
                    </div>
                  ))}
                  <div className="p-3 font-semibold text-center bg-amber-300 text-sm">Planned Modules</div>
                  <div className="p-3 font-semibold text-center bg-amber-300 text-sm">Total Cleaned</div>
                  <div className="p-3 font-semibold text-center bg-amber-300 text-sm">Uncleaned Modules</div>
                  <div className="p-3 font-semibold text-center bg-amber-300 text-sm">Rainfall (mm)</div>
                  <div className="p-3 font-semibold text-center bg-amber-300 text-sm">Water Consumption</div>
                  <div className="p-3 font-semibold text-center bg-amber-300 text-sm">Remarks</div>
                </div>
              </div>

              {/* Block Name Row */}
              <div className="bg-orange-100">
                <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(80px,1fr))_200px_100px_100px_100px_100px_150px] gap-px">
                  <div className="p-3 font-bold text-center bg-orange-200">{blockName}</div>
                  {blockConfig.inverters.map((inverter) => (
                    <div key={inverter} className="p-2 bg-orange-100"></div>
                  ))}
                  <div className="p-3 font-bold text-center bg-orange-200">{blockConfig.dailyPlannedModules}</div>
                  <div className="p-3 font-bold text-center bg-orange-200">
                    {tableData
                      .filter(row => row.block === blockName)
                      .reduce((sum, row) => sum + (row.modulesCleaned || 0), 0)}
                  </div>
                  <div className="p-3 font-bold text-center bg-orange-200">
                    {blockConfig.dailyPlannedModules - tableData
                      .filter(row => row.block === blockName)
                      .reduce((sum, row) => sum + (row.modulesCleaned || 0), 0)}
                  </div>
                  <div className="p-3 font-bold text-center bg-orange-200">
                    <Input
                      type="number"
                      step="0.1"
                      value={rainfall || ''}
                      onChange={(e) => setRainfall(e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="0.0"
                      className="w-full text-center"
                    />
                  </div>
                  <div className="p-3 font-bold text-center bg-orange-200">
                    {cleaningType === 'Wet' ? 
                      tableData
                        .filter(row => row.block === blockName)
                        .reduce((sum, row) => sum + (row.waterConsumption || 0), 0) + 'L'
                      : 'N/A'
                    }
                  </div>
                  <div className="p-2 bg-orange-200"></div>
                </div>
              </div>

              {/* Total Number of Modules Row */}
              <div className="bg-gray-50">
                <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(80px,1fr))_200px_100px_100px_100px_100px_150px] gap-px">
                  <div className="p-3 font-medium text-sm bg-gray-100">Total Number of Modules</div>
                  {blockConfig.inverters.map((inverter) => (
                    <div key={inverter} className="p-3 text-center font-medium text-sm bg-gray-50">
                      {Math.floor(blockConfig.totalModules / blockConfig.inverters.length)}
                    </div>
                  ))}
                  <div className="p-3 text-center font-medium text-sm bg-gray-100">{blockConfig.totalModules}</div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                </div>
              </div>

              {/* Total Modules Cleaned Row */}
              <div className="bg-white">
                <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(80px,1fr))_200px_100px_100px_100px_100px_150px] gap-px">
                  <div className="p-3 font-medium text-sm bg-gray-100">Total Modules Cleaned</div>
                  {blockConfig.inverters.map((inverter) => {
                    const existingRow = tableData.find(row => row.block === blockName && row.inverter === inverter);
                    return (
                      <div key={inverter} className="p-2 bg-white">
                        <Input
                          type="number"
                          value={existingRow?.modulesCleaned || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (existingRow) {
                              const index = tableData.findIndex(row => row.block === blockName && row.inverter === inverter);
                              updateRow(index, 'modulesCleaned', value);
                            } else {
                              const newRow = calculateRowData({
                                block: blockName,
                                inverter,
                                scbNumber: '',
                                stringTableNumber: '',
                                modulesCleaned: value,
                                waterConsumption: 0,
                                remarks: '',
                              });
                              setTableData([...tableData, newRow]);
                            }
                          }}
                          placeholder="0"
                          className="w-full text-center"
                        />
                      </div>
                    );
                  })}
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                </div>
              </div>

              {/* SCB Number Row */}
              <div className="bg-green-50">
                <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(80px,1fr))_200px_100px_100px_100px_100px_150px] gap-px">
                  <div className="p-3 font-medium text-sm bg-green-100">SCB Number</div>
                  {blockConfig.inverters.map((inverter) => {
                    const existingRow = tableData.find(row => row.block === blockName && row.inverter === inverter);
                    return (
                      <div key={inverter} className="p-2 bg-green-50">
                        <Input
                          value={existingRow?.scbNumber || ''}
                          onChange={(e) => {
                            if (existingRow) {
                              const index = tableData.findIndex(row => row.block === blockName && row.inverter === inverter);
                              updateRow(index, 'scbNumber', e.target.value);
                            } else {
                              const newRow = calculateRowData({
                                block: blockName,
                                inverter,
                                scbNumber: e.target.value,
                                stringTableNumber: '',
                                modulesCleaned: 0,
                                waterConsumption: 0,
                                remarks: '',
                              });
                              setTableData([...tableData, newRow]);
                            }
                          }}
                          placeholder="SCB"
                          className="w-full text-center"
                        />
                      </div>
                    );
                  })}
                  <div className="p-3 bg-green-100"></div>
                  <div className="p-3 bg-green-100"></div>
                  <div className="p-3 bg-green-100"></div>
                  <div className="p-3 bg-green-100"></div>
                  <div className="p-3 bg-green-100"></div>
                  <div className="p-3 bg-green-100"></div>
                </div>
              </div>

              {/* String Table Number Row */}
              <div className="bg-white">
                <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(80px,1fr))_200px_100px_100px_100px_100px_150px] gap-px">
                  <div className="p-3 font-medium text-sm bg-gray-100">String Table Number</div>
                  {blockConfig.inverters.map((inverter) => {
                    const existingRow = tableData.find(row => row.block === blockName && row.inverter === inverter);
                    return (
                      <div key={inverter} className="p-2 bg-white">
                        <Input
                          value={existingRow?.stringTableNumber || ''}
                          onChange={(e) => {
                            if (existingRow) {
                              const index = tableData.findIndex(row => row.block === blockName && row.inverter === inverter);
                              updateRow(index, 'stringTableNumber', e.target.value);
                            } else {
                              const newRow = calculateRowData({
                                block: blockName,
                                inverter,
                                scbNumber: '',
                                stringTableNumber: e.target.value,
                                modulesCleaned: 0,
                                waterConsumption: 0,
                                remarks: '',
                              });
                              setTableData([...tableData, newRow]);
                            }
                          }}
                          placeholder="ST"
                          className="w-full text-center"
                        />
                      </div>
                    );
                  })}
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                  <div className="p-3 bg-gray-100"></div>
                </div>
              </div>

              {/* Water Consumption Row (only for Wet cleaning) */}
              {cleaningType === 'Wet' && (
                <div className="bg-blue-50">
                  <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(80px,1fr))_200px_100px_100px_100px_100px_150px] gap-px">
                    <div className="p-3 font-medium text-sm bg-blue-100">Water Consumption (L)</div>
                    {blockConfig.inverters.map((inverter) => {
                      const existingRow = tableData.find(row => row.block === blockName && row.inverter === inverter);
                      return (
                        <div key={inverter} className="p-2 bg-blue-50">
                          <Input
                            type="number"
                            value={existingRow?.waterConsumption || ''}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              if (existingRow) {
                                const index = tableData.findIndex(row => row.block === blockName && row.inverter === inverter);
                                updateRow(index, 'waterConsumption', value);
                              } else {
                                const newRow = calculateRowData({
                                  block: blockName,
                                  inverter,
                                  scbNumber: '',
                                  stringTableNumber: '',
                                  modulesCleaned: 0,
                                  waterConsumption: value,
                                  remarks: '',
                                });
                                setTableData([...tableData, newRow]);
                              }
                            }}
                            placeholder="0"
                            className="w-full text-center"
                          />
                        </div>
                      );
                    })}
                    <div className="p-3 bg-blue-100"></div>
                    <div className="p-3 bg-blue-100"></div>
                    <div className="p-3 bg-blue-100"></div>
                    <div className="p-3 bg-blue-100"></div>
                    <div className="p-3 bg-blue-100"></div>
                    <div className="p-3 bg-blue-100"></div>
                  </div>
                </div>
              )}

              {/* Remarks Row */}
              <div className="bg-yellow-50">
                <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(80px,1fr))_200px_100px_100px_100px_100px_150px] gap-px">
                  <div className="p-3 font-medium text-sm bg-yellow-100">Remarks</div>
                  {blockConfig.inverters.map((inverter) => {
                    const existingRow = tableData.find(row => row.block === blockName && row.inverter === inverter);
                    return (
                      <div key={inverter} className="p-2 bg-yellow-50">
                        <Input
                          value={existingRow?.remarks || ''}
                          onChange={(e) => {
                            if (existingRow) {
                              const index = tableData.findIndex(row => row.block === blockName && row.inverter === inverter);
                              updateRow(index, 'remarks', e.target.value);
                            } else {
                              const newRow = calculateRowData({
                                block: blockName,
                                inverter,
                                scbNumber: '',
                                stringTableNumber: '',
                                modulesCleaned: 0,
                                waterConsumption: 0,
                                remarks: e.target.value,
                              });
                              setTableData([...tableData, newRow]);
                            }
                          }}
                          placeholder="Notes"
                          className="w-full text-center text-xs"
                        />
                      </div>
                    );
                  })}
                  <div className="p-3 bg-yellow-100"></div>
                  <div className="p-3 bg-yellow-100"></div>
                  <div className="p-3 bg-yellow-100"></div>
                  <div className="p-3 bg-yellow-100"></div>
                  <div className="p-3 bg-yellow-100"></div>
                  <div className="p-2 bg-yellow-50">
                    <Textarea
                      value={globalRemarks}
                      onChange={(e) => setGlobalRemarks(e.target.value)}
                      placeholder="General remarks..."
                      className="w-full text-xs min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
