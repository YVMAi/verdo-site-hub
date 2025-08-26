import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site, TabType } from '@/types/generation';
import { useToast } from '@/hooks/use-toast';

interface DataEntryTableProps {
  site: Site | null;
  activeTab: TabType;
  selectedDate: Date;
}

export const DataEntryTable: React.FC<DataEntryTableProps> = ({ site, activeTab, selectedDate }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Generate meter data columns based on site configuration
  const meterColumns = useMemo(() => {
    if (!site?.meterConfig || activeTab !== 'meter-data') return [];
    
    const columns: any[] = [];
    
    site.meterConfig.meters.forEach(meter => {
      site.meterConfig!.types.forEach(type => {
        columns.push({
          id: `${meter.toLowerCase().replace(' ', '-')}-${type.toLowerCase()}`,
          name: `${meter} - ${type}`,
          type: 'number',
          required: true
        });
      });
    });
    
    return columns;
  }, [site, activeTab]);

  // Use appropriate columns based on tab type (excluding date column)
  const currentColumns = activeTab === 'meter-data' 
    ? meterColumns 
    : (site?.columns?.filter(col => col.id !== 'date') || []);

  if (!site) {
    return (
      <div className="bg-white border rounded">
        <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm">
          <span>Data Entry - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Select a site to begin data entry</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (columnId: string, value: any) => {
    setFormData(prev => ({ ...prev, [columnId]: value }));
    
    // Clear error for this field
    if (errors[columnId]) {
      setErrors(prev => ({ ...prev, [columnId]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    currentColumns.forEach(column => {
      if (column.required && !formData[column.id]) {
        newErrors[column.id] = 'This field is required';
      }
      
      if (column.type === 'number' && formData[column.id] && isNaN(Number(formData[column.id]))) {
        newErrors[column.id] = 'Must be a valid number';
      }

      // Time field validation
      if ((column.id.includes('Time') || column.id.includes('time')) && formData[column.id]) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(formData[column.id])) {
          newErrors[column.id] = 'Must be in HH:MM format (24-hour)';
        }
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
    console.log('Saving data:', {
      siteId: site.id,
      tabType: activeTab,
      date: format(selectedDate, 'yyyy-MM-dd'),
      values: { ...formData, date: format(selectedDate, 'yyyy-MM-dd') }
    });

    toast({
      title: "Data Saved",
      description: `Data for ${format(selectedDate, 'PPP')} has been saved successfully.`,
    });

    // Clear form
    setFormData({});
  };

  const handlePasteFromExcel = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n');
    const values = rows[0].split('\t');
    
    // Map pasted values to columns (simplified)
    const newFormData: Record<string, any> = {};
    currentColumns.forEach((column, index) => {
      if (values[index]) {
        newFormData[column.id] = values[index];
      }
    });
    
    setFormData(prev => ({ ...prev, ...newFormData }));
    
    toast({
      title: "Data Pasted",
      description: "Excel data has been pasted into the form.",
    });
  };

  const getInputType = (column: any) => {
    if (column.type === 'number') return 'number';
    if (column.id.includes('Time') || column.id.includes('time')) return 'time';
    return 'text';
  };

  const getPlaceholder = (column: any) => {
    if (column.type === 'number') return '0.00';
    if (column.id.includes('Time') || column.id.includes('time')) return 'HH:MM';
    return 'Enter value';
  };

  return (
    <div className="bg-white rounded border">
      <div className="bg-verdo-navy px-3 py-2 text-white font-medium text-sm flex justify-between items-center">
        <span>Data Entry - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
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
                {currentColumns.map((column) => (
                  <th key={column.id} className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                    {column.name}
                    {column.required && <span className="text-red-300 ml-1">*</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-muted/20">
                {currentColumns.map((column) => (
                  <td key={column.id} className="px-3 py-2 border border-gray-300">
                    <div className="space-y-1">
                      <Input
                        type={getInputType(column)}
                        value={formData[column.id] || ''}
                        onChange={(e) => handleInputChange(column.id, e.target.value)}
                        className={cn(
                          "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                          errors[column.id] && "border-destructive focus:border-destructive"
                        )}
                        placeholder={getPlaceholder(column)}
                        step={column.type === 'number' ? '0.01' : undefined}
                      />
                      {errors[column.id] && (
                        <p className="text-xs text-destructive">{errors[column.id]}</p>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="p-3 bg-muted/20 text-xs text-muted-foreground border-t">
        💡 Tip: You can paste data directly from Excel by copying a row and pressing Ctrl+V in this table. Use HH:MM format for time fields.
      </div>
    </div>
  );
};
