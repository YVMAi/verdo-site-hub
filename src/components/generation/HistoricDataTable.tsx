
import React from 'react';
import { Site, TabType } from '@/types/generation';
import { ExcelDataGrid } from './ExcelDataGrid';
import { mockHistoricData } from '@/data/mockGenerationData';
import { useToast } from '@/hooks/use-toast';

interface HistoricDataTableProps {
  site: Site | null;
  activeTab: TabType;
  allowedEditDays: number;
}

export const HistoricDataTable: React.FC<HistoricDataTableProps> = ({ 
  site, 
  activeTab, 
  allowedEditDays 
}) => {
  const { toast } = useToast();

  if (!site) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Select a site to view historic data</p>
      </div>
    );
  }

  const filteredData = mockHistoricData
    .filter(item => item.siteId === site.id && item.tabType === activeTab);

  const handleSave = (data: any) => {
    console.log('Saving changes:', data);
    toast({
      title: "Changes Saved",
      description: "Historic data has been updated successfully.",
    });
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    const data = filteredData.map(item => item.values);
    console.log(`Exporting ${data.length} rows as ${format.toUpperCase()}`);
    
    toast({
      title: "Export Started",
      description: `Downloading ${data.length} rows as ${format.toUpperCase()}`,
    });
  };

  if (filteredData.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">
          Historic Data - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h3>
        <div className="bg-card border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No historic data available for this site and tab</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          Historic Data - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h3>
        <div className="text-sm text-muted-foreground">
          🔒 = Locked (older than {allowedEditDays} days)
        </div>
      </div>
      
      <ExcelDataGrid
        site={site}
        data={filteredData}
        isEditable={true}
        allowedEditDays={allowedEditDays}
        onSave={handleSave}
        onExport={handleExport}
        showDatePicker={false}
        className="shadow-sm"
      />
    </div>
  );
};
