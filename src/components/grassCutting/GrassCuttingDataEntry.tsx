import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site } from '@/types/generation';
import { mockBlocks, mockInverters, mockGrassCuttingData } from '@/data/mockGrassCuttingData';
import { useToast } from '@/hooks/use-toast';

interface GrassCuttingDataEntryProps {
  site: Site | null;
}

interface DailyInputs {
  [blockId: string]: {
    [inverterId: string]: {
      value: number;
      remarks: string;
    };
  };
}

export const GrassCuttingDataEntry: React.FC<GrassCuttingDataEntryProps> = ({ site }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyInputs, setDailyInputs] = useState<DailyInputs>({});
  const { toast } = useToast();

  const availableBlocks = useMemo(() => {
    return site ? mockBlocks.filter(block => block.siteId === site.id) : [];
  }, [site]);

  const siteData = useMemo(() => {
    if (!site) return [];
    return mockGrassCuttingData.filter(data => 
      availableBlocks.some(block => block.id === data.blockId)
    );
  }, [site, availableBlocks]);

  // Calculate updated grass cutting done and % completed based on daily inputs
  const getUpdatedGrassCuttingDone = (blockId: string, inverterId: string, originalDone: number) => {
    const dailyInput = getDailyInput(blockId, inverterId, 'value') as number;
    return originalDone + dailyInput;
  };

  const getCalculatedPercentCompleted = (blockId: string, inverterId: string, totalStrings: number, originalDone: number) => {
    const updatedDone = getUpdatedGrassCuttingDone(blockId, inverterId, originalDone);
    return totalStrings > 0 ? Math.round((updatedDone / totalStrings) * 100) : 0;
  };

  const handleDailyInputChange = (blockId: string, inverterId: string, field: 'value' | 'remarks', newValue: string | number) => {
    setDailyInputs(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        [inverterId]: {
          ...prev[blockId]?.[inverterId],
          [field]: newValue
        }
      }
    }));
  };

  const getDailyInput = (blockId: string, inverterId: string, field: 'value' | 'remarks') => {
    return dailyInputs[blockId]?.[inverterId]?.[field] || (field === 'value' ? 0 : '');
  };

  const handleSave = () => {
    const hasData = Object.values(dailyInputs).some(block => 
      Object.values(block).some(inverter => inverter.value > 0)
    );

    if (!hasData) {
      toast({
        title: "No Data Entered",
        description: "Please enter grass cutting data before saving.",
        variant: "destructive",
      });
      return;
    }

    console.log('Saving grass cutting data:', { date: selectedDate, inputs: dailyInputs });
    
    toast({
      title: "Data Saved",
      description: `Grass cutting data for ${format(selectedDate, 'PPP')} has been saved successfully.`,
    });

    // Reset inputs
    setDailyInputs({});
  };

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
        <h3 className="font-semibold text-sm sm:text-base">Enter Grass Cutting Data</h3>
      </div>
      
      <div className="p-4 sm:p-6 space-y-6">
        {/* Date Selector */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="text-sm font-medium">Date:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date > new Date()}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Excel-style Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full border-collapse">
              {/* Header Row 1: Block Names */}
              <thead>
                <tr>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold w-24"></th>
                  {siteData.map((blockData) => (
                    <th 
                      key={blockData.blockId}
                      className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold text-center"
                      colSpan={blockData.inverters.length}
                    >
                      {blockData.blockName}
                    </th>
                  ))}
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold w-32">Remarks</th>
                </tr>
                
                {/* Header Row 2: Inverter Names */}
                <tr>
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold">Inverter</th>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <th 
                        key={inverter.inverterId}
                        className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold text-center w-20"
                      >
                        {inverter.inverterName}
                      </th>
                    ))
                  )}
                  <th className="bg-[#001f3f] text-white p-2 border border-gray-300 text-xs font-semibold"></th>
                </tr>
              </thead>

              <tbody>
                {/* Total Strings Row - Status Field */}
                <tr className="bg-blue-50">
                  <td className="p-2 border border-gray-300 text-xs font-medium bg-blue-100">Total Strings</td>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <td key={`total-${inverter.inverterId}`} className="p-2 border border-gray-300 text-xs text-center bg-blue-50">
                        {inverter.totalStrings}
                      </td>
                    ))
                  )}
                  <td className="p-2 border border-gray-300 bg-blue-50"></td>
                </tr>

                {/* Grass Cutting Done Row - Status Field */}
                <tr className="bg-blue-50">
                  <td className="p-2 border border-gray-300 text-xs font-medium bg-blue-100">Grass Cutting Done</td>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <td key={`done-${inverter.inverterId}`} className="p-2 border border-gray-300 text-xs text-center font-medium bg-blue-50">
                        {getUpdatedGrassCuttingDone(blockData.blockId, inverter.inverterId, inverter.grassCuttingDone)}
                      </td>
                    ))
                  )}
                  <td className="p-2 border border-gray-300 bg-blue-50"></td>
                </tr>

                {/* % Completed Row - Calculated Field */}
                <tr className="bg-green-50">
                  <td className="p-2 border border-gray-300 text-xs font-medium bg-green-100">% Completed</td>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <td key={`percent-${inverter.inverterId}`} className="p-2 border border-gray-300 text-xs text-center font-medium bg-green-50">
                        {getCalculatedPercentCompleted(blockData.blockId, inverter.inverterId, inverter.totalStrings, inverter.grassCuttingDone)}%
                      </td>
                    ))
                  )}
                  <td className="p-2 border border-gray-300 bg-green-50"></td>
                </tr>

                {/* Input Row - Input Field */}
                <tr className="bg-yellow-50">
                  <td className="p-1 border border-gray-300 text-xs font-medium flex items-center bg-yellow-100">
                    <Input
                      type="text"
                      value={format(selectedDate, 'dd-MMM-yy')}
                      readOnly
                      className="h-8 text-xs border-0 bg-transparent"
                    />
                  </td>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <td key={`input-${inverter.inverterId}`} className="p-1 border border-gray-300 bg-yellow-50">
                        <Input
                          type="number"
                          min="0"
                          value={getDailyInput(blockData.blockId, inverter.inverterId, 'value') || ''}
                          onChange={(e) => handleDailyInputChange(
                            blockData.blockId, 
                            inverter.inverterId, 
                            'value', 
                            parseInt(e.target.value) || 0
                          )}
                          className="h-8 text-xs text-center border-0 bg-yellow-50"
                          placeholder="0"
                        />
                      </td>
                    ))
                  )}
                  <td className="p-1 border border-gray-300 bg-yellow-50">
                    <Textarea
                      value={getDailyInput(siteData[0]?.blockId || '', siteData[0]?.inverters[0]?.inverterId || '', 'remarks') as string}
                      onChange={(e) => {
                        if (siteData[0]?.blockId && siteData[0]?.inverters[0]?.inverterId) {
                          handleDailyInputChange(siteData[0].blockId, siteData[0].inverters[0].inverterId, 'remarks', e.target.value);
                        }
                      }}
                      className="h-8 text-xs resize-none border-0 bg-yellow-50"
                      placeholder="Enter remarks..."
                      rows={1}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Field Types Legend:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-xs text-gray-600">Status Fields (Read-only)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-xs text-gray-600">Calculated Fields (Auto-computed)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span className="text-xs text-gray-600">Input Fields (Editable)</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-[#001f3f] hover:bg-[#001f3f]/90 text-sm">
            <Save className="h-4 w-4 mr-2" />
            Save Entry
          </Button>
        </div>
      </div>
    </div>
  );
};