
import React from 'react';
import { Site, TabType } from '@/types/generation';
import { ExcelDataGrid } from './ExcelDataGrid';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DataEntryTableProps {
  site: Site | null;
  activeTab: TabType;
}

export const DataEntryTable: React.FC<DataEntryTableProps> = ({ site, activeTab }) => {
  const { toast } = useToast();

  if (!site) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Select a site to begin data entry</p>
      </div>
    );
  }

  const handleSave = (data: any) => {
    // Simulate API call
    console.log('Saving data:', {
      siteId: site.id,
      tabType: activeTab,
      date: data.date,
      values: data.values
    });

    toast({
      title: "Data Saved",
      description: `Data for ${format(new Date(data.date), 'PPP')} has been saved successfully.`,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          Data Entry - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h3>
        <div className="text-sm text-muted-foreground">
          💡 Paste data from Excel using Ctrl+V
        </div>
      </div>
      
      <ExcelDataGrid
        site={site}
        data={[]}
        isEditable={true}
        onSave={handleSave}
        showDatePicker={true}
        className="shadow-sm"
      />
    </div>
  );
};
