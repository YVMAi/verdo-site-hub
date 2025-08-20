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

const getOperationsForSite = (siteId: string | null, siteName: string | null) => {
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

  // Check if this is "Desert Solar Farm B" (site id '2') - show all tabs
  if (siteName === 'Desert Solar Farm B' || siteId === '2') {
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

  // Always add summary tab at the end
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
  
  const operations = getOperationsForSite(selectedSite?.id || null, selectedSite?.name || null);
  const completedOperations = operations.filter(op => op.status === 'completed').length;
  const totalOperations = operations.length - 1; // Exclude summary tab
  const progressPercentage = (completedOperations / totalOperations) * 100;

  const getStatusIcon = (status: string, enabled: boolean) => {
    if (!enabled) {
      return <Lock className="w-3 h-3 text-gray-400" />;
    }
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-3 h-3 text-orange-500" />;
      case 'pending':
        return <Circle className="w-3 h-3 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Redesigned Header with repositioned site selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Operations Hub</h1>
            <p className="text-sm text-gray-600">Centralized daily operations management</p>
          </div>
          
          {/* Repositioned Site Selector and Progress - Top Right */}
          <div className="flex items-center gap-6">
            {/* Compact Site Selector */}
            <div className="min-w-[250px]">
              <ClientSiteSelector 
                selectedClient={selectedClient}
                selectedSite={selectedSite}
                onSiteChange={setSelectedSite}
              />
            </div>
            
            {/* Compact Progress Indicator */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-2 min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Today's Progress</span>
                <span className="text-xs text-gray-500">{completedOperations}/{totalOperations}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={progressPercentage} className="h-2 flex-1" />
                <span className="text-xs text-gray-600 font-medium">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Improved Navigation Tabs */}
      <div className="flex-1 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-gray-200 bg-white px-6 py-2">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex h-auto p-0 gap-0 bg-transparent w-max">
                {operations.map((operation) => {
                  const IconComponent = operation.icon;
                  const isActive = activeTab === operation.id;
                  return (
                    <TabsTrigger
                      key={operation.id}
                      value={operation.id}
                      disabled={!operation.enabled}
                      className={`
                        flex items-center gap-2 h-10 px-4 border-b-3 font-medium text-sm whitespace-nowrap transition-all duration-200
                        ${isActive 
                          ? 'bg-slate-800 text-white border-slate-900 shadow-sm' 
                          : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-800'
                        }
                        ${!operation.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:border-slate-900
                      `}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{operation.name}</span>
                      {getStatusIcon(operation.status, operation.enabled)}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-hidden bg-gray-50">
            <TabsContent value="grass-cutting" className="h-full m-0 p-6">
              <GrassCuttingTab />
            </TabsContent>

            <TabsContent value="cleaning" className="h-full m-0 p-6">
              <CleaningTab />
            </TabsContent>

            <TabsContent value="inspection" className="h-full m-0 p-6">
              <ComingSoonTab 
                title="Field Inspection" 
                description="Comprehensive field inspection and maintenance logging system"
                icon={Search}
              />
            </TabsContent>

            <TabsContent value="vegetation" className="h-full m-0 p-6">
              <ComingSoonTab 
                title="Vegetation Control" 
                description="Advanced vegetation management and control operations"
                icon={Leaf}
              />
            </TabsContent>

            <TabsContent value="ppm-tracking" className="h-full m-0 p-6">
              <ComingSoonTab 
                title="PPM Tracking" 
                description="Preventive maintenance planning and tracking system"
                icon={Wrench}
              />
            </TabsContent>

            <TabsContent value="spare-tracking" className="h-full m-0 p-6">
              <ComingSoonTab 
                title="Spare Tracking" 
                description="Spare parts inventory and usage tracking"
                icon={Package}
              />
            </TabsContent>

            <TabsContent value="pod" className="h-full m-0 p-6">
              <ComingSoonTab 
                title="POD" 
                description="Proof of delivery documentation and management"
                icon={FileText}
              />
            </TabsContent>

            <TabsContent value="summary" className="h-full m-0 p-6">
              <AllOperationsSummary />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
