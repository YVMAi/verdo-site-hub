import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Wrench, 
  Scissors, 
  Sparkles, 
  Search, 
  Cable,
  Shield,
  Bot,
  Radar,
  Zap,
  AlertTriangle
} from "lucide-react";
import { AllOperationsSummary } from "@/components/operations/AllOperationsSummary";
import { GrassCuttingTab } from "@/components/operations/GrassCuttingTab";
import { CleaningTab } from "@/components/operations/CleaningTab";
import { ComingSoonTab } from "@/components/operations/ComingSoonTab";

const operations = [
  { 
    id: "all", 
    name: "All Operations Summary", 
    icon: Wrench, 
    enabled: true, 
    status: "active" as const 
  },
  { 
    id: "grass-cutting", 
    name: "Grass Cutting", 
    icon: Scissors, 
    enabled: true, 
    status: "active" as const 
  },
  { 
    id: "cleaning", 
    name: "Cleaning", 
    icon: Sparkles, 
    enabled: true, 
    status: "active" as const 
  },
  { 
    id: "field-inspection", 
    name: "Field Inspection", 
    icon: Search, 
    enabled: false, 
    status: "inactive" as const 
  },
  { 
    id: "vegetation", 
    name: "Vegetation", 
    icon: Cable, 
    enabled: false, 
    status: "inactive" as const 
  },
  { 
    id: "theft-incident", 
    name: "Theft Incident Summary", 
    icon: Shield, 
    enabled: false, 
    status: "inactive" as const 
  },
  { 
    id: "robot-operation", 
    name: "Robot Operation", 
    icon: Bot, 
    enabled: false, 
    status: "inactive" as const 
  },
  { 
    id: "tracker-operation", 
    name: "Tracker Operation", 
    icon: Radar, 
    enabled: false, 
    status: "inactive" as const 
  },
  { 
    id: "string-monitoring", 
    name: "String Monitoring", 
    icon: Zap, 
    enabled: false, 
    status: "inactive" as const 
  },
  { 
    id: "major-breakdown", 
    name: "Major Breakdown", 
    icon: AlertTriangle, 
    enabled: false, 
    status: "inactive" as const 
  }
];

const getStatusIcon = (status: "active" | "inactive", enabled: boolean) => {
  if (!enabled) return null;
  return (
    <div className={`w-2 h-2 rounded-full ${
      status === "active" ? "bg-green-500" : "bg-gray-400"
    }`} />
  );
};

const OperationsHub = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="flex h-full bg-gray-50">
      <div className="flex-1 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b bg-gray-50/50 px-4 py-2">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex h-auto p-0 gap-1 bg-transparent w-max">
                {operations.map((operation) => {
                  const IconComponent = operation.icon;
                  return (
                    <TabsTrigger 
                      key={operation.id} 
                      value={operation.id} 
                      disabled={!operation.enabled} 
                      className={`flex items-center gap-2 h-8 px-3 data-[state=active]:bg-[hsl(var(--verdo-navy))] data-[state=active]:text-white data-[state=active]:shadow-sm border data-[state=active]:border-[hsl(var(--verdo-navy))] text-gray-600 text-xs whitespace-nowrap min-w-[160px] flex-shrink-0 ${!operation.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="font-medium">{operation.name}</span>
                      {getStatusIcon(operation.status, operation.enabled)}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <ScrollBar orientation="horizontal" className="h-2" />
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="all" className="h-full m-0">
              <AllOperationsSummary />
            </TabsContent>
            
            <TabsContent value="grass-cutting" className="h-full m-0">
              <GrassCuttingTab />
            </TabsContent>
            
            <TabsContent value="cleaning" className="h-full m-0">
              <CleaningTab />
            </TabsContent>
            
            <TabsContent value="field-inspection" className="h-full m-0">
              <ComingSoonTab title="Field Inspection" />
            </TabsContent>
            
            <TabsContent value="vegetation" className="h-full m-0">
              <ComingSoonTab title="Vegetation Management" />
            </TabsContent>
            
            <TabsContent value="theft-incident" className="h-full m-0">
              <ComingSoonTab title="Theft Incident Summary" />
            </TabsContent>
            
            <TabsContent value="robot-operation" className="h-full m-0">
              <ComingSoonTab title="Robot Operation" />
            </TabsContent>
            
            <TabsContent value="tracker-operation" className="h-full m-0">
              <ComingSoonTab title="Tracker Operation" />
            </TabsContent>
            
            <TabsContent value="string-monitoring" className="h-full m-0">
              <ComingSoonTab title="String Monitoring" />
            </TabsContent>
            
            <TabsContent value="major-breakdown" className="h-full m-0">
              <ComingSoonTab title="Major Breakdown" />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default OperationsHub;
