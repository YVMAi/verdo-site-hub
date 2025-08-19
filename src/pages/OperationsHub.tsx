
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Scissors, 
  Droplets, 
  Search, 
  Leaf, 
  CheckCircle2, 
  Clock,
  BarChart3,
  Circle,
  Lock,
  Wrench,
  Package,
  FileText
} from "lucide-react";
import { GrassCuttingTab } from "@/components/operations/GrassCuttingTab";
import { CleaningTab } from "@/components/operations/CleaningTab";
import { ComingSoonTab } from "@/components/operations/ComingSoonTab";
import { AllOperationsSummary } from "@/components/operations/AllOperationsSummary";
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { useClientContext } from "@/contexts/ClientContext";

const getOperationsForSite = (siteId: string | null) => {
  const baseOperations = [
    {
      id: 'grass-cutting',
      name: 'Grass Cutting',
      icon: Scissors,
      status: 'completed',
      description: 'Track and manage grass cutting operations',
      enabled: true
    },
    {
      id: 'cleaning',
      name: 'Cleaning',
      icon: Droplets,
      status: 'in-progress',
      description: 'Monitor solar panel cleaning activities',
      enabled: true
    },
    {
      id: 'inspection',
      name: 'Inspection',
      icon: Search,
      status: 'pending',
      description: 'Field inspection and maintenance logs',
      enabled: false
    },
    {
      id: 'vegetation',
      name: 'Vegetation Control',
      icon: Leaf,
      status: 'pending',
      description: 'Vegetation management and control',
      enabled: false
    }
  ];

  // Add additional operations based on site
  if (siteId) {
    baseOperations.push(
      {
        id: 'ppm-tracking',
        name: 'PPM Tracking',
        icon: Wrench,
        status: 'pending',
        description: 'Preventive maintenance tracking',
        enabled: false
      },
      {
        id: 'spare-tracking',
        name: 'Spare Tracking',
        icon: Package,
        status: 'pending',
        description: 'Spare parts inventory management',
        enabled: false
      },
      {
        id: 'pod',
        name: 'POD',
        icon: FileText,
        status: 'pending',
        description: 'Proof of delivery documentation',
        enabled: false
      }
    );
  }

  baseOperations.push({
    id: 'summary',
    name: 'Summary',
    icon: BarChart3,
    status: 'available',
    description: 'Review and export all operations',
    enabled: false
  });

  return baseOperations;
};

export default function OperationsHub() {
  const [activeTab, setActiveTab] = useState('grass-cutting');
  const { selectedClient, selectedSite, setSelectedSite } = useClientContext();
  
  const operations = getOperationsForSite(selectedSite?.id || null);
  const completedOperations = operations.filter(op => op.status === 'completed').length;
  const totalOperations = operations.length - 1; // Exclude summary tab
  const progressPercentage = (completedOperations / totalOperations) * 100;

  const getStatusIcon = (status: string, enabled: boolean) => {
    if (!enabled) {
      return <Lock className="w-3 h-3 text-gray-400" />;
    }
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'pending':
        return <Circle className="w-3 h-3 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Operations Hub</h1>
            <p className="text-sm text-gray-600">Centralized daily operations management</p>
          </div>
          
          {/* Compact Progress Tracker */}
          <div className="bg-gray-50 rounded-lg border px-3 py-2 min-w-[240px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Today's Progress</span>
              <span className="text-xs text-gray-500">{completedOperations}/{totalOperations}</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-xs text-gray-600">{Math.round(progressPercentage)}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Site Selection Above Tabs */}
      <div className="bg-gray-50 border-b px-4 py-3">
        <ClientSiteSelector 
          selectedClient={selectedClient}
          selectedSite={selectedSite}
          onSiteChange={setSelectedSite}
        />
      </div>

      {/* Scrollable Operations Tabs */}
      <div className="flex-1 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b bg-gray-50/50 px-4 py-2">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex h-auto p-0 gap-1 bg-transparent w-max">
                {operations.map((operation) => {
                  const IconComponent = operation.icon;
                  return (
                    <TabsTrigger
                      key={operation.id}
                      value={operation.id}
                      disabled={!operation.enabled}
                      className={`flex items-center gap-2 h-8 px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm border data-[state=active]:border-blue-200 data-[state=active]:text-blue-700 text-gray-600 text-xs whitespace-nowrap ${!operation.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="font-medium">{operation.name}</span>
                      {getStatusIcon(operation.status, operation.enabled)}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="grass-cutting" className="h-full m-0 p-3">
              <GrassCuttingTab />
            </TabsContent>

            <TabsContent value="cleaning" className="h-full m-0 p-3">
              <CleaningTab />
            </TabsContent>

            <TabsContent value="inspection" className="h-full m-0 p-3">
              <ComingSoonTab 
                title="Field Inspection" 
                description="Comprehensive field inspection and maintenance logging system"
                icon={Search}
              />
            </TabsContent>

            <TabsContent value="vegetation" className="h-full m-0 p-3">
              <ComingSoonTab 
                title="Vegetation Control" 
                description="Advanced vegetation management and control operations"
                icon={Leaf}
              />
            </TabsContent>

            <TabsContent value="ppm-tracking" className="h-full m-0 p-3">
              <ComingSoonTab 
                title="PPM Tracking" 
                description="Preventive maintenance planning and tracking system"
                icon={Wrench}
              />
            </TabsContent>

            <TabsContent value="spare-tracking" className="h-full m-0 p-3">
              <ComingSoonTab 
                title="Spare Tracking" 
                description="Spare parts inventory and usage tracking"
                icon={Package}
              />
            </TabsContent>

            <TabsContent value="pod" className="h-full m-0 p-3">
              <ComingSoonTab 
                title="POD" 
                description="Proof of delivery documentation and management"
                icon={FileText}
              />
            </TabsContent>

            <TabsContent value="summary" className="h-full m-0 p-3">
              <AllOperationsSummary />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
