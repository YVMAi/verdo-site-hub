
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
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Zap, 
  Scissors, 
  Droplets, 
  Search, 
  Leaf, 
  Settings,
  LayoutDashboard
} from "lucide-react";

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
    title: "Operations",
    url: "/operations", 
    icon: Settings,
    category: "operations"
  },
  {
    title: "Grass Cutting",
    url: "/grass-cutting",
    icon: Scissors,
    category: "operations"
  },
  {
    title: "Cleaning",
    url: "/cleaning",
    icon: Droplets,
    category: "operations"
  },
  {
    title: "Inspections",
    url: "/field-inspection",
    icon: Search,
    category: "operations"
  },
  {
    title: "Vegetation control",
    url: "/vegetation",
    icon: Leaf,
    category: "operations"
  }
];

export function VerdoSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  
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
    <Sidebar className="border-r border-border bg-verdo-navy text-white">
      <SidebarHeader className="px-6 py-4 border-b border-blue-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-verdo-navy" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-lg text-white">Verdo</div>
              <div className="text-xs text-blue-300">by TruGreen</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {Object.entries(groupedItems).map(([category, items]) => (
          <SidebarGroup key={category} className="mb-6">
            {getCategoryLabel(category) && !collapsed && (
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
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                              isActive
                                ? 'bg-white/10 text-white border-l-4 border-green-400'
                                : 'text-blue-200 hover:text-white hover:bg-white/5'
                            }`
                          }
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
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
    </Sidebar>
  );
}
