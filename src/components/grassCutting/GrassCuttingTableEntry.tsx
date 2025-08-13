
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Plus, Trash2, RotateCcw, Upload } from 'lucide-react';
import { Site } from '@/types/generation';
import { GrassCuttingEntry } from '@/types/grassCutting';
import { mockGrassCuttingData } from '@/data/mockGrassCuttingData';
import { useSidebar } from '@/components/ui/sidebar';

interface GrassCuttingTableEntryProps {
  site: Site;
}

interface TableRow {
  id: string;
  block: string;
  inverter: string;
  scb: string;
  planned: number;
  actual: number;
  deviation: number;
  percentage: number;
  remarks: string;
  photos: File[];
}

export const GrassCuttingTableEntry: React.FC<GrassCuttingTableEntryProps> = ({ site }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const [rows, setRows] = useState<TableRow[]>([]);
  const [globalPhotos, setGlobalPhotos] = useState<File[]>([]);
  const [verifiedBy, setVerifiedBy] = useState('');

  // Auto-populate rows when site changes
  useEffect(() => {
    if (site) {
      const siteData = mockGrassCuttingData.find(data => data.siteId === site.id);
      if (siteData) {
        const newRows = siteData.blocks.map((block, index) => ({
          id: `row-${index}`,
          block: block.name,
          inverter: block.inverters[0] || '',
          scb: '',
          planned: 0,
          actual: 0,
          deviation: 0,
          percentage: 0,
          remarks: '',
          photos: []
        }));
        setRows(newRows);
      }
    }
  }, [site]);

  const addRow = () => {
    const newRow: TableRow = {
      id: `row-${Date.now()}`,
      block: '',
      inverter: '',
      scb: '',
      planned: 0,
      actual: 0,
      deviation: 0,
      percentage: 0,
      remarks: '',
      photos: []
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof TableRow, value: any) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        // Calculate derived values
        if (field === 'planned' || field === 'actual') {
          const planned = field === 'planned' ? value : updatedRow.planned;
          const actual = field === 'actual' ? value : updatedRow.actual;
          updatedRow.deviation = actual - planned;
          updatedRow.percentage = planned > 0 ? Math.round((actual / planned) * 100) : 0;
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  const handlePhotoUpload = (rowId: string, files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files);
      updateRow(rowId, 'photos', [...rows.find(r => r.id === rowId)?.photos || [], ...newPhotos]);
    }
  };

  const handleGlobalPhotoUpload = (files: FileList | null) => {
    if (files) {
      setGlobalPhotos([...globalPhotos, ...Array.from(files)]);
    }
  };

  const removePhoto = (rowId: string, photoIndex: number) => {
    const row = rows.find(r => r.id === rowId);
    if (row) {
      const updatedPhotos = row.photos.filter((_, index) => index !== photoIndex);
      updateRow(rowId, 'photos', updatedPhotos);
    }
  };

  const removeGlobalPhoto = (photoIndex: number) => {
    setGlobalPhotos(globalPhotos.filter((_, index) => index !== photoIndex));
  };

  const autoPopulate = () => {
    if (site) {
      const siteData = mockGrassCuttingData.find(data => data.siteId === site.id);
      if (siteData) {
        const newRows = siteData.blocks.map((block, index) => ({
          id: `row-${index}`,
          block: block.name,
          inverter: block.inverters[0] || '',
          scb: '',
          planned: 0,
          actual: 0,
          deviation: 0,
          percentage: 0,
          remarks: '',
          photos: []
        }));
        setRows(newRows);
      }
    }
  };

  const getAvailableInverters = (blockName: string) => {
    const siteData = mockGrassCuttingData.find(data => data.siteId === site.id);
    const block = siteData?.blocks.find(b => b.name === blockName);
    return block?.inverters || [];
  };

  const getAvailableBlocks = () => {
    const siteData = mockGrassCuttingData.find(data => data.siteId === site.id);
    return siteData?.blocks || [];
  };

  const totalPlanned = rows.reduce((sum, row) => sum + row.planned, 0);
  const totalActual = rows.reduce((sum, row) => sum + row.actual, 0);
  const totalDeviation = totalActual - totalPlanned;
  const totalPercentage = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

  return (
    <Card className="w-full">
      <CardHeader className={`${isCollapsed ? 'px-3 py-3' : 'px-4 py-4'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">Grass Cutting Data Entry</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={autoPopulate} 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Auto-populate
            </Button>
            <Button 
              onClick={addRow} 
              size="sm"
              className="text-xs h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Row
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`${isCollapsed ? 'px-3 py-3' : 'px-4 py-4'} space-y-3`}>
        {/* Table Container with horizontal scroll */}
        <div className="overflow-x-auto border rounded-lg">
          <div className="min-w-[1000px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 p-2 bg-muted font-medium text-xs border-b">
              <div className="col-span-1">Block</div>
              <div className="col-span-1">Inverter</div>
              <div className="col-span-1">SCB</div>
              <div className="col-span-1">Plan</div>
              <div className="col-span-1">Actual</div>
              <div className="col-span-1">Dev</div>
              <div className="col-span-1">%</div>
              <div className="col-span-2">Remarks</div>
              <div className="col-span-2">Photos</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Rows */}
            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-12 gap-2 p-2 border-b hover:bg-muted/50">
                {/* Block */}
                <div className="col-span-1">
                  <Select value={row.block} onValueChange={(value) => updateRow(row.id, 'block', value)}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Block" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableBlocks().map(block => (
                        <SelectItem key={block.name} value={block.name} className="text-xs">
                          {block.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Inverter */}
                <div className="col-span-1">
                  <Select 
                    value={row.inverter} 
                    onValueChange={(value) => updateRow(row.id, 'inverter', value)}
                    disabled={!row.block}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Inv" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableInverters(row.block).map(inverter => (
                        <SelectItem key={inverter} value={inverter} className="text-xs">
                          {inverter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* SCB */}
                <div className="col-span-1">
                  <Input
                    value={row.scb}
                    onChange={(e) => updateRow(row.id, 'scb', e.target.value)}
                    placeholder="SCB"
                    className="h-7 text-xs"
                  />
                </div>

                {/* Planned */}
                <div className="col-span-1">
                  <Input
                    type="number"
                    value={row.planned || ''}
                    onChange={(e) => updateRow(row.id, 'planned', Number(e.target.value) || 0)}
                    placeholder="0"
                    className="h-7 text-xs"
                  />
                </div>

                {/* Actual */}
                <div className="col-span-1">
                  <Input
                    type="number"
                    value={row.actual || ''}
                    onChange={(e) => updateRow(row.id, 'actual', Number(e.target.value) || 0)}
                    placeholder="0"
                    className="h-7 text-xs"
                  />
                </div>

                {/* Deviation */}
                <div className="col-span-1">
                  <div className={`h-7 px-2 rounded border text-xs flex items-center justify-center font-medium ${
                    row.deviation > 0 ? 'text-green-700 bg-green-50 border-green-200' :
                    row.deviation < 0 ? 'text-red-700 bg-red-50 border-red-200' :
                    'text-gray-700 bg-gray-50 border-gray-200'
                  }`}>
                    {row.deviation}
                  </div>
                </div>

                {/* Percentage */}
                <div className="col-span-1">
                  <div className={`h-7 px-2 rounded border text-xs flex items-center justify-center font-medium ${
                    row.percentage >= 100 ? 'text-green-700 bg-green-50 border-green-200' :
                    row.percentage >= 80 ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                    'text-red-700 bg-red-50 border-red-200'
                  }`}>
                    {row.percentage}%
                  </div>
                </div>

                {/* Remarks */}
                <div className="col-span-2">
                  <Textarea
                    value={row.remarks}
                    onChange={(e) => updateRow(row.id, 'remarks', e.target.value)}
                    placeholder="Optional"
                    className="h-7 text-xs resize-none"
                    rows={1}
                  />
                </div>

                {/* Photos */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload(row.id, e.target.files)}
                      className="hidden"
                      id={`photo-${row.id}`}
                    />
                    <label htmlFor={`photo-${row.id}`} className="cursor-pointer">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" asChild>
                        <span>
                          <Camera className="w-3 h-3 mr-1" />
                          {row.photos.length}
                        </span>
                      </Button>
                    </label>
                    {row.photos.length > 0 && (
                      <div className="flex gap-1">
                        {row.photos.slice(0, 2).map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Photo ${index + 1}`}
                              className="w-6 h-6 object-cover rounded border cursor-pointer"
                              onClick={() => removePhoto(row.id, index)}
                            />
                          </div>
                        ))}
                        {row.photos.length > 2 && (
                          <Badge variant="secondary" className="text-xs h-6 px-1">
                            +{row.photos.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeRow(row.id)}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Summary Row */}
            {rows.length > 0 && (
              <div className="grid grid-cols-12 gap-2 p-2 bg-muted font-medium text-xs border-t-2">
                <div className="col-span-3 flex items-center">Total</div>
                <div className="col-span-1 flex items-center justify-center">{totalPlanned}</div>
                <div className="col-span-1 flex items-center justify-center">{totalActual}</div>
                <div className={`col-span-1 flex items-center justify-center font-bold ${
                  totalDeviation > 0 ? 'text-green-700' :
                  totalDeviation < 0 ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {totalDeviation}
                </div>
                <div className={`col-span-1 flex items-center justify-center font-bold ${
                  totalPercentage >= 100 ? 'text-green-700' :
                  totalPercentage >= 80 ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {totalPercentage}%
                </div>
                <div className="col-span-5"></div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-3">
          {/* Verified By */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">Verified By *</label>
              <Select value={verifiedBy} onValueChange={setVerifiedBy}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select verifier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervisor1" className="text-xs">Site Supervisor</SelectItem>
                  <SelectItem value="engineer1" className="text-xs">Field Engineer</SelectItem>
                  <SelectItem value="manager1" className="text-xs">Operations Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Global Photos */}
          <div>
            <label className="block text-xs font-medium mb-2">Global Photos</label>
            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleGlobalPhotoUpload(e.target.files)}
                className="hidden"
                id="global-photos"
              />
              <label htmlFor="global-photos" className="cursor-pointer">
                <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                  <span>
                    <Upload className="w-3 h-3 mr-1" />
                    Add Photos
                  </span>
                </Button>
              </label>
              
              {globalPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Global photo ${index + 1}`}
                    className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-75"
                    onClick={() => removeGlobalPhoto(index)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full text-xs"
                    onClick={() => removeGlobalPhoto(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button size="sm" className="text-xs">
              Submit Entry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
