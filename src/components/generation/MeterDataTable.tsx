
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site } from '@/types/generation';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { TableHeader } from './TableHeader';
import { MobileCard } from './MobileCard';
import { EmptyState } from './EmptyState';
import { Search } from 'lucide-react';

interface MeterDataTableProps {
  site: Site | null;
  selectedDate: Date;
}

interface MeterRow {
  meter: string;
  type: 'Export' | 'Import';
  value: number | '';
}

export const MeterDataTable: React.FC<MeterDataTableProps> = ({ site, selectedDate }) => {
  const [meterData, setMeterData] = useState<MeterRow[]>([]);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (site?.meterConfig) {
      const rows: MeterRow[] = [];
      site.meterConfig.meterNames.forEach(meterName => {
        rows.push(
          { meter: meterName, type: 'Export', value: '' },
          { meter: meterName, type: 'Import', value: '' }
        );
      });
      setMeterData(rows);
    }
  }, [site]);

  // Filter meter data based on search term
  const filteredMeterData = useMemo(() => {
    if (!searchTerm.trim()) return meterData;
    
    return meterData.filter(row => 
      row.meter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [meterData, searchTerm]);

  if (!site || !site.meterConfig) {
    return <EmptyState message="Select a site to begin meter data entry" />;
  }

  const handleValueChange = (index: number, value: string) => {
    const newData = [...meterData];
    newData[index].value = value === '' ? '' : Number(value);
    setMeterData(newData);
    
    if (errors[index]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<number, string> = {};
    
    meterData.forEach((row, index) => {
      if (row.value === '' || row.value === 0) {
        newErrors[index] = 'Value is required';
      } else if (isNaN(Number(row.value))) {
        newErrors[index] = 'Must be a valid number';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    const formattedData: Record<string, any> = {
      date: format(selectedDate, 'yyyy-MM-dd')
    };

    meterData.forEach(row => {
      const key = `${row.meter.toLowerCase().replace(' ', '')}${row.type}`;
      formattedData[key] = row.value;
    });

    console.log('Saving meter data:', {
      siteId: site.id,
      tabType: 'meter-data',
      date: format(selectedDate, 'yyyy-MM-dd'),
      values: formattedData
    });

    toast({
      title: "Data Saved",
      description: `Meter data for ${format(selectedDate, 'PPP')} has been saved successfully.`,
    });

    const clearedData = meterData.map(row => ({ ...row, value: '' as const }));
    setMeterData(clearedData);
  };

  const handlePasteFromExcel = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim());
    
    const newMeterData = [...meterData];
    rows.forEach((row, index) => {
      const values = row.split('\t');
      if (values.length >= 3 && index < newMeterData.length) {
        newMeterData[index].value = Number(values[2]) || '';
      }
    });
    
    setMeterData(newMeterData);
    
    toast({
      title: "Data Pasted",
      description: "Excel data has been pasted into the meter table.",
    });
  };

  // Group filtered meter data by meter name for mobile cards
  const groupedData = filteredMeterData.reduce((acc, row, originalIndex) => {
    // Find the original index in the unfiltered data
    const actualIndex = meterData.findIndex(
      (originalRow, idx) => originalRow.meter === row.meter && originalRow.type === row.type && idx >= originalIndex
    );
    
    if (!acc[row.meter]) {
      acc[row.meter] = [];
    }
    acc[row.meter].push({ ...row, index: actualIndex });
    return acc;
  }, {} as Record<string, Array<MeterRow & { index: number }>>);

  if (isMobile) {
    return (
      <div className="bg-white rounded-lg border overflow-hidden">
        <TableHeader 
          title="Data Entry - Meter Data"
          selectedDate={selectedDate}
          onSave={handleSave}
        />
        
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search meters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="p-4 space-y-4" onPaste={handlePasteFromExcel} tabIndex={0}>
          {Object.entries(groupedData).map(([meterName, rows]) => (
            <MobileCard
              key={meterName}
              title={meterName}
              fields={rows.map(row => ({
                label: `${row.type} *`,
                value: row.value,
                onChange: (value) => handleValueChange(row.index, value),
                error: errors[row.index],
                type: 'number',
                placeholder: '0.00'
              }))}
            />
          ))}
          {filteredMeterData.length === 0 && searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              No meters found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <TableHeader 
        title="Data Entry - Meter Data"
        selectedDate={selectedDate}
        onSave={handleSave}
      />
      
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search meters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full" onPaste={handlePasteFromExcel} tabIndex={0}>
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0">
              <tr className="bg-verdo-navy text-white">
                <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                  Meter
                </th>
                <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                  Type
                </th>
                <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                  Value <span className="text-red-300 ml-1">*</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMeterData.map((row, displayIndex) => {
                // Find the original index for this row
                const originalIndex = meterData.findIndex(
                  (originalRow, idx) => 
                    originalRow.meter === row.meter && 
                    originalRow.type === row.type && 
                    idx >= (displayIndex === 0 ? 0 : meterData.findIndex(r => r === filteredMeterData[displayIndex - 1]) + 1)
                );
                
                return (
                  <tr key={`${row.meter}-${row.type}-${originalIndex}`} className="hover:bg-muted/20">
                    <td className="px-3 py-2 border border-gray-300">
                      <div className="text-sm py-1 px-2 bg-muted/50 rounded">
                        {row.meter}
                      </div>
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <div className="text-sm py-1 px-2 bg-muted/50 rounded">
                        {row.type}
                      </div>
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <div className="space-y-1">
                        <Input
                          type="number"
                          value={row.value}
                          onChange={(e) => handleValueChange(originalIndex, e.target.value)}
                          className={cn(
                            "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                            errors[originalIndex] && "border-destructive focus:border-destructive"
                          )}
                          placeholder="0.00"
                          step="0.01"
                        />
                        {errors[originalIndex] && (
                          <p className="text-xs text-destructive">{errors[originalIndex]}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredMeterData.length === 0 && searchTerm && (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">
                    No meters found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
