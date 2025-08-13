
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Zap, 
  Settings, 
  Scissors, 
  Droplets, 
  Search, 
  Leaf,
  ChevronDown
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainNavItems = [
  {
    title: "Daily Generation Data",
    url: "/generation",
    icon: Zap,
  }
];

const operationsItems = [
  {
    title: "Grass Cutting",
    url: "/grass-cutting",
    icon: Scissors,
  },
  {
    title: "Cleaning",
    url: "/cleaning",
    icon: Droplets,
  },
  {
    title: "Field Inspection",
    url: "/field-inspection",
    icon: Search,
  },
  {
    title: "Vegetation",
    url: "/vegetation",
    icon: Leaf,
  }
];

export function VerdoSidebar() {
  const { state } = useSidebar();
  const [operationsOpen, setOperationsOpen] = useState(true);
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar 
      className="verdo-sidebar border-r-0" 
      collapsible="icon"
    >
      <SidebarContent className={`${isCollapsed ? 'p-2' : 'p-4'} transition-all duration-200`}>
        {/* Header */}
        <div className={`${isCollapsed ? 'mb-4' : 'mb-8'} flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'}`}>
          <div className="w-8 h-8 bg-verdo-jade rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">Verdo</h1>
              <p className="text-xs text-gray-400">by TruGreen</p>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `verdo-nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations Section */}
        <SidebarGroup>
          <Collapsible open={!isCollapsed && operationsOpen} onOpenChange={setOperationsOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel 
                className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between'} text-gray-300 hover:text-white cursor-pointer py-2 px-2 rounded-lg hover:bg-verdo-navy-light transition-colors`}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'gap-2'}`}>
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">Daily Operations</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${operationsOpen ? 'rotate-180' : ''}`} 
                  />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent className="mt-2">
                <SidebarMenu>
                  {operationsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            `verdo-nav-item ${isCollapsed ? 'justify-center' : 'ml-2'} ${isActive ? 'active' : ''}`
                          }
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && <span className="font-medium">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
