
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Circle
} from "lucide-react";
import { GrassCuttingTab } from "@/components/operations/GrassCuttingTab";
import { CleaningTab } from "@/components/operations/CleaningTab";
import { ComingSoonTab } from "@/components/operations/ComingSoonTab";
import { AllOperationsSummary } from "@/components/operations/AllOperationsSummary";
import { useClientContext } from "@/contexts/ClientContext";

const operations = [
  {
    id: 'grass-cutting',
    name: 'Grass Cutting',
    icon: Scissors,
    status: 'completed',
    description: 'Track and manage grass cutting operations'
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: Droplets,
    status: 'in-progress',
    description: 'Monitor solar panel cleaning activities'
  },
  {
    id: 'inspection',
    name: 'Inspection',
    icon: Search,
    status: 'pending',
    description: 'Field inspection and maintenance logs'
  },
  {
    id: 'vegetation',
    name: 'Vegetation Control',
    icon: Leaf,
    status: 'pending',
    description: 'Vegetation management and control'
  },
  {
    id: 'summary',
    name: 'Summary',
    icon: BarChart3,
    status: 'available',
    description: 'Review and export all operations'
  }
];

export default function OperationsHub() {
  const [activeTab, setActiveTab] = useState('grass-cutting');
  
  const completedOperations = operations.filter(op => op.status === 'completed').length;
  const totalOperations = operations.length - 1; // Exclude summary tab
  const progressPercentage = (completedOperations / totalOperations) * 100;

  const getStatusIcon = (status: string) => {
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

  const getTabVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      default:
        return 'outline';
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

      {/* Compact Operations Tabs */}
      <div className="flex-1 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b bg-gray-50/50 px-4 py-2">
            <TabsList className="grid w-full grid-cols-5 bg-transparent h-auto p-0 gap-1">
              {operations.map((operation) => {
                const IconComponent = operation.icon;
                return (
                  <TabsTrigger
                    key={operation.id}
                    value={operation.id}
                    className="flex items-center gap-2 h-8 px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm border data-[state=active]:border-blue-200 data-[state=active]:text-blue-700 text-gray-600 text-xs"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{operation.name}</span>
                    {getStatusIcon(operation.status)}
                  </TabsTrigger>
                );
              })}
            </TabsList>
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

            <TabsContent value="summary" className="h-full m-0 p-3">
              <AllOperationsSummary />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
