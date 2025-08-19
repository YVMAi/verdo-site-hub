import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Zap, Settings, Scissors, Droplets, Search, Leaf, ChevronDown, BarChart3, Plus } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ClientSelector } from './ClientSelector';
import { useClient } from '@/contexts/ClientContext';

const overviewItems = [{
  title: "Overview",
  url: "/",
  icon: BarChart3,
  description: "Dashboard and key metrics"
}];

const monitoringItems = [{
  title: "Daily generation data",
  url: "/generation",
  icon: Zap,
  description: "View today's output and trends"
}];

const operationsItems = [{
  title: "Grass Cutting",
  url: "/grass-cutting",
  icon: Scissors,
  description: "Grass cutting operations"
}, {
  title: "Cleaning",
  url: "/cleaning",
  icon: Droplets,
  description: "Module cleaning operations"
}, {
  title: "Inspections",
  url: "/field-inspection",
  icon: Search,
  description: "Log site checks and issues"
}, {
  title: "Vegetation control",
  url: "/vegetation",
  icon: Leaf,
  description: "Vegetation management"
}];

export function VerdoSidebar() {
  const { state } = useSidebar();
  const [operationsOpen, setOperationsOpen] = useState(true);
  const isCollapsed = state === "collapsed";
  const { selectedClient, setSelectedClient } = useClient();
  
  return (
    <Sidebar className="verdo-sidebar border-r-0 shadow-xl w-[248px] group-data-[collapsible=icon]:w-16" collapsible="icon">
      <SidebarContent className="bg-verdo-navy">
        {/* Header */}
        <div className={`${isCollapsed ? 'px-2 py-4' : 'px-4 py-5'} border-b border-verdo-navy-light/20`}>
          <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'}`}>
            <div className="w-8 h-8 bg-verdo-jade rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-semibold text-white">Verdo</h1>
                <p className="text-xs text-verdo-jade opacity-90">by TruGreen</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Selector */}
        <ClientSelector
          selectedClient={selectedClient}
          onClientChange={setSelectedClient}
          isCollapsed={isCollapsed}
        />

        {/* Overview Section */}
        <SidebarGroup className="px-3 py-3">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {overviewItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink to={item.url} className={({
                  isActive
                }) => `group flex items-center gap-3 px-3 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-verdo-navy-light/40 transition-all duration-200 font-medium relative ${isActive ? 'bg-verdo-jade/10 text-white shadow-lg before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-verdo-jade before:rounded-r-full' : ''} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`}>
                      <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                      {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Monitoring Section */}
        <SidebarGroup className="px-3">
          {!isCollapsed && <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider opacity-70">
              Monitoring
            </SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {monitoringItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink to={item.url} className={({
                  isActive
                }) => `group flex items-center gap-3 px-3 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-verdo-navy-light/40 transition-all duration-200 font-medium relative ${isActive ? 'bg-verdo-jade/10 text-white shadow-lg before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-verdo-jade before:rounded-r-full' : ''} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`}>
                      <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                      {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations Section */}
        <SidebarGroup className="px-3">
          {isCollapsed ?
        // Show operations items directly when collapsed
        <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {operationsItems.map(item => <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} className={({
                  isActive
                }) => `group flex items-center justify-center w-12 h-12 p-0 rounded-xl text-gray-300 hover:text-white hover:bg-verdo-navy-light/40 transition-all duration-200 font-medium relative ${isActive ? 'bg-verdo-jade/10 text-white shadow-lg before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-verdo-jade before:rounded-r-full' : ''}`}>
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>)}
              </SidebarMenu>
            </SidebarGroupContent> :
        // Show collapsible operations section when expanded
        <Collapsible open={operationsOpen} onOpenChange={setOperationsOpen} className="space-y-1">
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="group flex items-center justify-between px-3 py-3 text-gray-300 hover:text-white cursor-pointer rounded-xl hover:bg-verdo-navy-light/30 transition-all duration-200 font-medium">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider opacity-70">Operations</span>
                    <button className="ml-auto p-1 rounded-md hover:bg-verdo-navy-light/50 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${operationsOpen ? 'rotate-180' : ''}`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1">
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {operationsItems.map(item => <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={({
                      isActive
                    }) => `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-verdo-navy-light/40 transition-all duration-200 font-medium relative ml-4 ${isActive ? 'bg-verdo-jade/10 text-white shadow-md before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-verdo-jade before:rounded-r-full' : ''}`}>
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium truncate">{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>}
        </SidebarGroup>

        {/* Quick Access Section */}
        {!isCollapsed && <SidebarGroup className="px-3 mt-auto">
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider opacity-70">
              Quick access
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="text-center py-4">
                <p className="text-xs text-gray-500">Pin your favorites here</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>}
      </SidebarContent>
    </Sidebar>
  );
}
