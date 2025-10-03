import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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

  const getTabTitle = (tab: string) => {
    return tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // For plant-data and weather, render as form instead of table
  if (activeTab === 'plant-data' || activeTab === 'weather') {
    const leftFields = filteredColumns.slice(0, 5);
    const rightFields = filteredColumns.slice(5);

    if (isMobile) {
      const allFields = filteredColumns.map(column => ({
        label: `${column.name}${column.required ? ' *' : ''}`,
        value: formData[column.id] || '',
        onChange: (value) => handleInputChange(column.id, value),
        error: errors[column.id],
        type: getInputType(column),
        placeholder: getPlaceholder(column)
      }));

      // Add remarks field for mobile
      allFields.push({
        label: 'Remarks',
        value: formData['remarks'] || '',
        onChange: (value) => handleInputChange('remarks', value),
        error: errors['remarks'],
        type: 'text',
        placeholder: 'Enter any remarks or notes...'
      });

      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <TableHeader 
            title={`Data Entry - ${getTabTitle(activeTab)}`}
            selectedDate={selectedDate}
            onSave={handleSave}
          />
          
          <div className="p-4 space-y-4" onPaste={handlePasteFromExcel} tabIndex={0}>
            <MobileCard
              title={`${getTabTitle(activeTab)} Data Entry`}
              fields={allFields}
            />
          </div>
        </div>
      );
    }

    return (
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden">
        <TableHeader 
          title={`Data Entry - ${getTabTitle(activeTab)}`}
          selectedDate={selectedDate}
          onSave={handleSave}
        />
        
        <CardContent className="p-6 bg-muted/20" onPaste={handlePasteFromExcel} tabIndex={0}>
          <div className="bg-white rounded-lg border shadow-sm p-6">
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
                        "w-full border-2 focus:border-verdo-navy",
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
                        "w-full border-2 focus:border-verdo-navy",
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
                
                {/* Remarks field */}
                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-sm font-medium">
                    Remarks
                  </Label>
                  <Textarea
                    id="remarks"
                    value={formData['remarks'] || ''}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    className={cn(
                      "w-full min-h-[80px] border-2 focus:border-verdo-navy",
                      errors['remarks'] && "border-destructive focus:border-destructive"
                    )}
                    placeholder="Enter any remarks or notes..."
                  />
                  {errors['remarks'] && (
                    <p className="text-xs text-destructive">{errors['remarks']}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For other tabs, keep the table format
  if (isMobile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
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
    <Card className="bg-white rounded-lg shadow-sm overflow-hidden">
      <TableHeader 
        title={`Data Entry - ${getTabTitle(activeTab)}`}
        selectedDate={selectedDate}
        onSave={handleSave}
      />
      
      <CardContent className="p-6 bg-muted/20">
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden" onPaste={handlePasteFromExcel} tabIndex={0}>
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0">
              <tr className="bg-muted/50 text-foreground border-b-2">
                {filteredColumns.map((column) => (
                  <th key={column.id} className="px-3 py-3 text-left font-semibold border-r last:border-r-0 min-w-[120px]">
                    {column.name}
                    {column.required && <span className="text-destructive ml-1">*</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-muted/10">
                {filteredColumns.map((column) => (
                  <td key={column.id} className="px-3 py-3 border-r border-b last:border-r-0">
                    <div className="space-y-1">
                      <Input
                        type={getInputType(column)}
                        value={formData[column.id] || ''}
                        onChange={(e) => handleInputChange(column.id, e.target.value)}
                        className={cn(
                          "h-9 border-2 bg-background focus:border-verdo-navy",
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
      </CardContent>
    </Card>
  );
};
