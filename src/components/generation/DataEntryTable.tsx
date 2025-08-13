
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site, TabType } from '@/types/generation';
import { useToast } from '@/hooks/use-toast';

interface DataEntryTableProps {
  site: Site | null;
  activeTab: TabType;
}

export const DataEntryTable: React.FC<DataEntryTableProps> = ({ site, activeTab }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  if (!site) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Select a site to begin data entry</p>
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
    
    site.columns.forEach(column => {
      if (column.required && !formData[column.id]) {
        newErrors[column.id] = 'This field is required';
      }
      
      if (column.type === 'number' && formData[column.id] && isNaN(Number(formData[column.id]))) {
        newErrors[column.id] = 'Must be a valid number';
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
    site.columns.forEach((column, index) => {
      if (values[index] && column.id !== 'date') {
        newFormData[column.id] = values[index];
      }
    });
    
    setFormData(prev => ({ ...prev, ...newFormData }));
    
    toast({
      title: "Data Pasted",
      description: "Excel data has been pasted into the form.",
    });
  };

  return (
    <div className="bg-card border rounded-lg">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Data Entry - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full" onPaste={handlePasteFromExcel} tabIndex={0}>
          <table className="w-full text-sm">
            <thead className="bg-muted/30 sticky top-0">
              <tr>
                {site.columns.map((column) => (
                  <th key={column.id} className="px-3 py-2 text-left font-medium border-r border-border/50 min-w-[120px]">
                    {column.name}
                    {column.required && <span className="text-destructive ml-1">*</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-muted/20">
                {site.columns.map((column) => (
                  <td key={column.id} className="px-3 py-2 border-r border-border/50">
                    {column.id === 'date' ? (
                      <div className="text-sm py-1 px-2 bg-muted/50 rounded">
                        {format(selectedDate, 'yyyy-MM-dd')}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Input
                          type={column.type === 'number' ? 'number' : 'text'}
                          value={formData[column.id] || ''}
                          onChange={(e) => handleInputChange(column.id, e.target.value)}
                          className={cn(
                            "h-8 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-ring",
                            errors[column.id] && "border-destructive focus:border-destructive"
                          )}
                          placeholder={column.type === 'number' ? '0.00' : 'Enter value'}
                        />
                        {errors[column.id] && (
                          <p className="text-xs text-destructive">{errors[column.id]}</p>
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="p-3 bg-muted/20 text-xs text-muted-foreground border-t">
        💡 Tip: You can paste data directly from Excel by copying a row and pressing Ctrl+V in this table
      </div>
    </div>
  );
};
