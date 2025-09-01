
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site, TabType } from '@/types/generation';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { MeterDataTable } from './MeterDataTable';
import { HtPanelDataTable } from './HtPanelDataTable';
import { InverterDataTable } from './InverterDataTable';
import { TableHeader } from './TableHeader';
import { MobileCard } from './MobileCard';
import { EmptyState } from './EmptyState';

interface DataEntryTableProps {
  site: Site | null;
  activeTab: TabType;
  selectedDate: Date;
}

export const DataEntryTable: React.FC<DataEntryTableProps> = ({ site, activeTab, selectedDate }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Use specialized tables for specific tabs
  if (activeTab === 'meter-data') {
    return <MeterDataTable site={site} selectedDate={selectedDate} />;
  }

  if (activeTab === 'ht-panel') {
    return <HtPanelDataTable site={site} selectedDate={selectedDate} />;
  }

  if (activeTab === 'inverter') {
    return <InverterDataTable site={site} selectedDate={selectedDate} />;
  }

  if (!site) {
    return <EmptyState message="Select a site to begin data entry" />;
  }

  const getColumnsForTab = () => {
    if (activeTab === 'weather' && site.weatherColumns) {
      return site.weatherColumns;
    }
    return site.columns;
  };

  const filteredColumns = getColumnsForTab().filter(column => column.id !== 'date');

  const handleInputChange = (columnId: string, value: any) => {
    setFormData(prev => ({ ...prev, [columnId]: value }));
    
    if (errors[columnId]) {
      setErrors(prev => ({ ...prev, [columnId]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    filteredColumns.forEach(column => {
      if (column.required && !formData[column.id]) {
        newErrors[column.id] = 'This field is required';
      }
      
      if (column.type === 'number' && formData[column.id] && isNaN(Number(formData[column.id]))) {
        newErrors[column.id] = 'Must be a valid number';
      }

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

    setFormData({});
  };

  const handlePasteFromExcel = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n');
    const values = rows[0].split('\t');
    
    const newFormData: Record<string, any> = {};
    filteredColumns.forEach((column, index) => {
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

  // For plant-data and weather, render as form instead of table
  if (activeTab === 'plant-data' || activeTab === 'weather') {
    // Ensure at least 5 fields on the left, but if there are fewer than 10 total, split evenly
    const totalFields = filteredColumns.length;
    const leftFieldCount = totalFields < 10 ? Math.ceil(totalFields / 2) : Math.max(5, Math.ceil(totalFields / 2));
    
    const leftFields = filteredColumns.slice(0, leftFieldCount);
    const rightFields = filteredColumns.slice(leftFieldCount);

    const tabTitle = activeTab === 'plant-data' ? 'Plant Data' : 'Weather';

    if (isMobile) {
      return (
        <div className="bg-white rounded-lg border overflow-hidden">
          <TableHeader 
            title={`Data Entry - ${tabTitle}`}
            selectedDate={selectedDate}
            onSave={handleSave}
          />
          
          <div className="p-4 space-y-4" onPaste={handlePasteFromExcel} tabIndex={0}>
            <MobileCard
              title={`${tabTitle} Entry`}
              fields={filteredColumns.map(column => ({
                label: `${column.name}${column.required ? ' *' : ''}`,
                value: formData[column.id] || '',
                onChange: (value) => handleInputChange(column.id, value),
                error: errors[column.id],
                type: getInputType(column),
                placeholder: getPlaceholder(column)
              }))}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border overflow-hidden">
        <TableHeader 
          title={`Data Entry - ${tabTitle}`}
          selectedDate={selectedDate}
          onSave={handleSave}
        />
        
        <Card className="border-0 rounded-none">
          <CardContent className="p-6" onPaste={handlePasteFromExcel} tabIndex={0}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                {leftFields.map((column) => (
                  <div key={column.id} className="space-y-2">
                    <Label htmlFor={column.id} className="text-sm font-medium">
                      {column.name}
                      {column.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={column.id}
                      type={getInputType(column)}
                      value={formData[column.id] || ''}
                      onChange={(e) => handleInputChange(column.id, e.target.value)}
                      className={cn(
                        "w-full",
                        errors[column.id] && "border-destructive focus:border-destructive"
                      )}
                      placeholder={getPlaceholder(column)}
                      step={column.type === 'number' ? '0.01' : undefined}
                    />
                    {errors[column.id] && (
                      <p className="text-xs text-destructive">{errors[column.id]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {rightFields.map((column) => (
                  <div key={column.id} className="space-y-2">
                    <Label htmlFor={column.id} className="text-sm font-medium">
                      {column.name}
                      {column.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={column.id}
                      type={getInputType(column)}
                      value={formData[column.id] || ''}
                      onChange={(e) => handleInputChange(column.id, e.target.value)}
                      className={cn(
                        "w-full",
                        errors[column.id] && "border-destructive focus:border-destructive"
                      )}
                      placeholder={getPlaceholder(column)}
                      step={column.type === 'number' ? '0.01' : undefined}
                    />
                    {errors[column.id] && (
                      <p className="text-xs text-destructive">{errors[column.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For other tabs, keep the table format
  const getTabTitle = (tabType: string) => {
    return tabType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isMobile) {
    return (
      <div className="bg-white rounded-lg border overflow-hidden">
        <TableHeader 
          title={`Data Entry - ${getTabTitle(activeTab)}`}
          selectedDate={selectedDate}
          onSave={handleSave}
        />
        
        <div className="p-4 space-y-4" onPaste={handlePasteFromExcel} tabIndex={0}>
          <MobileCard
            title="Data Entry Form"
            fields={filteredColumns.map(column => ({
              label: `${column.name}${column.required ? ' *' : ''}`,
              value: formData[column.id] || '',
              onChange: (value) => handleInputChange(column.id, value),
              error: errors[column.id],
              type: getInputType(column),
              placeholder: getPlaceholder(column)
            }))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <TableHeader 
        title={`Data Entry - ${getTabTitle(activeTab)}`}
        selectedDate={selectedDate}
        onSave={handleSave}
      />
      
      <div className="overflow-x-auto">
        <div className="min-w-full" onPaste={handlePasteFromExcel} tabIndex={0}>
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0">
              <tr className="bg-verdo-navy text-white">
                {filteredColumns.map((column) => (
                  <th key={column.id} className="px-3 py-2 text-left font-medium border border-gray-300 min-w-[120px] text-sm">
                    {column.name}
                    {column.required && <span className="text-red-300 ml-1">*</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-muted/20">
                {filteredColumns.map((column) => (
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
    </div>
  );
};
