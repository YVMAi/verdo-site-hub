
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

  // Group inverter data by block for mobile cards
  const groupedData = inverterRows.reduce((acc, row) => {
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
        />
        
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
      />
      
      <div className="overflow-x-auto">
        <div className="min-w-full" onPaste={handlePasteFromExcel} tabIndex={0}>
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
              {inverterRows.map((row) => (
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
