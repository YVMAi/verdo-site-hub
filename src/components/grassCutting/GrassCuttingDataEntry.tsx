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
                {/* Total Strings Row */}
                <tr className="bg-gray-50">
                  <td className="p-2 border border-gray-300 text-xs font-medium">Total Strings</td>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <td key={`total-${inverter.inverterId}`} className="p-2 border border-gray-300 text-xs text-center">
                        {inverter.totalStrings}
                      </td>
                    ))
                  )}
                  <td className="p-2 border border-gray-300"></td>
                </tr>

                {/* Grass Cutting Done Row */}
                <tr className="bg-white">
                  <td className="p-2 border border-gray-300 text-xs font-medium">Grass Cutting Done</td>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <td key={`done-${inverter.inverterId}`} className="p-2 border border-gray-300 text-xs text-center">
                        {inverter.grassCuttingDone}
                      </td>
                    ))
                  )}
                  <td className="p-2 border border-gray-300"></td>
                </tr>

                {/* % Completed Row */}
                <tr className="bg-gray-50">
                  <td className="p-2 border border-gray-300 text-xs font-medium">% Completed</td>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <td key={`percent-${inverter.inverterId}`} className="p-2 border border-gray-300 text-xs text-center">
                        {inverter.percentCompleted}%
                      </td>
                    ))
                  )}
                  <td className="p-2 border border-gray-300"></td>
                </tr>

                {/* Input Row */}
                <tr className="bg-white">
                  <td className="p-1 border border-gray-300 text-xs font-medium flex items-center">
                    <Input
                      type="text"
                      value={format(selectedDate, 'dd-MMM-yy')}
                      readOnly
                      className="h-8 text-xs border-0 bg-transparent"
                    />
                  </td>
                  {siteData.map((blockData) =>
                    blockData.inverters.map((inverter) => (
                      <td key={`input-${inverter.inverterId}`} className="p-1 border border-gray-300">
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
                          className="h-8 text-xs text-center border-0"
                          placeholder="0"
                        />
                      </td>
                    ))
                  )}
                  <td className="p-1 border border-gray-300">
                    <Textarea
                      value={getDailyInput(siteData[0]?.blockId || '', siteData[0]?.inverters[0]?.inverterId || '', 'remarks') as string}
                      onChange={(e) => {
                        if (siteData[0]?.blockId && siteData[0]?.inverters[0]?.inverterId) {
                          handleDailyInputChange(siteData[0].blockId, siteData[0].inverters[0].inverterId, 'remarks', e.target.value);
                        }
                      }}
                      className="h-8 text-xs resize-none border-0"
                      placeholder="Enter remarks..."
                      rows={1}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
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