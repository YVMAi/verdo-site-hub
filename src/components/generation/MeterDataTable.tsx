
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
import { Search, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface MeterDataTableProps {
  site: Site | null;
  selectedDate: Date;
}

interface MeterFormRow {
  id: string;
  meter: string;
  exportValue: string;
  importValue: string;
  remarks: string;
}

export const MeterDataTable: React.FC<MeterDataTableProps> = ({ site, selectedDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'form' | 'table'>('form');
  const [formRows, setFormRows] = useState<MeterFormRow[]>([
    {
      id: '1',
      meter: '',
      exportValue: '',
      importValue: '',
      remarks: ''
    }
  ]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (site?.meterConfig && formRows.length === 1 && !formRows[0].meter) {
      // Initialize with first meter if available
      const firstMeter = site.meterConfig.meterNames[0];
      if (firstMeter) {
        setFormRows([{
          id: '1',
          meter: firstMeter,
          exportValue: '',
          importValue: '',
          remarks: ''
        }]);
      }
    }
  }, [site, formRows]);

  // Legacy meter data state for table view
  const [meterData, setMeterData] = useState<Array<{meter: string; type: 'Export' | 'Import'; value: number | ''}>>([]);
  const [errors, setErrors] = useState<Record<number, string>>({});

  React.useEffect(() => {
    if (site?.meterConfig) {
      const rows: Array<{meter: string; type: 'Export' | 'Import'; value: number | ''}> = [];
      site.meterConfig.meterNames.forEach(meterName => {
        rows.push(
          { meter: meterName, type: 'Export', value: '' },
          { meter: meterName, type: 'Import', value: '' }
        );
      });
      setMeterData(rows);
    }
  }, [site]);

  // Filter meter data based on search term for table view
  const filteredMeterData = useMemo(() => {
    if (!searchTerm.trim()) return meterData;
    
    return meterData.filter(row => 
      row.meter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [meterData, searchTerm]);

  // Filter form rows based on search term
  const filteredFormRows = useMemo(() => {
    if (!searchTerm.trim()) return formRows;
    
    return formRows.filter(row => 
      row.meter.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [formRows, searchTerm]);

  if (!site || !site.meterConfig) {
    return <EmptyState message="Select a site to begin meter data entry" />;
  }

  const updateFormRow = (id: string, field: keyof MeterFormRow, value: string) => {
    setFormRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const addFormRow = () => {
    const newRow: MeterFormRow = {
      id: Date.now().toString(),
      meter: '',
      exportValue: '',
      importValue: '',
      remarks: ''
    };
    setFormRows(prev => [...prev, newRow]);
  };

  const removeFormRow = (id: string) => {
    if (formRows.length > 1) {
      setFormRows(prev => prev.filter(row => row.id !== id));
    }
  };

  // Legacy functions for table view
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
    if (viewMode === 'form') {
      return formRows.every(row => row.meter && row.exportValue && row.importValue);
    } else {
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
    }
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

    if (viewMode === 'form') {
      console.log('Saving meter form data:', {
        siteId: site.id,
        tabType: 'meter-data',
        date: format(selectedDate, 'yyyy-MM-dd'),
        formRows: formRows
      });
    } else {
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
    }

    toast({
      title: "Data Saved",
      description: `Meter data for ${format(selectedDate, 'PPP')} has been saved successfully.`,
    });

    if (viewMode === 'form') {
      setFormRows([{
        id: Date.now().toString(),
        meter: '',
        exportValue: '',
        importValue: '',
        remarks: ''
      }]);
    } else {
      const clearedData = meterData.map(row => ({ ...row, value: '' as const }));
      setMeterData(clearedData);
    }
  };

  const handlePasteFromExcel = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim());
    
    if (viewMode === 'form') {
      // Handle paste for form view
      const newFormRows = [...formRows];
      rows.forEach((row, index) => {
        const values = row.split('\t');
        if (values.length >= 3 && index < newFormRows.length) {
          newFormRows[index].exportValue = values[1] || '';
          newFormRows[index].importValue = values[2] || '';
        }
      });
      setFormRows(newFormRows);
    } else {
      // Handle paste for table view
      const newMeterData = [...meterData];
      rows.forEach((row, index) => {
        const values = row.split('\t');
        if (values.length >= 3 && index < newMeterData.length) {
          newMeterData[index].value = Number(values[2]) || '';
        }
      });
      setMeterData(newMeterData);
    }
    
    toast({
      title: "Data Pasted",
      description: "Excel data has been pasted into the meter table.",
    });
  };

  // Group filtered meter data by meter name for mobile cards
  const groupedData = filteredMeterData.reduce((acc, row, originalIndex) => {
    const actualIndex = meterData.findIndex(
      (originalRow, idx) => originalRow.meter === row.meter && originalRow.type === row.type && idx >= originalIndex
    );
    
    if (!acc[row.meter]) {
      acc[row.meter] = [];
    }
    acc[row.meter].push({ ...row, index: actualIndex });
    return acc;
  }, {} as Record<string, Array<typeof filteredMeterData[0] & { index: number }>>);

  // Get unique meter names for table view
  const uniqueMeters = [...new Set(meterData.map(row => row.meter))];

  // Get value for specific meter and type
  const getValue = (meterName: string, type: 'Export' | 'Import') => {
    const row = meterData.find(r => r.meter === meterName && r.type === type);
    return row ? row.value : '';
  };

  // Get error for specific meter and type
  const getError = (meterName: string, type: 'Export' | 'Import') => {
    const index = meterData.findIndex(r => r.meter === meterName && r.type === type);
    return index !== -1 ? errors[index] : '';
  };

  // Handle value change for specific meter and type
  const handleTableValueChange = (meterName: string, type: 'Export' | 'Import', value: string) => {
    const index = meterData.findIndex(r => r.meter === meterName && r.type === type);
    if (index !== -1) {
      handleValueChange(index, value);
    }
  };

  if (isMobile) {
    return (
      <div className="bg-white rounded-lg border overflow-hidden">
        <TableHeader 
          title="Data Entry - Meter Data"
          selectedDate={selectedDate}
          onSave={handleSave}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
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
          {viewMode === 'form' ? (
            <>
              {filteredFormRows.map((row) => (
                <div key={row.id} className="border rounded-lg p-4 space-y-3">
                  <div className="font-medium text-sm">Meter Entry</div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Meter</label>
                      <Input
                        value={row.meter}
                        onChange={(e) => updateFormRow(row.id, 'meter', e.target.value)}
                        placeholder="Enter meter name..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Export Value</label>
                      <Input
                        type="number"
                        value={row.exportValue}
                        onChange={(e) => updateFormRow(row.id, 'exportValue', e.target.value)}
                        placeholder="0.00"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Import Value</label>
                      <Input
                        type="number"
                        value={row.importValue}
                        onChange={(e) => updateFormRow(row.id, 'importValue', e.target.value)}
                        placeholder="0.00"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Remarks</label>
                      <Input
                        value={row.remarks}
                        onChange={(e) => updateFormRow(row.id, 'remarks', e.target.value)}
                        placeholder="Enter remarks..."
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
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
            </>
          )}
          {(viewMode === 'form' ? filteredFormRows : Object.keys(groupedData)).length === 0 && searchTerm && (
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={true}
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
          {viewMode === 'form' ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-verdo-navy text-white">
                <div className="grid grid-cols-6 gap-0 text-sm font-medium">
                  <div className="px-4 py-3 border-r border-white/20">Meter</div>
                  <div className="px-4 py-3 border-r border-white/20">Export Value</div>
                  <div className="px-4 py-3 border-r border-white/20">Import Value</div>
                  <div className="px-4 py-3 border-r border-white/20">Remarks</div>
                  <div className="px-4 py-3 border-r border-white/20">Actions</div>
                </div>
              </div>

              <div className="divide-y">
                {filteredFormRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-6 gap-0 items-center">
                    <div className="px-2 py-2 border-r">
                      <Select value={row.meter} onValueChange={(value) => updateFormRow(row.id, 'meter', value)}>
                        <SelectTrigger className="h-8 border-0 shadow-none">
                          <SelectValue placeholder="Select Meter" />
                        </SelectTrigger>
                        <SelectContent>
                          {site.meterConfig.meterNames.map(meter => (
                            <SelectItem key={meter} value={meter}>
                              {meter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="px-2 py-2 border-r">
                      <Input
                        type="number"
                        value={row.exportValue}
                        onChange={(e) => updateFormRow(row.id, 'exportValue', e.target.value)}
                        className="h-8 border-0 shadow-none"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="px-2 py-2 border-r">
                      <Input
                        type="number"
                        value={row.importValue}
                        onChange={(e) => updateFormRow(row.id, 'importValue', e.target.value)}
                        className="h-8 border-0 shadow-none"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="px-2 py-2 border-r">
                      <Input
                        value={row.remarks}
                        onChange={(e) => updateFormRow(row.id, 'remarks', e.target.value)}
                        placeholder="Enter remarks..."
                        className="h-8 border-0 shadow-none"
                      />
                    </div>
                    
                    <div className="px-2 py-2 flex items-center justify-center gap-1">
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFormRow(row.id)}
                          disabled={formRows.length === 1}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-gray-600">Delete</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={addFormRow}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-gray-600">Add</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-verdo-navy text-white">
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[80px] text-sm">
                    Field
                  </th>
                  {uniqueMeters.map((meter) => (
                    <th key={meter} colSpan={2} className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[200px] text-sm">
                      {meter}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[100px] text-sm">
                    Remarks
                  </th>
                </tr>
                <tr className="bg-verdo-navy text-white">
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 text-sm">
                    Meter
                  </th>
                  {uniqueMeters.map((meter) => (
                    <React.Fragment key={meter}>
                      <th className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[100px] text-sm">
                        Export
                      </th>
                      <th className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[100px] text-sm">
                        Import
                      </th>
                    </React.Fragment>
                  ))}
                  <th className="px-3 py-2 text-center font-medium border border-gray-300 text-sm">
                    {/* Empty for remarks */}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-muted/20">
                  <td className="px-3 py-2 border border-gray-300 font-medium bg-muted/30">
                    Meter
                  </td>
                  {uniqueMeters.map((meter) => (
                    <React.Fragment key={meter}>
                      <td className="px-3 py-2 border border-gray-300">
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={getValue(meter, 'Export')}
                            onChange={(e) => handleTableValueChange(meter, 'Export', e.target.value)}
                            className={cn(
                              "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                              getError(meter, 'Export') && "border-destructive focus:border-destructive"
                            )}
                            placeholder="0.00"
                            step="0.01"
                          />
                          {getError(meter, 'Export') && (
                            <p className="text-xs text-destructive">{getError(meter, 'Export')}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={getValue(meter, 'Import')}
                            onChange={(e) => handleTableValueChange(meter, 'Import', e.target.value)}
                            className={cn(
                              "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                              getError(meter, 'Import') && "border-destructive focus:border-destructive"
                            )}
                            placeholder="0.00"
                            step="0.01"
                          />
                          {getError(meter, 'Import') && (
                            <p className="text-xs text-destructive">{getError(meter, 'Import')}</p>
                          )}
                        </div>
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="px-3 py-2 border border-gray-300">
                    <Input
                      type="text"
                      className="h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring"
                      placeholder="Add remarks..."
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
