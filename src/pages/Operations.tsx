
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { CompactGrassCuttingDataEntry } from "@/components/grassCutting/CompactGrassCuttingDataEntry";
import { CompactCleaningDataEntry } from "@/components/cleaning/CompactCleaningDataEntry";
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { Site } from "@/types/generation";
import { GrassCuttingSiteData } from "@/types/grassCutting";
import { CleaningSiteData } from "@/types/cleaning";
import { mockGrassCuttingData } from "@/data/mockGrassCuttingData";
import { mockCleaningData } from "@/data/mockCleaningData";
import { useClient } from '@/contexts/ClientContext';
import { 
  Scissors, 
  Droplets, 
  Search, 
  Leaf, 
  CheckCircle2, 
  Clock, 
  Save,
  FileText,
  ChevronRight
} from "lucide-react";

interface OperationStatus {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  progress: number;
}

const Operations = () => {
  const { selectedClient } = useClient();
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [activeTab, setActiveTab] = useState("grass-cutting");
  const [wetDryType, setWetDryType] = useState<'wet' | 'dry'>('wet');

  // Mock operation status - in real app this would come from API/state
  const [operationStatuses, setOperationStatuses] = useState<OperationStatus[]>([
    { id: "grass-cutting", name: "Grass Cutting", icon: Scissors, completed: false, progress: 30 },
    { id: "cleaning", name: "Cleaning", icon: Droplets, completed: false, progress: 60 },
    { id: "inspection", name: "Inspection", icon: Search, completed: true, progress: 100 },
    { id: "vegetation", name: "Vegetation", icon: Leaf, completed: false, progress: 0 },
  ]);

  const grassCuttingData: GrassCuttingSiteData | null = useMemo(() => {
    if (!selectedClient || !selectedSite) return null;
    const key = `${selectedClient.id}-${selectedSite.id}`;
    return mockGrassCuttingData[key] || null;
  }, [selectedClient, selectedSite]);

  const cleaningData: CleaningSiteData | null = useMemo(() => {
    if (!selectedClient || !selectedSite) return null;
    const key = `${selectedClient.id}-${selectedSite.id}-${wetDryType}`;
    return mockCleaningData[key] || null;
  }, [selectedClient, selectedSite, wetDryType]);

  const completedOperations = operationStatuses.filter(op => op.completed).length;
  const totalOperations = operationStatuses.length;
  const overallProgress = (completedOperations / totalOperations) * 100;

  const handleSaveAll = () => {
    // Mock save functionality
    console.log("Saving all operations...");
  };

  const getTabIcon = (operationId: string, completed: boolean) => {
    const operation = operationStatuses.find(op => op.id === operationId);
    if (!operation) return null;
    
    const IconComponent = operation.icon;
    return completed ? (
      <CheckCircle2 className="w-4 h-4 text-green-600" />
    ) : (
      <IconComponent className="w-4 h-4" />
    );
  };

  return (
    <div className="max-w-full mx-auto h-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Operations Hub</h1>
            <p className="text-gray-600">Streamlined daily operations data entry</p>
          </div>
          
          {/* Progress Summary */}
          <div className="bg-white rounded-lg border p-4 lg:min-w-[300px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Today's Progress</span>
              <Badge variant={completedOperations === totalOperations ? "default" : "secondary"}>
                {completedOperations} of {totalOperations} completed
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-2 mb-2" />
            <p className="text-xs text-gray-500">{Math.round(overallProgress)}% complete</p>
          </div>
        </div>
      </div>

      {/* Site Selection */}
      <div className="mb-6">
        <ClientSiteSelector
          selectedClient={selectedClient}
          selectedSite={selectedSite}
          onSiteChange={setSelectedSite}
          cleaningType={activeTab === "cleaning" ? wetDryType : undefined}
          onCleaningTypeChange={activeTab === "cleaning" ? setWetDryType : undefined}
          showCleaningType={activeTab === "cleaning"}
        />
      </div>

      {/* Operations Tabs */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          {/* Tab Navigation */}
          <div className="border-b bg-gray-50 px-6 py-4">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1 bg-transparent h-auto p-0">
              {operationStatuses.map((operation) => (
                <TabsTrigger
                  key={operation.id}
                  value={operation.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-white hover:bg-gray-50 data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200 data-[state=active]:text-blue-700"
                >
                  <div className="flex items-center gap-2">
                    {getTabIcon(operation.id, operation.completed)}
                    <span className="hidden sm:inline font-medium">{operation.name}</span>
                  </div>
                  <div className="w-full max-w-[80px]">
                    <Progress value={operation.progress} className="h-1" />
                    <span className="text-xs text-gray-500 mt-1">{operation.progress}%</span>
                  </div>
                </TabsTrigger>
              ))}
              
              {/* Summary Tab */}
              <TabsTrigger
                value="summary"
                className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-white hover:bg-gray-50 data-[state=active]:bg-green-50 data-[state=active]:border-green-200 data-[state=active]:text-green-700"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Summary</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Review
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <TabsContent value="grass-cutting" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Scissors className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Grass Cutting Operations</h2>
                  {operationStatuses.find(op => op.id === "grass-cutting")?.completed && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <CompactGrassCuttingDataEntry data={grassCuttingData} />
              </div>
            </TabsContent>

            <TabsContent value="cleaning" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Droplets className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Cleaning Operations</h2>
                  {operationStatuses.find(op => op.id === "cleaning")?.completed && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <CompactCleaningDataEntry data={cleaningData} />
              </div>
            </TabsContent>

            <TabsContent value="inspection" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Field Inspection</h2>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <ComingSoonCard 
                  title="Field Inspection Tools"
                  description="Digital forms and checklists for conducting thorough field inspections and reporting."
                />
              </div>
            </TabsContent>

            <TabsContent value="vegetation" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Vegetation Control</h2>
                </div>
                <ComingSoonCard 
                  title="Vegetation Control"
                  description="Track vegetation growth patterns and schedule maintenance to ensure optimal site performance."
                />
              </div>
            </TabsContent>

            <TabsContent value="summary" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-semibold">Operations Summary</h2>
                </div>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {operationStatuses.map((operation) => {
                    const IconComponent = operation.icon;
                    return (
                      <div key={operation.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-3">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                          {operation.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{operation.name}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className={`font-medium ${operation.completed ? 'text-green-600' : 'text-gray-900'}`}>
                            {operation.progress}%
                          </span>
                        </div>
                        <Progress value={operation.progress} className="h-1 mt-2" />
                      </div>
                    );
                  })}
                </div>

                {/* Summary Actions */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Ready to Submit?</h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Review all operations data before final submission. You can export individual reports or submit all operations at once.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      Export All Reports
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Submit All Operations
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Persistent Action Bar */}
      <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-50">
        <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg border p-3">
          <Button
            onClick={handleSaveAll}
            className="bg-green-600 hover:bg-green-700 text-white shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
          <Button
            onClick={() => setActiveTab("summary")}
            variant="outline"
            className="shadow-md"
          >
            Review All
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Operations;
