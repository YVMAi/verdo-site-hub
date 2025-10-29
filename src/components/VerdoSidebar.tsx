
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Zap, Settings, Scissors, Droplets, Search, Leaf, ChevronDown, BarChart3, Plus, ClipboardList, FileText, Shield, Users, Building2 } from 'lucide-react';
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

const dailyOperationsItems = [{
  title: "Daily operations data",
  url: "/operations",
  icon: ClipboardList,
  description: "Centralized operations management"
}];

const reportGenerationItems = [{
  title: "Report Generation",
  url: "/reports",
  icon: FileText,
  description: "Generate and manage reports"
}];

const adminItems = [
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
    description: "Manage users and permissions"
  },
  {
    title: "Client Management",
    url: "/admin/clients",
    icon: Building2,
    description: "Sync and manage clients"
  }
];

export function VerdoSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { selectedClient, setSelectedClient } = useClient();
  
  return (
    <Sidebar className="verdo-sidebar border-r border-gray-200 bg-gray-50 w-[248px] group-data-[collapsible=icon]:w-16" collapsible="icon">
      <SidebarContent className="bg-gray-50">
        {/* Header */}
        <div className={`${isCollapsed ? 'px-2 py-4' : 'px-4 py-5'} border-b border-gray-200`}>
          <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'}`}>
            <div className="w-8 h-8 bg-verdo-jade rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-semibold text-verdo-navy">Verdo</h1>
                <p className="text-xs text-gray-500">by TruGreen</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Selector */}
        <div className="px-4 py-3 border-b border-gray-200">
          {!isCollapsed && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">CLIENT</p>
              <ClientSelector
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
                isCollapsed={isCollapsed}
              />
            </div>
          )}
        </div>

        {/* Overview Section */}
        <SidebarGroup className="px-3 py-3">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {overviewItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink to={item.url} className={({ isActive }) => 
                      `group flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium relative ${
                        isActive 
                          ? 'bg-verdo-jade/10 text-verdo-navy shadow-sm border-l-4 border-verdo-jade' 
                          : ''
                      } ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                    }>
                      <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                      {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Monitoring Section */}
        <SidebarGroup className="px-3">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Monitoring
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {monitoringItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink to={item.url} className={({ isActive }) => 
                      `group flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium relative ${
                        isActive 
                          ? 'bg-verdo-jade/10 text-verdo-navy shadow-sm border-l-4 border-verdo-jade' 
                          : ''
                      } ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                    }>
                      <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                      {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Daily Operations Section */}
        <SidebarGroup className="px-3">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {dailyOperationsItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink to={item.url} className={({ isActive }) => 
                      `group flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium relative ${
                        isActive 
                          ? 'bg-verdo-jade/10 text-verdo-navy shadow-sm border-l-4 border-verdo-jade' 
                          : ''
                      } ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                    }>
                      <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                      {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Report Generation Section */}
        <SidebarGroup className="px-3">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {reportGenerationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink to={item.url} className={({ isActive }) => 
                      `group flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium relative ${
                        isActive 
                          ? 'bg-verdo-jade/10 text-verdo-navy shadow-sm border-l-4 border-verdo-jade' 
                          : ''
                      } ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                    }>
                      <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                      {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        <SidebarGroup className="px-3">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Admin
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink to={item.url} className={({ isActive }) => 
                      `group flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium relative ${
                        isActive 
                          ? 'bg-verdo-jade/10 text-verdo-navy shadow-sm border-l-4 border-verdo-jade' 
                          : ''
                      } ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                    }>
                      <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                      {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Access Section */}
        {!isCollapsed && (
          <SidebarGroup className="px-3 mt-auto">
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick access
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="text-center py-4">
                <p className="text-xs text-gray-400">Pin your favorites here</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
