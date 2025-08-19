
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
  BarChart3
} from "lucide-react";
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { GrassCuttingTab } from "@/components/operations/GrassCuttingTab";
import { CleaningTab } from "@/components/operations/CleaningTab";
import { ComingSoonTab } from "@/components/operations/ComingSoonTab";
import { AllOperationsSummary } from "@/components/operations/AllOperationsSummary";

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
    name: 'All Operations Summary',
    icon: BarChart3,
    status: 'available',
    description: 'Review and export all daily operations'
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
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-gray-600">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Operations Hub</h1>
            <p className="text-gray-600 mt-1">Centralized daily operations management</p>
          </div>
          
          {/* Daily Progress Tracker */}
          <div className="bg-white rounded-lg border p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Today's Progress</span>
              <span className="text-sm text-gray-500">{completedOperations} of {totalOperations} completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600">{Math.round(progressPercentage)}% Complete</span>
            </div>
          </div>
        </div>

        {/* Client Site Selector */}
        <ClientSiteSelector />
      </div>

      {/* Operations Tabs */}
      <div className="bg-white rounded-lg border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b bg-gray-50 px-6 py-3">
            <TabsList className="grid w-full grid-cols-5 bg-transparent h-auto p-0 gap-2">
              {operations.map((operation) => {
                const IconComponent = operation.icon;
                return (
                  <TabsTrigger
                    key={operation.id}
                    value={operation.id}
                    className="flex-col gap-2 h-auto p-3 data-[state=active]:bg-white data-[state=active]:shadow-sm border data-[state=active]:border-blue-200 data-[state=active]:text-blue-700 text-gray-600"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5" />
                      {getStatusIcon(operation.status)}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{operation.name}</div>
                      {operation.id !== 'summary' && getStatusBadge(operation.status)}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="grass-cutting" className="mt-0">
              <GrassCuttingTab />
            </TabsContent>

            <TabsContent value="cleaning" className="mt-0">
              <CleaningTab />
            </TabsContent>

            <TabsContent value="inspection" className="mt-0">
              <ComingSoonTab 
                title="Field Inspection" 
                description="Comprehensive field inspection and maintenance logging system"
                icon={Search}
              />
            </TabsContent>

            <TabsContent value="vegetation" className="mt-0">
              <ComingSoonTab 
                title="Vegetation Control" 
                description="Advanced vegetation management and control operations"
                icon={Leaf}
              />
            </TabsContent>

            <TabsContent value="summary" className="mt-0">
              <AllOperationsSummary />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
