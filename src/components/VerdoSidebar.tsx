
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
      className="verdo-sidebar border-r-0 shadow-xl" 
      collapsible="icon"
    >
      <SidebarContent className="bg-verdo-navy">
        {/* Header */}
        <div className={`${isCollapsed ? 'px-2 py-4' : 'px-6 py-6'} border-b border-verdo-navy-light/20`}>
          <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'}`}>
            <div className="w-10 h-10 bg-verdo-jade rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-2xl font-bold text-white">Verdo</h1>
                <p className="text-sm text-verdo-jade opacity-90">by TruGreen</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-verdo-navy-light/50 transition-all duration-200 font-medium ${
                          isActive ? 'bg-verdo-jade text-white shadow-lg shadow-verdo-jade/20' : ''
                        } ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                      }
                    >
                      <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                      {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations Section */}
        <SidebarGroup className="px-3">
          <Collapsible 
            open={!isCollapsed && operationsOpen} 
            onOpenChange={setOperationsOpen}
            className="space-y-2"
          >
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel 
                className={`group flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white cursor-pointer rounded-xl hover:bg-verdo-navy-light/30 transition-all duration-200 ${
                  isCollapsed ? 'justify-center w-12 h-12 p-0' : 'justify-between'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                  <Settings className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  {!isCollapsed && <span className="font-semibold">Daily Operations</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 ${
                      operationsOpen ? 'rotate-180' : ''
                    }`} 
                  />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1">
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {operationsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-verdo-navy-light/40 transition-all duration-200 font-medium ${
                              isActive ? 'bg-verdo-jade/90 text-white shadow-md' : ''
                            } ${isCollapsed ? 'justify-center w-12 h-12 p-0 rounded-xl' : 'ml-4'}`
                          }
                        >
                          <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                          {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
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
