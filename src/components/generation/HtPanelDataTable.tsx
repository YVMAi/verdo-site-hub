
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site } from '@/types/generation';
import { useToast } from '@/hooks/use-toast';

interface HtPanelDataTableProps {
  site: Site | null;
  selectedDate: Date;
}

export const HtPanelDataTable: React.FC<HtPanelDataTableProps> = ({ site, selectedDate }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  if (!site) {
    return (
      <div className="bg-white border rounded">
        <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm">
          <span>Data Entry - HT Panel</span>
        </div>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Select a site to begin data entry</p>
        </div>
      </div>
    );
  }

  const blocks = site.htPanelConfig?.blockNames || ['Block 1'];

  const handleInputChange = (blockName: string, field: string, value: any) => {
    const key = `${blockName}_${field}`;
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Clear error for this field
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

    // Simulate API call
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

    // Clear form
    setFormData({});
  };

  const handlePasteFromExcel = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n');
    
    // Map pasted data to blocks
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

  return (
    <div className="bg-white rounded border">
      <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <span>Data Entry - HT Panel</span>
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
              {blocks.map((blockName, index) => (
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
