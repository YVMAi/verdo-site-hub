import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Plus } from 'lucide-react';
import { Site, TabType, SiteColumn } from '@/types/generation';
import { useToast } from '@/hooks/use-toast';

interface DataEntryTableProps {
  site: Site | null;
  activeTab: TabType;
}

interface InputValue {
  columnId: string;
  value: string;
}

export const DataEntryTable: React.FC<DataEntryTableProps> = ({ site, activeTab }) => {
  const [inputValues, setInputValues] = useState<InputValue[]>([]);
  const { toast } = useToast();

  const columns = useMemo(() => {
    if (!site) return [];
    return site.columns;
  }, [site]);

  const meterColumns = useMemo(() => {
    if (!site?.meterConfig || activeTab !== 'meter-data') return [];
    
    const columns: SiteColumn[] = [];
    
    site.meterConfig.meters.forEach(meter => {
      site.meterConfig!.types.forEach(type => {
        columns.push({
          id: `${meter}-${type.toLowerCase()}`,
          name: `${meter} - ${type}`,
          type: 'number' as const,
          required: true
        });
      });
    });
    
    return columns;
  }, [site, activeTab]);

  const allColumns = activeTab === 'meter-data' ? meterColumns : columns;

  const handleInputChange = (columnId: string, value: string) => {
    setInputValues(prev => {
      const existingValueIndex = prev.findIndex(item => item.columnId === columnId);
      if (existingValueIndex > -1) {
        const newValue = [...prev];
        newValue[existingValueIndex] = { columnId, value };
        return newValue;
      } else {
        return [...prev, { columnId, value }];
      }
    });
  };

  const handleSubmit = () => {
    if (!site) {
      toast({
        title: "Error",
        description: "Please select a site.",
        variant: "destructive",
      });
      return;
    }

    const requiredColumns = allColumns.filter(col => col.required);
    const missingValues = requiredColumns.filter(col => !inputValues.find(v => v.columnId === col.id && v.value.trim() !== ''));

    if (missingValues.length > 0) {
      toast({
        title: "Error",
        description: `Please fill in all required fields. Missing fields: ${missingValues.map(col => col.name).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Data saved successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {activeTab === 'meter-data' ? 'Meter Data' : 'Plant Data'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {site ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {allColumns.map(column => (
                    <TableHead key={column.id} className="uppercase">{column.name} {column.required && '*'}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {allColumns.map(column => (
                    <TableCell key={column.id}>
                      <Input
                        type="text"
                        placeholder={`Enter ${column.name}`}
                        value={inputValues.find(v => v.columnId === column.id)?.value || ''}
                        onChange={(e) => handleInputChange(column.id, e.target.value)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <p>No site selected.</p>
        )}
        <Button onClick={handleSubmit} className="mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save Data
        </Button>
      </CardContent>
    </Card>
  );
};
