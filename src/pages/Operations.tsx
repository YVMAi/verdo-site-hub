
import React, { useState, useMemo } from 'react';
import { Site } from "@/types/generation";
import { GrassCuttingSiteData } from "@/types/grassCutting";
import { CleaningSiteData } from "@/types/cleaning";
import { mockGrassCuttingData } from "@/data/mockGrassCuttingData";
import { mockCleaningData } from "@/data/mockCleaningData";
import { useClient } from '@/contexts/ClientContext';
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { CompactGrassCuttingDataEntry } from "@/components/grassCutting/CompactGrassCuttingDataEntry";
import { CompactGrassCuttingHistoric } from "@/components/grassCutting/CompactGrassCuttingHistoric";
import { CompactCleaningDataEntry } from "@/components/cleaning/CompactCleaningDataEntry";
import { CompactCleaningHistoric } from "@/components/cleaning/CompactCleaningHistoric";
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Scissors, 
  Droplets, 
  Search, 
  Leaf, 
  BarChart3,
  CheckCircle2,
  Clock,
  Save,
  FileText
} from "lucide-react";

type OperationStatus = 'completed' | 'in-progress' | 'pending';

interface OperationTab {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  status: OperationStatus;
  description: string;
}

const Operations = () => {
  const { selectedClient } = useClient();
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [wetDryType, setWetDryType] = useState<'wet' | 'dry'>('wet');
  const [activeTab, setActiveTab] = useState('grass-cutting');

  // Mock operation statuses - in real app this would come from data
  const [operationStatuses, setOperationStatuses] = useState<Record<string, OperationStatus>>({
    'grass-cutting': 'in-progress',
    'cleaning': 'completed',
    'inspection': 'pending',
    'vegetation': 'pending'
  });

  const operations: OperationTab[] = [
    {
      id: 'grass-cutting',
      name: 'Grass Cutting',
      icon: Scissors,
      status: operationStatuses['grass-cutting'],
      description: 'Track and manage grass cutting operations'
    },
    {
      id: 'cleaning',
      name: 'Cleaning',
      icon: Droplets,
      status: operationStatuses['cleaning'],
      description: 'Solar module cleaning management'
    },
    {
      id: 'inspection',
      name: 'Inspection',
      icon: Search,
      status: operationStatuses['inspection'],
      description: 'Field inspection and quality checks'
    },
    {
      id: 'vegetation',
      name: 'Vegetation Control',
      icon: Leaf,
      status: operationStatuses['vegetation'],
      description: 'Vegetation management and control'
    },
    {
      id: 'summary',
      name: 'Summary',
      icon: BarChart3,
      status: 'pending',
      description: 'Review all operations summary'
    }
  ];

  const currentGrassCuttingData: GrassCuttingSiteData | null = useMemo(() => {
    if (!selectedClient || !selectedSite) return null;
    const key = `${selectedClient.id}-${selectedSite.id}`;
    return mockGrassCuttingData[key] || null;
  }, [selectedClient, selectedSite]);

  const currentCleaningData: CleaningSiteData | null = useMemo(() => {
    if (!selectedClient || !selectedSite) return null;
    const key = `${selectedClient.id}-${selectedSite.id}-${wetDryType}`;
    return mockCleaningData[key] || null;
  }, [selectedClient, selectedSite, wetDryType]);

  const completedOperations = operations.filter(op => op.status === 'completed').length - 1; // Exclude summary
  const totalOperations = operations.length - 1; // Exclude summary
  const progressPercentage = (completedOperations / totalOperations) * 100;

  const getStatusIcon = (status: OperationStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: OperationStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleSaveAll = () => {
    console.log('Saving all operations data');
    // Implementation for saving all data
  };

  return (
    <div className="max-w-full mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations Hub</h1>
          <p className="text-gray-600 mt-1">Centralized daily operations management</p>
        </div>
        
        {/* Progress Overview */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-700">
              Today's Progress: {completedOperations}/{totalOperations} completed
            </div>
            <Progress value={progressPercentage} className="w-24 h-2" />
          </div>
          <Button onClick={handleSaveAll} className="gap-2 bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4" />
            Save All
          </Button>
        </div>
      </div>

      {/* Client and Site Selection */}
      <div className="bg-white rounded-lg border p-4">
        <ClientSiteSelector
          selectedClient={selectedClient}
          selectedSite={selectedSite}
          onSiteChange={setSelectedSite}
          cleaningType={wetDryType}
          onCleaningTypeChange={setWetDryType}
          showCleaningType={activeTab === 'cleaning'}
        />
      </div>

      {/* Operations Tabs */}
      <div className="bg-white rounded-lg border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-2 bg-gray-50">
            {operations.map((operation) => {
              const Icon = operation.icon;
              return (
                <TabsTrigger
                  key={operation.id}
                  value={operation.id}
                  className="flex flex-col items-center gap-2 p-3 h-auto data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {getStatusIcon(operation.status)}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-xs">{operation.name}</div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs mt-1 ${getStatusColor(operation.status)}`}
                    >
                      {operation.status === 'in-progress' ? 'In Progress' : 
                       operation.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Contents */}
          <div className="p-6">
            <TabsContent value="grass-cutting" className="mt-0 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Scissors className="h-6 w-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Grass Cutting Management</h2>
                  <p className="text-gray-600 text-sm">Track and manage grass cutting operations</p>
                </div>
              </div>
              
              <CompactGrassCuttingDataEntry data={currentGrassCuttingData} />
              <CompactGrassCuttingHistoric data={currentGrassCuttingData} />
            </TabsContent>

            <TabsContent value="cleaning" className="mt-0 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Droplets className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Cleaning Management</h2>
                  <p className="text-gray-600 text-sm">Solar module cleaning operations</p>
                </div>
              </div>
              
              <CompactCleaningDataEntry data={currentCleaningData} />
              <CompactCleaningHistoric data={currentCleaningData} />
            </TabsContent>

            <TabsContent value="inspection" className="mt-0">
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-6 w-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Field Inspection</h2>
                  <p className="text-gray-600 text-sm">Field inspection and quality checks</p>
                </div>
              </div>
              <ComingSoonCard title="Field Inspection" />
            </TabsContent>

            <TabsContent value="vegetation" className="mt-0">
              <div className="flex items-center gap-3 mb-4">
                <Leaf className="h-6 w-6 text-green-700" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Vegetation Control</h2>
                  <p className="text-gray-600 text-sm">Vegetation management and control</p>
                </div>
              </div>
              <ComingSoonCard title="Vegetation Control" />
            </TabsContent>

            <TabsContent value="summary" className="mt-0">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Operations Summary</h2>
                  <p className="text-gray-600 text-sm">Review and export all operations data</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {operations.slice(0, -1).map((operation) => {
                  const Icon = operation.icon;
                  return (
                    <div key={operation.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-5 w-5 text-gray-600" />
                        {getStatusIcon(operation.status)}
                      </div>
                      <h3 className="font-medium text-gray-900">{operation.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{operation.description}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-2 ${getStatusColor(operation.status)}`}
                      >
                        {operation.status === 'in-progress' ? 'In Progress' : 
                         operation.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Daily Report Summary</h3>
                </div>
                <p className="text-blue-700 text-sm mb-4">
                  Complete all operations to generate and export your daily report.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    Preview Report
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={completedOperations < totalOperations}
                  >
                    Export Report
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Operations;
