
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Zap, 
  Settings,
  LayoutDashboard,
  Star,
  ChevronDown,
  Building
} from "lucide-react";
import { ClientSelector } from "./ClientSelector";
import { useClient } from "@/contexts/ClientContext";

const menuItems = [
  {
    title: "Overview",
    url: "/",
    icon: LayoutDashboard,
    category: "main"
  },
  {
    title: "Daily generation data", 
    url: "/generation",
    icon: Zap,
    category: "monitoring"
  },
  {
    title: "Operations Hub",
    url: "/operations", 
    icon: Settings,
    category: "operations"
  }
];

const quickAccessItems = [
  {
    title: "Pin your favorites here",
    url: "#",
    icon: Star,
    category: "quick-access"
  }
];

export function VerdoSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { selectedClient, setSelectedClient } = useClient();
  
  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => location.pathname === path;
  
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'main': return '';
      case 'monitoring': return 'MONITORING';
      case 'operations': return 'OPERATIONS';
      default: return category.toUpperCase();
    }
  };

  return (
    <Sidebar className="border-r border-border bg-verdo-navy text-verdo-jade">
      <SidebarHeader className="px-6 py-4 border-b border-blue-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-verdo-jade rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-verdo-navy" />
          </div>
          {!isCollapsed && (
            <div>
              <div className="font-bold text-lg text-verdo-jade">Verdo</div>
              <div className="text-xs text-blue-300">by TruGreen</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 flex-1">
        {/* CLIENT Section */}
        <SidebarGroup className="mb-6">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-blue-300 uppercase tracking-wider px-3 mb-2">
              CLIENT
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <ClientSelector 
              selectedClient={selectedClient} 
              onClientChange={setSelectedClient}
              isCollapsed={isCollapsed}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main navigation items */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <SidebarGroup key={category} className="mb-6">
            {getCategoryLabel(category) && !isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-blue-300 uppercase tracking-wider px-3 mb-2">
                {getCategoryLabel(category)}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton 
                        asChild
                        tooltip={isCollapsed ? item.title : undefined}
                      >
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                              isActive
                                ? 'bg-verdo-jade/10 text-verdo-jade border-l-4 border-verdo-jade'
                                : 'text-blue-200 hover:text-verdo-jade hover:bg-verdo-jade/5'
                            }`
                          }
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Quick Access Footer */}
      <SidebarFooter className="px-3 py-4 border-t border-blue-800">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-blue-300 uppercase tracking-wider px-3 mb-2">
              QUICK ACCESS
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {quickAccessItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton 
                      asChild
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <div className="flex items-center gap-3 px-3 py-2 text-blue-300 text-sm hover:text-verdo-jade cursor-pointer">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
