

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
import { Search } from 'lucide-react';

interface HtPanelDataTableProps {
  site: Site | null;
  selectedDate: Date;
}

export const HtPanelDataTable: React.FC<HtPanelDataTableProps> = ({ site, selectedDate }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'form' | 'table'>('form');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  if (!site) {
    return <EmptyState message="Select a site to begin data entry" />;
  }

  const blocks = site.htPanelConfig?.blockNames || ['Block 1'];

  // Filter blocks based on search term
  const filteredBlocks = useMemo(() => {
    if (!searchTerm.trim()) return blocks;
    
    return blocks.filter(blockName => 
      blockName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blocks, searchTerm]);

  const handleInputChange = (blockName: string, field: string, value: any) => {
    const key = `${blockName}_${field}`;
    setFormData(prev => ({ ...prev, [key]: value }));
    
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
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

    console.log('Saving HT Panel data:', {
      siteId: site.id,
      tabType: 'ht-panel',
      date: format(selectedDate, 'yyyy-MM-dd'),
      values: formData
    });

    toast({
      title: "Data Saved",
      description: `HT Panel data for ${format(selectedDate, 'PPP')} has been saved successfully.`,
    });

    setFormData({});
  };

  const handlePasteFromExcel = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n');
    
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
          {filteredBlocks.length === 0 && searchTerm && (
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
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-verdo-navy text-white">
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                    Block<span className="text-red-300 ml-1">*</span>
                  </th>
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                    Incoming<span className="text-red-300 ml-1">*</span>
                  </th>
                  <th className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                    Outgoing<span className="text-red-300 ml-1">*</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.map((blockName) => (
                  <tr key={blockName} className="hover:bg-muted/20">
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        value={blockName}
                        readOnly
                        className="h-8 text-xs border-0 bg-gray-50 focus:bg-gray-50"
                      />
                    </td>
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
                  </tr>
                ))}
                {filteredBlocks.length === 0 && searchTerm && (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">
                      No blocks found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
