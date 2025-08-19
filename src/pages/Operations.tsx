import React, { useState } from 'react';
import { useClient } from '@/contexts/ClientContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Scissors, 
  Droplets, 
  Search, 
  Leaf, 
  FileText, 
  CheckCircle2,
  Calendar,
  MapPin
} from 'lucide-react';
import { CompactGrassCuttingDataEntry } from '@/components/grassCutting/CompactGrassCuttingDataEntry';
import { CompactGrassCuttingHistoric } from '@/components/grassCutting/CompactGrassCuttingHistoric';
import { CompactCleaningDataEntry } from '@/components/cleaning/CompactCleaningDataEntry';
import { CompactCleaningHistoric } from '@/components/cleaning/CompactCleaningHistoric';
import { ComingSoonCard } from '@/components/ComingSoonCard';
import { mockGrassCuttingData } from '@/data/mockGrassCuttingData';
import { mockCleaningData } from '@/data/mockCleaningData';

type OperationType = 'grassCutting' | 'cleaning' | 'inspection' | 'vegetation' | 'summary';

interface OperationTab {
  id: OperationType;
  name: string;
  icon: React.ComponentType<any>;
  progress: number;
  color: string;
}

const operationTabs: OperationTab[] = [
  {
    id: 'grassCutting',
    name: 'Grass Cutting',
    icon: Scissors,
    progress: 30,
    color: 'bg-blue-500'
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: Droplets,
    progress: 60,
    color: 'bg-cyan-500'
  },
  {
    id: 'inspection',
    name: 'Inspection',
    icon: Search,
    progress: 100,
    color: 'bg-green-500'
  },
  {
    id: 'vegetation',
    name: 'Vegetation',
    icon: Leaf,
    progress: 0,
    color: 'bg-orange-500'
  },
  {
    id: 'summary',
    name: 'Summary',
    icon: FileText,
    progress: 0,
    color: 'bg-purple-500'
  }
];

const Operations: React.FC = () => {
  const { selectedClient, selectedSite } = useClient();
  const [activeTab, setActiveTab] = useState<OperationType>('grassCutting');
  const [selectedSiteForOps, setSelectedSiteForOps] = useState(selectedSite);

  const overallProgress = Math.round(operationTabs.reduce((acc, tab) => acc + tab.progress, 0) / operationTabs.length);
  const completedOperations = operationTabs.filter(tab => tab.progress === 100).length;

  const renderTabContent = () => {
    const currentSiteData = selectedSiteForOps || selectedSite;
    
    switch (activeTab) {
      case 'grassCutting':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <Scissors className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold">Grass Cutting Operations</h2>
              </div>
            </div>
            
            <CompactGrassCuttingDataEntry 
              data={mockGrassCuttingData[currentSiteData || 'site1']} 
            />
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Historic Data</h3>
              <CompactGrassCuttingHistoric 
                data={mockGrassCuttingData[currentSiteData || 'site1']} 
              />
            </div>
          </div>
        );
        
      case 'cleaning':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-cyan-100 rounded-lg">
                  <Droplets className="w-5 h-5 text-cyan-600" />
                </div>
                <h2 className="text-xl font-semibold">Cleaning Operations</h2>
              </div>
            </div>
            
            <CompactCleaningDataEntry 
              data={mockCleaningData[currentSiteData || 'site1']} 
            />
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Historic Data</h3>
              <CompactCleaningHistoric 
                data={mockCleaningData[currentSiteData || 'site1']} 
              />
            </div>
          </div>
        );
        
      case 'inspection':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                <Search className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Inspection Operations</h2>
            </div>
            <ComingSoonCard title="Inspection Operations" />
          </div>
        );
        
      case 'vegetation':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                <Leaf className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold">Vegetation Control</h2>
            </div>
            <ComingSoonCard title="Vegetation Control" />
          </div>
        );
        
      case 'summary':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold">Operations Summary</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Today's Operations Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {operationTabs.slice(0, 4).map((tab) => (
                    <div key={tab.id} className="text-center p-4 border rounded-lg">
                      <tab.icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                      <h4 className="font-medium">{tab.name}</h4>
                      <div className="mt-2">
                        <Progress value={tab.progress} className="h-2" />
                        <span className="text-sm text-gray-500 mt-1 block">{tab.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Ready to Submit</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {completedOperations} of {operationTabs.length - 1} operations completed
                  </p>
                  <Button className="mt-3 bg-green-600 hover:bg-green-700">
                    Submit All Operations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operations Hub</h1>
            <p className="text-gray-600 mt-1">Streamlined daily operations data entry</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Progress Summary */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Today's Progress</div>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={overallProgress} className="w-24 h-2" />
                <span className="text-sm text-gray-600">{completedOperations} of 4 completed</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{overallProgress}% complete</div>
            </div>
          </div>
        </div>
        
        {/* Site Selection */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Site</span>
          </div>
          <Select value={selectedSiteForOps || selectedSite || ''} onValueChange={setSelectedSiteForOps}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a site..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="site1">Desert Solar Farm A</SelectItem>
              <SelectItem value="site2">Mountain Solar Farm B</SelectItem>
              <SelectItem value="site3">Coastal Solar Farm C</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="text-sm text-gray-600">
            Selected: {selectedClient?.name || 'Solar Energy Corp'} → {selectedSiteForOps === 'site1' ? 'Desert Solar Farm A' : selectedSiteForOps === 'site2' ? 'Mountain Solar Farm B' : 'Coastal Solar Farm C'}
          </div>
          
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Edit window: 30 days • Columns: 6</span>
          </div>
        </div>
      </div>

      {/* Operation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-1">
          {operationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors relative ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-t border-l border-r border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
              
              {tab.id !== 'summary' && (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${tab.progress === 100 ? 'bg-green-500' : tab.progress > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                  <span className="text-xs">{tab.progress}%</span>
                </div>
              )}
              
              {tab.id !== 'summary' && (
                <div className="absolute bottom-0 left-4 right-4 h-1 bg-gray-200 rounded-full">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${tab.color}`}
                    style={{ width: `${tab.progress}%` }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Persistent Action Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Today: {new Date().toLocaleDateString()}
            </Badge>
            <span className="text-sm text-gray-600">
              Auto-save enabled
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline">
              Save Progress
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setActiveTab('summary')}
            >
              Review All →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Operations;
