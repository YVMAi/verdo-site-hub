
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

interface InverterDataTableProps {
  site: Site | null;
  selectedDate: Date;
}

interface InverterFormRow {
  id: string;
  block: string;
  inverter: string;
  generation: string;
  remarks: string;
}

export const InverterDataTable: React.FC<InverterDataTableProps> = ({ site, selectedDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'form' | 'table'>('form');
  const [formRows, setFormRows] = useState<InverterFormRow[]>([
    {
      id: '1',
      block: '',
      inverter: '',
      generation: '',
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

  // Extract all inverter names from the blocks structure
  const inverters = useMemo(() => {
    if (!site.inverterConfig?.blocks) return ['Inverter 1'];
    
    const allInverters: string[] = [];
    site.inverterConfig.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        allInverters.push(`${block.blockName}-${inverter}`);
      });
    });
    
    return allInverters.length > 0 ? allInverters : ['Inverter 1'];
  }, [site.inverterConfig]);

  // Extract block names
  const blocks = useMemo(() => {
    if (!site.inverterConfig?.blocks) return [];
    return site.inverterConfig.blocks.map(block => block.blockName);
  }, [site.inverterConfig]);

  // Get inverters for a specific block
  const getInvertersForBlock = (blockName: string) => {
    if (!site.inverterConfig?.blocks) return [];
    const block = site.inverterConfig.blocks.find(b => b.blockName === blockName);
    return block ? block.inverters : [];
  };

  // Filter inverters based on search term for table view
  const filteredInverters = useMemo(() => {
    if (!searchTerm.trim()) return inverters;
    
    return inverters.filter(inverterName => 
      inverterName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inverters, searchTerm]);

  // Filter form rows based on search term
  const filteredFormRows = useMemo(() => {
    if (!searchTerm.trim()) return formRows;
    
    return formRows.filter(row => 
      row.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.inverter.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [formRows, searchTerm]);

  const updateFormRow = (id: string, field: keyof InverterFormRow, value: string) => {
    setFormRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        // Clear inverter selection when block changes
        if (field === 'block') {
          updatedRow.inverter = '';
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const addFormRow = () => {
    const newRow: InverterFormRow = {
      id: Date.now().toString(),
      block: '',
      inverter: '',
      generation: '',
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
  const handleInputChange = (inverterName: string, field: string, value: any) => {
    const key = `${inverterName}_${field}`;
    setFormData(prev => ({ ...prev, [key]: value }));
    
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    if (viewMode === 'form') {
      return formRows.every(row => row.block && row.inverter && row.generation);
    } else {
      const newErrors: Record<string, string> = {};
      
      inverters.forEach(inverterName => {
        const generationKey = `${inverterName}_generation`;
        
        if (!formData[generationKey]) {
          newErrors[generationKey] = 'This field is required';
        } else if (isNaN(Number(formData[generationKey]))) {
          newErrors[generationKey] = 'Must be a valid number';
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
      console.log('Saving Inverter form data:', {
        siteId: site.id,
        tabType: 'inverter',
        date: format(selectedDate, 'yyyy-MM-dd'),
        formRows: formRows
      });
    } else {
      console.log('Saving Inverter data:', {
        siteId: site.id,
        tabType: 'inverter',
        date: format(selectedDate, 'yyyy-MM-dd'),
        values: formData
      });
    }

    toast({
      title: "Data Saved",
      description: `Inverter data for ${format(selectedDate, 'PPP')} has been saved successfully.`,
    });

    if (viewMode === 'form') {
      setFormRows([{
        id: Date.now().toString(),
        block: '',
        inverter: '',
        generation: '',
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
          if (values[2]) newFormRows[index].generation = values[2]; // Generation is now the 3rd column
        }
      });
      setFormRows(newFormRows);
    } else {
      // Handle paste for table view
      const newFormData: Record<string, any> = {};
      rows.forEach((row, index) => {
        if (index < inverters.length && row.trim()) {
          const values = row.split('\t');
          const inverterName = inverters[index];
          if (values[1]) newFormData[`${inverterName}_generation`] = values[1];
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
          title="Data Entry - Inverter"
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
              placeholder="Search inverters..."
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
                  <div className="font-medium text-sm">Inverter Entry</div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Block</label>
                      <Input
                        value={row.block}
                        onChange={(e) => updateFormRow(row.id, 'block', e.target.value)}
                        placeholder="Enter block name..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Inverter</label>
                      <Input
                        value={row.inverter}
                        onChange={(e) => updateFormRow(row.id, 'inverter', e.target.value)}
                        placeholder="Enter inverter name..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Generation</label>
                      <Input
                        type="number"
                        value={row.generation}
                        onChange={(e) => updateFormRow(row.id, 'generation', e.target.value)}
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
              {filteredInverters.map((inverterName) => (
                <MobileCard
                  key={inverterName}
                  title={inverterName}
                  fields={[
                    {
                      label: 'Generation *',
                      value: formData[`${inverterName}_generation`] || '',
                      onChange: (value) => handleInputChange(inverterName, 'generation', value),
                      error: errors[`${inverterName}_generation`],
                      type: 'number',
                      placeholder: '0.00'
                    }
                  ]}
                />
              ))}
            </>
          )}
          {(viewMode === 'form' ? filteredFormRows.length : filteredInverters.length) === 0 && searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              No inverters found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <TableHeader 
        title="Data Entry - Inverter"
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
            placeholder="Search inverters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      
        <div className="p-4 bg-muted/20">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden" onPaste={handlePasteFromExcel} tabIndex={0}>
            {viewMode === 'form' ? (
              <>
                <div className="bg-muted/50 border-b">
                  <div className="grid grid-cols-5 gap-0 text-sm font-semibold text-foreground">
                    <div className="px-4 py-3 border-r">Block</div>
                    <div className="px-4 py-3 border-r">Inverter</div>
                    <div className="px-4 py-3 border-r">Generation</div>
                    <div className="px-4 py-3 border-r">Remarks</div>
                    <div className="px-4 py-3">Actions</div>
                  </div>
                </div>

              <div className="divide-y">
                {filteredFormRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-5 gap-0 items-center">
                    <div className="px-2 py-2 border-r">
                      <Popover open={openDropdowns[`${row.id}-block`]} onOpenChange={(open) => 
                        setOpenDropdowns(prev => ({ ...prev, [`${row.id}-block`]: open }))
                      }>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openDropdowns[`${row.id}-block`]}
                            className="w-full justify-between h-8 border-0 shadow-none"
                          >
                            {row.block || "Select Block"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search blocks..." />
                            <CommandList>
                              <CommandEmpty>No block found.</CommandEmpty>
                              <CommandGroup>
                                {blocks.map((block) => (
                                  <CommandItem
                                    key={block}
                                    value={block}
                                    onSelect={() => {
                                      updateFormRow(row.id, 'block', block);
                                      setOpenDropdowns(prev => ({ ...prev, [`${row.id}-block`]: false }));
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        row.block === block ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {block}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="px-2 py-2 border-r">
                      <Popover open={openDropdowns[`${row.id}-inverter`]} onOpenChange={(open) => 
                        setOpenDropdowns(prev => ({ ...prev, [`${row.id}-inverter`]: open }))
                      }>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openDropdowns[`${row.id}-inverter`]}
                            className="w-full justify-between h-8 border-0 shadow-none"
                            disabled={!row.block}
                          >
                            {row.inverter || "Select Inverter"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search inverters..." />
                            <CommandList>
                              <CommandEmpty>No inverter found.</CommandEmpty>
                              <CommandGroup>
                                {getInvertersForBlock(row.block).map((inverter) => (
                                  <CommandItem
                                    key={inverter}
                                    value={inverter}
                                    onSelect={() => {
                                      updateFormRow(row.id, 'inverter', inverter);
                                      setOpenDropdowns(prev => ({ ...prev, [`${row.id}-inverter`]: false }));
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        row.inverter === inverter ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {inverter}
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
                        value={row.generation}
                        onChange={(e) => updateFormRow(row.id, 'generation', e.target.value)}
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
              </>
            ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/50 text-foreground border-b-2">
                  <th className="px-3 py-3 text-left font-semibold border-r min-w-[120px]">
                    Field
                  </th>
                  {site.inverterConfig?.blocks.map((block) => 
                    block.inverters.map((inverter) => (
                      <th key={`${block.blockName}-${inverter}`} className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[200px] text-sm">
                        {block.blockName}-{inverter}
                      </th>
                    ))
                  )}
                  <th className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[100px] text-sm">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-muted/20">
                  <td className="px-3 py-2 border border-gray-300 font-medium bg-muted/30">
                    Generation
                  </td>
                  {site.inverterConfig?.blocks.map((block) => 
                    block.inverters.map((inverter) => {
                      const key = `${block.blockName}-${inverter}`;
                      return (
                        <td key={key} className="px-3 py-2 border border-gray-300">
                          <div className="space-y-1">
                            <Input
                              type="number"
                              value={formData[`${key}_generation`] || ''}
                              onChange={(e) => handleInputChange(key, 'generation', e.target.value)}
                              className={cn(
                                "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                                errors[`${key}_generation`] && "border-destructive focus:border-destructive"
                              )}
                              placeholder="0.00"
                              step="0.01"
                            />
                            {errors[`${key}_generation`] && (
                              <p className="text-xs text-destructive">{errors[`${key}_generation`]}</p>
                            )}
                          </div>
                        </td>
                      );
                    })
                  )}
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
