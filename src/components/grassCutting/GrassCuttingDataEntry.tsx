
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Upload, X } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Site } from '@/types/generation';
import { GrassCuttingFormData } from '@/types/grassCutting';
import { mockBlocks, mockInverters, mockSCBs, mockUsers } from '@/data/mockGrassCuttingData';
import { useToast } from '@/hooks/use-toast';

interface GrassCuttingDataEntryProps {
  site: Site | null;
}

export const GrassCuttingDataEntry: React.FC<GrassCuttingDataEntryProps> = ({ site }) => {
  const [formData, setFormData] = useState<Partial<GrassCuttingFormData>>({
    date: new Date(),
    numberOfStringsCleaned: 0,
  });
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const availableBlocks = useMemo(() => {
    return site ? mockBlocks.filter(block => block.siteId === site.id) : [];
  }, [site]);

  const availableInverters = useMemo(() => {
    return formData.block 
      ? mockInverters.filter(inv => inv.blockId === mockBlocks.find(b => b.name === formData.block)?.id)
      : [];
  }, [formData.block]);

  const availableSCBs = useMemo(() => {
    return formData.inverter
      ? mockSCBs.filter(scb => scb.inverterId === mockInverters.find(inv => inv.name === formData.inverter)?.id)
      : [];
  }, [formData.inverter]);

  const calculatedMetrics = useMemo(() => {
    const planned = 25; // Mock planned value
    const actual = formData.numberOfStringsCleaned || 0;
    const deviation = actual - planned;
    const percentComplete = planned > 0 ? Math.round((actual / planned) * 100) : 0;

    return { planned, deviation, percentComplete };
  }, [formData.numberOfStringsCleaned]);

  if (!site) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Select a site to begin grass cutting data entry</p>
      </div>
    );
  }

  const handleInputChange = (field: keyof GrassCuttingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear dependent fields
    if (field === 'block') {
      setFormData(prev => ({ ...prev, inverter: '', scb: '' }));
    } else if (field === 'inverter') {
      setFormData(prev => ({ ...prev, scb: '' }));
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.block) newErrors.block = 'Block is required';
    if (!formData.inverter) newErrors.inverter = 'Inverter is required';
    if (!formData.numberOfStringsCleaned || formData.numberOfStringsCleaned <= 0) {
      newErrors.numberOfStringsCleaned = 'Number of strings must be greater than 0';
    }
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.stopTime) newErrors.stopTime = 'Stop time is required';
    if (!formData.verifiedBy) newErrors.verifiedBy = 'Verified by is required';
    
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

    console.log('Saving grass cutting data:', { ...formData, photos: selectedPhotos });
    
    toast({
      title: "Data Saved",
      description: `Grass cutting data for ${format(formData.date!, 'PPP')} has been saved successfully.`,
    });

    // Reset form
    setFormData({ date: new Date(), numberOfStringsCleaned: 0 });
    setSelectedPhotos([]);
  };

  const thirtyDaysAgo = subDays(new Date(), 30);

  return (
    <div className="bg-card border rounded-lg mb-6">
      <div className="p-4 border-b bg-muted/50">
        <h3 className="font-semibold">Grass Cutting Data Entry</h3>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Row 1: Date, Block, Inverter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.date && "text-muted-foreground",
                  errors.date && "border-destructive"
                )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && handleInputChange('date', date)}
                  disabled={(date) => date > new Date() || date < thirtyDaysAgo}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Block *</label>
            <Select value={formData.block || ''} onValueChange={(value) => handleInputChange('block', value)}>
              <SelectTrigger className={cn(errors.block && "border-destructive")}>
                <SelectValue placeholder="Select block" />
              </SelectTrigger>
              <SelectContent>
                {availableBlocks.map(block => (
                  <SelectItem key={block.id} value={block.name}>{block.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.block && <p className="text-xs text-destructive">{errors.block}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Inverter *</label>
            <Select value={formData.inverter || ''} onValueChange={(value) => handleInputChange('inverter', value)} disabled={!formData.block}>
              <SelectTrigger className={cn(errors.inverter && "border-destructive")}>
                <SelectValue placeholder="Select inverter" />
              </SelectTrigger>
              <SelectContent>
                {availableInverters.map(inverter => (
                  <SelectItem key={inverter.id} value={inverter.name}>{inverter.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.inverter && <p className="text-xs text-destructive">{errors.inverter}</p>}
          </div>
        </div>

        {/* Row 2: SCB, Number of Strings, Start Time, Stop Time */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">SCB</label>
            <Select value={formData.scb || ''} onValueChange={(value) => handleInputChange('scb', value)} disabled={!formData.inverter}>
              <SelectTrigger>
                <SelectValue placeholder="Select SCB (optional)" />
              </SelectTrigger>
              <SelectContent>
                {availableSCBs.map(scb => (
                  <SelectItem key={scb.id} value={scb.name}>{scb.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Strings Cleaned *</label>
            <Input
              type="number"
              min="0"
              value={formData.numberOfStringsCleaned || ''}
              onChange={(e) => handleInputChange('numberOfStringsCleaned', parseInt(e.target.value) || 0)}
              className={cn(errors.numberOfStringsCleaned && "border-destructive")}
              placeholder="0"
            />
            {errors.numberOfStringsCleaned && <p className="text-xs text-destructive">{errors.numberOfStringsCleaned}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time *</label>
            <Input
              type="time"
              value={formData.startTime || ''}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className={cn(errors.startTime && "border-destructive")}
            />
            {errors.startTime && <p className="text-xs text-destructive">{errors.startTime}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stop Time *</label>
            <Input
              type="time"
              value={formData.stopTime || ''}
              onChange={(e) => handleInputChange('stopTime', e.target.value)}
              className={cn(errors.stopTime && "border-destructive")}
            />
            {errors.stopTime && <p className="text-xs text-destructive">{errors.stopTime}</p>}
          </div>
        </div>

        {/* Row 3: Verified By, Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Verified By *</label>
            <Select value={formData.verifiedBy || ''} onValueChange={(value) => handleInputChange('verifiedBy', value)}>
              <SelectTrigger className={cn(errors.verifiedBy && "border-destructive")}>
                <SelectValue placeholder="Select verifier" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.verifiedBy && <p className="text-xs text-destructive">{errors.verifiedBy}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks</label>
            <Textarea
              value={formData.remarks || ''}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Optional remarks"
              rows={3}
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Photos</label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload photos</span>
            </label>
          </div>
          
          {selectedPhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {selectedPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculated Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Planned</p>
            <p className="text-lg font-semibold">{calculatedMetrics.planned}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Deviation</p>
            <p className={cn(
              "text-lg font-semibold",
              calculatedMetrics.deviation > 0 ? "text-green-600" : calculatedMetrics.deviation < 0 ? "text-red-600" : "text-gray-600"
            )}>
              {calculatedMetrics.deviation > 0 ? '+' : ''}{calculatedMetrics.deviation}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">% Complete</p>
            <p className={cn(
              "text-lg font-semibold",
              calculatedMetrics.percentComplete >= 100 ? "text-green-600" : 
              calculatedMetrics.percentComplete >= 80 ? "text-yellow-600" : "text-red-600"
            )}>
              {calculatedMetrics.percentComplete}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Daily Total</p>
            <p className="text-lg font-semibold">{formData.numberOfStringsCleaned || 0}</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-[#001f3f] hover:bg-[#001f3f]/90">
            <Save className="h-4 w-4 mr-2" />
            Save Entry
          </Button>
        </div>
      </div>
    </div>
  );
};
