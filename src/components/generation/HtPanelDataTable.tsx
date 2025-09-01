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

interface HtPanelDataTableProps {
  site: Site | null;
  selectedDate: Date;
}

interface HtPanelFormRow {
  id: string;
  block: string;
  incoming: string;
  outgoing: string;
  remarks: string;
}

export const HtPanelDataTable: React.FC<HtPanelDataTableProps> = ({ site, selectedDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'form' | 'table'>('form');
  const [formRows, setFormRows] = useState<HtPanelFormRow[]>([
    {
      id: '1',
      block: '',
      incoming: '',
      outgoing: '',
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

  const blocks = site.htPanelConfig?.blockNames || ['Block 1'];

  React.useEffect(() => {
    if (blocks.length > 0 && formRows.length === 1 && !formRows[0].block) {
      // Initialize with first block if available
      setFormRows([{
        id: '1',
        block: blocks[0],
        incoming: '',
        outgoing: '',
        remarks: ''
      }]);
    }
  }, [blocks, formRows]);

  // Filter blocks based on search term for table view
  const filteredBlocks = useMemo(() => {
    if (!searchTerm.trim()) return blocks;
    
    return blocks.filter(blockName => 
      blockName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blocks, searchTerm]);

  // Filter form rows based on search term
  const filteredFormRows = useMemo(() => {
    if (!searchTerm.trim()) return formRows;
    
    return formRows.filter(row => 
      row.block.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [formRows, searchTerm]);

  const updateFormRow = (id: string, field: keyof HtPanelFormRow, value: string) => {
    setFormRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const addFormRow = () => {
    const newRow: HtPanelFormRow = {
      id: Date.now().toString(),
      block: '',
      incoming: '',
      outgoing: '',
      remarks: ''
    };
    setFormRows(prev => [...prev, newRow]);
  };

  const removeFormRow = (id: string) => {
    if (formRows.length > 1) {
      setFormRows(prev => prev.filter(row => row.id !== id));
    }
  };

  const handleInputChange = (blockName: string, field: string, value: any) => {
    const key = `${blockName}_${field}`;
    setFormData(prev => ({ ...prev, [key]: value }));
    
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    if (viewMode === 'form') {
      return formRows.every(row => row.block && row.incoming && row.outgoing);
    } else {
      const newErrors: Record<string, string> = {};
      
      blocks.forEach(blockName => {
        const incomingKey = `${blockName}_incoming`;
        const outgoingKey = `${blockName}_outgoing`;
        
        if (!formData[incomingKey]) {
          newErrors[incomingKey] = 'This field is required';
        } else if (isNaN(Number(formData[incomingKey]))) {
          newErrors[incomingKey] = 'Must be a valid number';
        }
        
        if (!formData[outgoingKey]) {
          newErrors[outgoingKey] = 'This field is required';
        } else if (isNaN(Number(formData[outgoingKey]))) {
          newErrors[outgoingKey] = 'Must be a valid number';
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
      console.log('Saving HT Panel form data:', {
        siteId: site.id,
        tabType: 'ht-panel',
        date: format(selectedDate, 'yyyy-MM-dd'),
        formRows: formRows
      });
    } else {
      console.log('Saving HT Panel data:', {
        siteId: site.id,
        tabType: 'ht-panel',
        date: format(selectedDate, 'yyyy-MM-dd'),
        values: formData
      });
    }

    toast({
      title: "Data Saved",
      description: `HT Panel data for ${format(selectedDate, 'PPP')} has been saved successfully.`,
    });

    if (viewMode === 'form') {
      setFormRows([{
        id: Date.now().toString(),
        block: '',
        incoming: '',
        outgoing: '',
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
          if (values[1]) newFormRows[index].incoming = values[1];
          if (values[2]) newFormRows[index].outgoing = values[2];
        }
      });
      setFormRows(newFormRows);
    } else {
      // Handle paste for table view
      const newFormData: Record<string, any> = {};
      rows.forEach((row, index) => {
        if (index < blocks.length && row.trim()) {
          const values = row.split('\t');
          const blockName = blocks[index];
          if (values[1]) newFormData[`${blockName}_incoming`] = values[1];
          if (values[2]) newFormData[`${blockName}_outgoing`] = values[2];
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
          title="Data Entry - HT Panel"
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
              placeholder="Search blocks..."
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
                  <div className="font-medium text-sm">HT Panel Entry</div>
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
                      <label className="text-xs text-muted-foreground">Incoming</label>
                      <Input
                        type="number"
                        value={row.incoming}
                        onChange={(e) => updateFormRow(row.id, 'incoming', e.target.value)}
                        placeholder="0.00"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Outgoing</label>
                      <Input
                        type="number"
                        value={row.outgoing}
                        onChange={(e) => updateFormRow(row.id, 'outgoing', e.target.value)}
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
              {filteredBlocks.map((blockName) => (
                <MobileCard
                  key={blockName}
                  title={blockName}
                  fields={[
                    {
                      label: 'Incoming *',
                      value: formData[`${blockName}_incoming`] || '',
                      onChange: (value) => handleInputChange(blockName, 'incoming', value),
                      error: errors[`${blockName}_incoming`],
                      type: 'number',
                      placeholder: '0.00'
                    },
                    {
                      label: 'Outgoing *',
                      value: formData[`${blockName}_outgoing`] || '',
                      onChange: (value) => handleInputChange(blockName, 'outgoing', value),
                      error: errors[`${blockName}_outgoing`],
                      type: 'number',
                      placeholder: '0.00'
                    }
                  ]}
                />
              ))}
            </>
          )}
          {(viewMode === 'form' ? filteredFormRows.length : filteredBlocks.length) === 0 && searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              No blocks found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <TableHeader 
        title="Data Entry - HT Panel"
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
            placeholder="Search blocks..."
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
                  <div className="px-4 py-3 border-r border-white/20">Block</div>
                  <div className="px-4 py-3 border-r border-white/20">Incoming</div>
                  <div className="px-4 py-3 border-r border-white/20">Outgoing</div>
                  <div className="px-4 py-3 border-r border-white/20">Remarks</div>
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
                      <Input
                        type="number"
                        value={row.incoming}
                        onChange={(e) => updateFormRow(row.id, 'incoming', e.target.value)}
                        className="h-8 border-0 shadow-none"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="px-2 py-2 border-r">
                      <Input
                        type="number"
                        value={row.outgoing}
                        onChange={(e) => updateFormRow(row.id, 'outgoing', e.target.value)}
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
                  {filteredBlocks.map((blockName) => (
                    <th key={blockName} colSpan={2} className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[200px] text-sm">
                      {blockName}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[100px] text-sm">
                    Remarks
                  </th>
                </tr>
                <tr className="bg-verdo-navy text-white">
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 text-sm">
                    HT Panel
                  </th>
                  {filteredBlocks.map((blockName) => (
                    <React.Fragment key={blockName}>
                      <th className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[100px] text-sm">
                        Incoming
                      </th>
                      <th className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[100px] text-sm">
                        Outgoing
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
                    HT Panel
                  </td>
                  {filteredBlocks.map((blockName) => (
                    <React.Fragment key={blockName}>
                      <td className="px-3 py-2 border border-gray-300">
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={formData[`${blockName}_incoming`] || ''}
                            onChange={(e) => handleInputChange(blockName, 'incoming', e.target.value)}
                            className={cn(
                              "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                              errors[`${blockName}_incoming`] && "border-destructive focus:border-destructive"
                            )}
                            placeholder="0.00"
                            step="0.01"
                          />
                          {errors[`${blockName}_incoming`] && (
                            <p className="text-xs text-destructive">{errors[`${blockName}_incoming`]}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={formData[`${blockName}_outgoing`] || ''}
                            onChange={(e) => handleInputChange(blockName, 'outgoing', e.target.value)}
                            className={cn(
                              "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                              errors[`${blockName}_outgoing`] && "border-destructive focus:border-destructive"
                            )}
                            placeholder="0.00"
                            step="0.01"
                          />
                          {errors[`${blockName}_outgoing`] && (
                            <p className="text-xs text-destructive">{errors[`${blockName}_outgoing`]}</p>
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
