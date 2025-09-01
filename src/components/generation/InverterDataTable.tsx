
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
import { Search, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface InverterRow {
  id: string;
  block: string;
  inverter: string;
  generation: string;
}

export const InverterDataTable: React.FC<InverterDataTableProps> = ({ site, selectedDate }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
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

  // Legacy data for table view
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inverterRows = useMemo(() => {
    if (!site || !site.inverterConfig) return [];
    
    const rows: InverterRow[] = [];
    site.inverterConfig.blocks.forEach(block => {
      block.inverters.forEach(inverter => {
        rows.push({
          id: `${block.blockName}-${inverter}`,
          block: block.blockName,
          inverter: inverter,
          generation: ''
        });
      });
    });
    return rows;
  }, [site]);

  React.useEffect(() => {
    if (site?.inverterConfig && formRows.length === 1 && !formRows[0].block) {
      // Initialize with first block and inverter if available
      const firstBlock = site.inverterConfig.blocks[0];
      if (firstBlock && firstBlock.inverters.length > 0) {
        setFormRows([{
          id: '1',
          block: firstBlock.blockName,
          inverter: firstBlock.inverters[0],
          generation: '',
          remarks: ''
        }]);
      }
    }
  }, [site, formRows]);

  // Filter inverter rows based on search term for table view
  const filteredInverterRows = useMemo(() => {
    if (!searchTerm.trim()) return inverterRows;
    
    return inverterRows.filter(row => 
      row.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.inverter.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inverterRows, searchTerm]);

  // Filter form rows based on search term
  const filteredFormRows = useMemo(() => {
    if (!searchTerm.trim()) return formRows;
    
    return formRows.filter(row => 
      row.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.inverter.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [formRows, searchTerm]);

  const updateFormRow = (id: string, field: keyof InverterFormRow, value: string) => {
    setFormRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
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

  const getInvertersForBlock = (blockName: string) => {
    const block = site?.inverterConfig?.blocks.find(b => b.blockName === blockName);
    return block ? block.inverters : [];
  };

  // Legacy functions for table view
  const handleInputChange = (rowId: string, value: string) => {
    setFormData(prev => ({ ...prev, [rowId]: value }));
    
    if (errors[rowId]) {
      setErrors(prev => ({ ...prev, [rowId]: '' }));
    }
  };

  const validateForm = () => {
    if (viewMode === 'form') {
      return formRows.every(row => row.block && row.inverter && row.generation);
    } else {
      const newErrors: Record<string, string> = {};
      
      inverterRows.forEach(row => {
        const value = formData[row.id];
        if (!value) {
          newErrors[row.id] = 'Generation value is required';
        } else if (isNaN(Number(value))) {
          newErrors[row.id] = 'Must be a valid number';
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
      console.log('Saving inverter form data:', {
        siteId: site?.id,
        tabType: 'inverter',
        date: format(selectedDate, 'yyyy-MM-dd'),
        formRows: formRows
      });
    } else {
      const saveData = inverterRows.map(row => ({
        siteId: site?.id,
        tabType: 'inverter',
        date: format(selectedDate, 'yyyy-MM-dd'),
        values: {
          date: format(selectedDate, 'yyyy-MM-dd'),
          block: row.block,
          inverter: row.inverter,
          generation: Number(formData[row.id])
        }
      }));

      console.log('Saving inverter data:', saveData);
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
    const rows = pastedData.split('\n').filter(row => row.trim());
    
    if (viewMode === 'form') {
      // Handle paste for form view
      const newFormRows = [...formRows];
      rows.forEach((row, index) => {
        const values = row.split('\t');
        if (values.length >= 3 && index < newFormRows.length) {
          newFormRows[index].generation = values[2];
        }
      });
      setFormRows(newFormRows);
    } else {
      // Handle paste for table view
      const newFormData: Record<string, string> = {};
      rows.forEach((row, index) => {
        const values = row.split('\t');
        if (values.length >= 3 && inverterRows[index]) {
          newFormData[inverterRows[index].id] = values[2];
        }
      });
      setFormData(prev => ({ ...prev, ...newFormData }));
    }
    
    toast({
      title: "Data Pasted",
      description: "Excel data has been pasted into the form.",
    });
  };

  if (!site || !site.inverterConfig) {
    return <EmptyState message="Select a site to begin inverter data entry" />;
  }

  // Group filtered inverter data by block for mobile cards
  const groupedData = filteredInverterRows.reduce((acc, row) => {
    if (!acc[row.block]) {
      acc[row.block] = [];
    }
    acc[row.block].push(row);
    return acc;
  }, {} as Record<string, InverterRow[]>);

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
              placeholder="Search blocks or inverters..."
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
              {Object.entries(groupedData).map(([blockName, rows]) => (
                <MobileCard
                  key={blockName}
                  title={blockName}
                  fields={rows.map(row => ({
                    label: `${row.inverter} *`,
                    value: formData[row.id] || '',
                    onChange: (value) => handleInputChange(row.id, value),
                    error: errors[row.id],
                    type: 'number',
                    placeholder: '0.00'
                  }))}
                />
              ))}
            </>
          )}
          {(viewMode === 'form' ? filteredFormRows.length : Object.keys(groupedData).length) === 0 && searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              No blocks or inverters found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    );
  }

  // Group inverters by block for table view
  const invertersByBlock = useMemo(() => {
    const grouped: Record<string, InverterRow[]> = {};
    filteredInverterRows.forEach(row => {
      if (!grouped[row.block]) {
        grouped[row.block] = [];
      }
      grouped[row.block].push(row);
    });
    return grouped;
  }, [filteredInverterRows]);

  const allBlocks = Object.keys(invertersByBlock);

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
            placeholder="Search blocks or inverters..."
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
                  <div className="px-4 py-3 border-r border-white/20">Inverter</div>
                  <div className="px-4 py-3 border-r border-white/20">Generation</div>
                  <div className="px-4 py-3 border-r border-white/20">Remarks</div>
                  <div className="px-4 py-3">Actions</div>
                </div>
              </div>

              <div className="divide-y">
                {filteredFormRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-5 gap-0 items-center">
                    <div className="px-2 py-2 border-r">
                      <Select value={row.block} onValueChange={(value) => updateFormRow(row.id, 'block', value)}>
                        <SelectTrigger className="h-8 border-0 shadow-none">
                          <SelectValue placeholder="Select Block" />
                        </SelectTrigger>
                        <SelectContent>
                          {site.inverterConfig.blocks.map(block => (
                            <SelectItem key={block.blockName} value={block.blockName}>
                              {block.blockName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="px-2 py-2 border-r">
                      <Select 
                        value={row.inverter} 
                        onValueChange={(value) => updateFormRow(row.id, 'inverter', value)}
                        disabled={!row.block}
                      >
                        <SelectTrigger className="h-8 border-0 shadow-none">
                          <SelectValue placeholder="Select Inverter" />
                        </SelectTrigger>
                        <SelectContent>
                          {getInvertersForBlock(row.block).map(inverter => (
                            <SelectItem key={inverter} value={inverter}>
                              {inverter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-verdo-navy text-white">
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[80px] text-sm">
                    Field
                  </th>
                  {allBlocks.map((blockName) => (
                    <th key={blockName} colSpan={invertersByBlock[blockName].length} className="px-3 py-2 text-center font-medium border border-gray-300 text-sm">
                      {blockName}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[100px] text-sm">
                    Remarks
                  </th>
                </tr>
                <tr className="bg-verdo-navy text-white">
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 text-sm">
                    Inverter
                  </th>
                  {allBlocks.map((blockName) => (
                    <React.Fragment key={blockName}>
                      {invertersByBlock[blockName].map((row) => (
                        <th key={row.id} className="px-3 py-2 text-center font-medium border border-gray-300 min-w-[100px] text-sm">
                          {row.inverter}
                        </th>
                      ))}
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
                    Generation
                  </td>
                  {allBlocks.map((blockName) => (
                    <React.Fragment key={blockName}>
                      {invertersByBlock[blockName].map((row) => (
                        <td key={row.id} className="px-3 py-2 border border-gray-300">
                          <div className="space-y-1">
                            <Input
                              type="number"
                              value={formData[row.id] || ''}
                              onChange={(e) => handleInputChange(row.id, e.target.value)}
                              className={cn(
                                "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                                errors[row.id] && "border-destructive focus:border-destructive"
                              )}
                              placeholder="0.00"
                              step="0.01"
                            />
                            {errors[row.id] && (
                              <p className="text-xs text-destructive">{errors[row.id]}</p>
                            )}
                          </div>
                        </td>
                      ))}
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
