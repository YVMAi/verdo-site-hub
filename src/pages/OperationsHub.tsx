
import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Scissors, Droplets, Search, Leaf, CheckCircle2, Clock, BarChart3, Circle, Lock, Wrench, Package, FileText, MapPin, Shield, Bot, Satellite, Zap, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { GrassCuttingTab } from "@/components/operations/GrassCuttingTab";
import { CleaningTab } from "@/components/operations/CleaningTab";
import { ComingSoonTab } from "@/components/operations/ComingSoonTab";
import { AllOperationsSummary } from "@/components/operations/AllOperationsSummary";
import { useClientContext } from "@/contexts/ClientContext";
import { mockSites } from "@/data/mockGenerationData";

const getOperationsForSite = (siteId: string | null, siteName: string | null) => {
  const baseOperations = [{
    id: 'grass-cutting',
    name: 'Grass Cutting',
    icon: Scissors,
    status: 'completed',
    description: 'Track and manage grass cutting operations',
    enabled: true
  }, {
    id: 'cleaning',
    name: 'Cleaning',
    icon: Droplets,
    status: 'in-progress',
    description: 'Monitor solar panel cleaning activities',
    enabled: true
  }, {
    id: 'inspection',
    name: 'Inspection',
    icon: Search,
    status: 'pending',
    description: 'Field inspection and maintenance logs',
    enabled: false
  }, {
    id: 'vegetation',
    name: 'Vegetation Control',
    icon: Leaf,
    status: 'pending',
    description: 'Vegetation management and control',
    enabled: false
  }, {
    id: 'theft-incident',
    name: 'Theft Incident Summary',
    icon: Shield,
    status: 'pending',
    description: 'Security incident tracking and reporting',
    enabled: false
  }, {
    id: 'robot-operation',
    name: 'Robot Operation',
    icon: Bot,
    status: 'pending',
    description: 'Automated robot operations monitoring',
    enabled: false
  }, {
    id: 'tracker-operation',
    name: 'Tracker Operation',
    icon: Satellite,
    status: 'pending',
    description: 'Solar tracker system operations',
    enabled: false
  }, {
    id: 'string-monitoring',
    name: 'String Monitoring',
    icon: Zap,
    status: 'pending',
    description: 'String performance and monitoring',
    enabled: false
  }, {
    id: 'major-breakdown',
    name: 'Major Breakdown',
    icon: AlertTriangle,
    status: 'pending',
    description: 'Major equipment failure tracking',
    enabled: false
  }];

  // Check if this is "Desert Solar Farm B" (site id '2') - show all tabs
  if (siteName === 'Desert Solar Farm B' || siteId === '2') {
    baseOperations.push({
      id: 'ppm-tracking',
      name: 'PPM Tracking',
      icon: Wrench,
      status: 'pending',
      description: 'Preventive maintenance tracking',
      enabled: false
    }, {
      id: 'spare-tracking',
      name: 'Spare Tracking',
      icon: Package,
      status: 'pending',
      description: 'Spare parts inventory management',
      enabled: false
    }, {
      id: 'pod',
      name: 'POD',
      icon: FileText,
      status: 'pending',
      description: 'Proof of delivery documentation',
      enabled: false
    });
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
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const tabsPerPage = 5;
  
  const {
    selectedClient,
    selectedSite,
    setSelectedSite
  } = useClientContext();
  
  const operations = getOperationsForSite(selectedSite?.id || null, selectedSite?.name || null);
  const completedOperations = operations.filter(op => op.status === 'completed').length;
  const totalOperations = operations.length - 1; // Exclude summary tab
  const progressPercentage = completedOperations / totalOperations * 100;
  const availableSites = selectedClient ? mockSites.filter(site => site.clientId === selectedClient.id) : [];
  
  const totalPages = Math.ceil(operations.length / tabsPerPage);
  const visibleOperations = operations.slice(currentTabIndex, currentTabIndex + tabsPerPage);
  
  const handleSiteChange = (siteId: string) => {
    const site = availableSites.find(s => s.id === siteId) || null;
    setSelectedSite(site);
    setCurrentTabIndex(0); // Reset to first page when site changes
  };

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      setCurrentTabIndex(Math.max(0, currentTabIndex - tabsPerPage));
    }
  };

  const handleNext = () => {
    if (currentTabIndex + tabsPerPage < operations.length) {
      setCurrentTabIndex(Math.min(operations.length - tabsPerPage, currentTabIndex + tabsPerPage));
    }
  };

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
    <div className="min-h-screen w-full flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-[hsl(var(--verdo-navy))] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Daily Operations Data</h1>
          <p className="text-sm text-white/80">Centralized daily operations management</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Site Selector */}
          <div className="flex items-center gap-2 min-w-[300px]">
            <Select onValueChange={handleSiteChange} disabled={!selectedClient} value={selectedSite?.id || ""}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white h-8 text-sm">
                <SelectValue placeholder={selectedClient ? "Select a site..." : "Select client from sidebar first"} />
              </SelectTrigger>
              <SelectContent>
                {availableSites.map(site => (
                  <SelectItem key={site.id} value={site.id} className="text-sm">
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tab Navigation with Arrows */}
      <div className="flex-1 bg-white overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b bg-gray-50/50 px-4 py-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentTabIndex === 0}
                  className="h-8 w-8 p-0 hover:bg-gray-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <TabsList className="flex h-auto p-0 gap-1 bg-transparent flex-1">
                  {visibleOperations.map(operation => {
                    const IconComponent = operation.icon;
                    return (
                      <TabsTrigger 
                        key={operation.id} 
                        value={operation.id} 
                        disabled={!operation.enabled} 
                        className={`flex items-center gap-2 h-8 px-3 data-[state=active]:bg-[hsl(var(--verdo-navy))] data-[state=active]:text-white data-[state=active]:shadow-sm border data-[state=active]:border-[hsl(var(--verdo-navy))] text-gray-600 text-xs whitespace-nowrap flex-1 ${!operation.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium truncate">{operation.name}</span>
                        {getStatusIcon(operation.status, operation.enabled)}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentTabIndex + tabsPerPage >= operations.length}
                  className="h-8 w-8 p-0 hover:bg-gray-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Page indicator */}
              <div className="text-xs text-gray-500 ml-4">
                {Math.floor(currentTabIndex / tabsPerPage) + 1} / {totalPages}
              </div>
            </div>
          </div>

          {/* Fixed Main Content Area - Scrollable Independently */}
          <div className="flex-1 overflow-auto">
            <TabsContent value="grass-cutting" className="h-full m-0 p-3">
              <GrassCuttingTab selectedDate={selectedDate} />
            </TabsContent>

            <TabsContent value="cleaning" className="h-full m-0 p-3">
              <CleaningTab selectedDate={selectedDate} />
            </TabsContent>

            <TabsContent value="inspection" className="h-full m-0 p-3">
              <ComingSoonTab title="Field Inspection" description="Comprehensive field inspection and maintenance logging system" icon={Search} />
            </TabsContent>

            <TabsContent value="vegetation" className="h-full m-0 p-3">
              <ComingSoonTab title="Vegetation Control" description="Advanced vegetation management and control operations" icon={Leaf} />
            </TabsContent>

            <TabsContent value="theft-incident" className="h-full m-0 p-3">
              <ComingSoonTab title="Theft Incident Summary" description="Security incident tracking and comprehensive reporting system" icon={Shield} />
            </TabsContent>

            <TabsContent value="robot-operation" className="h-full m-0 p-3">
              <ComingSoonTab title="Robot Operation" description="Automated robot operations monitoring and control center" icon={Bot} />
            </TabsContent>

            <TabsContent value="tracker-operation" className="h-full m-0 p-3">
              <ComingSoonTab title="Tracker Operation" description="Solar tracker system operations and performance monitoring" icon={Satellite} />
            </TabsContent>

            <TabsContent value="string-monitoring" className="h-full m-0 p-3">
              <ComingSoonTab title="String Monitoring" description="Real-time string performance monitoring and analysis" icon={Zap} />
            </TabsContent>

            <TabsContent value="major-breakdown" className="h-full m-0 p-3">
              <ComingSoonTab title="Major Breakdown" description="Major equipment failure tracking and incident management" icon={AlertTriangle} />
            </TabsContent>

            <TabsContent value="ppm-tracking" className="h-full m-0 p-3">
              <ComingSoonTab title="PPM Tracking" description="Preventive maintenance planning and tracking system" icon={Wrench} />
            </TabsContent>

            <TabsContent value="spare-tracking" className="h-full m-0 p-3">
              <ComingSoonTab title="Spare Tracking" description="Spare parts inventory and usage tracking" icon={Package} />
            </TabsContent>

            <TabsContent value="pod" className="h-full m-0 p-3">
              <ComingSoonTab title="POD" description="Proof of delivery documentation and management" icon={FileText} />
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
