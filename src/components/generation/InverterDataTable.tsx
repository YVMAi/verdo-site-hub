
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site } from '@/types/generation';
import { useToast } from '@/hooks/use-toast';

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
    
    // Clear error for this field
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

    // Simulate API call
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

    // Clear form
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
        newFormData[inverterRows[index].id] = values[2]; // Generation value
      }
    });
    
    setFormData(prev => ({ ...prev, ...newFormData }));
    
    toast({
      title: "Data Pasted",
      description: "Excel data has been pasted into the form.",
    });
  };

  if (!site || !site.inverterConfig) {
    return (
      <div className="bg-white border rounded">
        <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm">
          <span>Data Entry - Inverter</span>
        </div>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Select a site to begin inverter data entry</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border">
      <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <span>Data Entry - Inverter</span>
        <div className="flex items-center gap-4">
          <div className="text-sm text-white/80">
            Date: {format(selectedDate, 'PPP')}
          </div>
          <div className="flex flex-col items-center">
            <Button 
              onClick={handleSave} 
              variant="outline"
              size="sm" 
              className="bg-transparent border-white text-white hover:bg-white/10 w-8 h-8 p-0"
            >
              <Save className="h-4 w-4" />
            </Button>
            <span className="text-xs mt-1">Save</span>
          </div>
        </div>
      </div>
      
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
                  Generation
                  <span className="text-red-300 ml-1">*</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {inverterRows.map((row, index) => (
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
      
      <div className="p-3 bg-muted/20 text-xs text-muted-foreground border-t">
        💡 Tip: You can paste data directly from Excel by copying rows and pressing Ctrl+V in this table.
      </div>
    </div>
  );
};
