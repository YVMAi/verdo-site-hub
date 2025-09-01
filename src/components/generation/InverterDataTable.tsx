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

interface InverterDataTableProps {
  site: Site | null;
  selectedDate: Date;
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

  // Filter inverter rows based on search term
  const filteredInverterRows = useMemo(() => {
    if (!searchTerm.trim()) return inverterRows;
    
    return inverterRows.filter(row => 
      row.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.inverter.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inverterRows, searchTerm]);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (rowId: string, value: string) => {
    setFormData(prev => ({ ...prev, [rowId]: value }));
    
    if (errors[rowId]) {
      setErrors(prev => ({ ...prev, [rowId]: '' }));
    }
  };

  const validateForm = () => {
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

    toast({
      title: "Data Saved",
      description: `Inverter data for ${format(selectedDate, 'PPP')} has been saved successfully.`,
    });

    setFormData({});
  };

  const handlePasteFromExcel = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim());
    
    const newFormData: Record<string, string> = {};
    rows.forEach((row, index) => {
      const values = row.split('\t');
      if (values.length >= 3 && inverterRows[index]) {
        newFormData[inverterRows[index].id] = values[2];
      }
    });
    
    setFormData(prev => ({ ...prev, ...newFormData }));
    
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
          {filteredInverterRows.length === 0 && searchTerm && (
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
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-verdo-navy text-white">
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                    Block
                  </th>
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                    Inverter
                  </th>
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                    Generation<span className="text-red-300 ml-1">*</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInverterRows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    <td className="px-3 py-2 border border-gray-300">
                      <div className="text-xs py-1 px-2 bg-muted/50 rounded">
                        {row.block}
                      </div>
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <div className="text-xs py-1 px-2 bg-muted/50 rounded">
                        {row.inverter}
                      </div>
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
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
                  </tr>
                ))}
                {filteredInverterRows.length === 0 && searchTerm && (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">
                      No blocks or inverters found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            // New horizontal table view for Inverters
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-verdo-navy text-white">
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                    Block
                  </th>
                  {allBlocks.map((blockName) => (
                    <th key={blockName} colSpan={invertersByBlock[blockName].length} className="px-3 py-2 text-center font-medium border border-gray-300 text-sm">
                      {blockName}
                    </th>
                  ))}
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
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
