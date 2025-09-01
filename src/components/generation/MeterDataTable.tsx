import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site } from '@/types/generation';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { TableHeader } from './TableHeader';
import { MobileCard } from './MobileCard';
import { EmptyState } from './EmptyState';
import { Search, Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MeterDataTableProps {
  site: Site | null;
  selectedDate: Date;
}

interface MeterFormRow {
  id: string;
  meter: string;
  export: string;
  import: string;
  remarks: string;
}

export const MeterDataTable: React.FC<MeterDataTableProps> = ({ site, selectedDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'form' | 'table'>('form');
  const [formRows, setFormRows] = useState<MeterFormRow[]>([
    {
      id: '1',
      meter: '',
      export: '',
      import: '',
      remarks: ''
    }
  ]);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Legacy form data for table view
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!site) {
    return <EmptyState message="Select a site to begin data entry" />;
  }

  const meters = site.meterConfig?.meterNames || ['Meter 1'];

  React.useEffect(() => {
    if (meters.length > 0 && formRows.length === 1 && !formRows[0].meter) {
      // Initialize with first meter if available
      setFormRows([{
        id: '1',
        meter: meters[0],
        export: '',
        import: '',
        remarks: ''
      }]);
    }
  }, [meters, formRows]);

  // Filter meters based on search term for table view
  const filteredMeters = useMemo(() => {
    if (!searchTerm.trim()) return meters;
    
    return meters.filter(meterName => 
      meterName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [meters, searchTerm]);

  // Filter form rows based on search term
  const filteredFormRows = useMemo(() => {
    if (!searchTerm.trim()) return formRows;
    
    return formRows.filter(row => 
      row.meter.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [formRows, searchTerm]);

  const updateFormRow = (id: string, field: keyof MeterFormRow, value: string) => {
    setFormRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const addFormRow = () => {
    const newRow: MeterFormRow = {
      id: Date.now().toString(),
      meter: '',
      export: '',
      import: '',
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
  const handleInputChange = (meterName: string, field: string, value: any) => {
    const key = `${meterName}_${field}`;
    setFormData(prev => ({ ...prev, [key]: value }));
    
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    if (viewMode === 'form') {
      return formRows.every(row => row.meter && row.export && row.import);
    } else {
      const newErrors: Record<string, string> = {};
      
      meters.forEach(meterName => {
        const exportKey = `${meterName}_export`;
        const importKey = `${meterName}_import`;
        
        if (!formData[exportKey]) {
          newErrors[exportKey] = 'This field is required';
        } else if (isNaN(Number(formData[exportKey]))) {
          newErrors[exportKey] = 'Must be a valid number';
        }
        
        if (!formData[importKey]) {
          newErrors[importKey] = 'This field is required';
        } else if (isNaN(Number(formData[importKey]))) {
          newErrors[importKey] = 'Must be a valid number';
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
      console.log('Saving Meter form data:', {
        siteId: site.id,
        tabType: 'meter',
        date: format(selectedDate, 'yyyy-MM-dd'),
        formRows: formRows
      });
    } else {
      console.log('Saving Meter data:', {
        siteId: site.id,
        tabType: 'meter',
        date: format(selectedDate, 'yyyy-MM-dd'),
        values: formData
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
        export: '',
        import: '',
        remarks: ''
      }]);
    } else {
      setFormData({});
    }
  };

  const handlePasteFromExcel = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n');
    
    if (viewMode === 'form') {
      // Handle paste for form view
      const newFormRows = [...formRows];
      rows.forEach((row, index) => {
        if (index < newFormRows.length && row.trim()) {
          const values = row.split('\t');
          if (values[1]) newFormRows[index].export = values[1];
          if (values[2]) newFormRows[index].import = values[2];
        }
      });
      setFormRows(newFormRows);
    } else {
      // Handle paste for table view
      const newFormData: Record<string, any> = {};
      rows.forEach((row, index) => {
        if (index < meters.length && row.trim()) {
          const values = row.split('\t');
          const meterName = meters[index];
          if (values[1]) newFormData[`${meterName}_export`] = values[1];
          if (values[2]) newFormData[`${meterName}_import`] = values[2];
        }
      });
      setFormData(prev => ({ ...prev, ...newFormData }));
    }
    
    toast({
      title: "Data Pasted",
      description: "Excel data has been pasted into the form.",
    });
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
          {/* Mobile content here */}
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
                <div className="grid grid-cols-5 gap-0 text-sm font-medium">
                  <div className="px-4 py-3 border-r border-white/20">Meter</div>
                  <div className="px-4 py-3 border-r border-white/20">Export</div>
                  <div className="px-4 py-3 border-r border-white/20">Import</div>
                  <div className="px-4 py-3 border-r border-white/20">Remarks</div>
                  <div className="px-4 py-3">Actions</div>
                </div>
              </div>

              <div className="divide-y">
                {filteredFormRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-5 gap-0 items-center">
                    <div className="px-2 py-2 border-r">
                      <Popover open={openDropdowns[`${row.id}-meter`]} onOpenChange={(open) => 
                        setOpenDropdowns(prev => ({ ...prev, [`${row.id}-meter`]: open }))
                      }>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openDropdowns[`${row.id}-meter`]}
                            className="w-full justify-between h-8 border-0 shadow-none"
                          >
                            {row.meter || "Select Meter"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search meters..." />
                            <CommandList>
                              <CommandEmpty>No meter found.</CommandEmpty>
                              <CommandGroup>
                                {meters.map((meter) => (
                                  <CommandItem
                                    key={meter}
                                    value={meter}
                                    onSelect={() => {
                                      updateFormRow(row.id, 'meter', meter);
                                      setOpenDropdowns(prev => ({ ...prev, [`${row.id}-meter`]: false }));
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        row.meter === meter ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {meter}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="px-2 py-2 border-r">
                      <Input
                        type="number"
                        value={row.export}
                        onChange={(e) => updateFormRow(row.id, 'export', e.target.value)}
                        className="h-8 border-0 shadow-none"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="px-2 py-2 border-r">
                      <Input
                        type="number"
                        value={row.import}
                        onChange={(e) => updateFormRow(row.id, 'import', e.target.value)}
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
                  {filteredMeters.map((meterName) => (
                    <th key={meterName} colSpan={2} className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[200px] text-sm">
                      {meterName}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[100px] text-sm">
                    Remarks
                  </th>
                </tr>
                <tr className="bg-verdo-navy text-white">
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 text-sm">
                    Meter Data
                  </th>
                  {filteredMeters.map((meterName) => (
                    <React.Fragment key={meterName}>
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
                    Meter Data
                  </td>
                  {filteredMeters.map((meterName) => (
                    <React.Fragment key={meterName}>
                      <td className="px-3 py-2 border border-gray-300">
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={formData[`${meterName}_export`] || ''}
                            onChange={(e) => handleInputChange(meterName, 'export', e.target.value)}
                            className={cn(
                              "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                              errors[`${meterName}_export`] && "border-destructive focus:border-destructive"
                            )}
                            placeholder="0.00"
                            step="0.01"
                          />
                          {errors[`${meterName}_export`] && (
                            <p className="text-xs text-destructive">{errors[`${meterName}_export`]}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={formData[`${meterName}_import`] || ''}
                            onChange={(e) => handleInputChange(meterName, 'import', e.target.value)}
                            className={cn(
                              "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                              errors[`${meterName}_import`] && "border-destructive focus:border-destructive"
                            )}
                            placeholder="0.00"
                            step="0.01"
                          />
                          {errors[`${meterName}_import`] && (
                            <p className="text-xs text-destructive">{errors[`${meterName}_import`]}</p>
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
