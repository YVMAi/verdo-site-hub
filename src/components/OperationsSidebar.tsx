
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Scissors, 
  Droplets, 
  Search, 
  Leaf,
  BarChart3 
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    title: "Inspections",
    url: "/field-inspection", 
    icon: Search,
  },
  {
    title: "Vegetation control",
    url: "/vegetation",
    icon: Leaf,
  },
];

interface OperationsSidebarProps {
  isCollapsed?: boolean;
}

export function OperationsSidebar({ isCollapsed = false }: OperationsSidebarProps) {
  return (
    <div className="space-y-1">
      {/* Main Operations Link */}
      <NavLink
        to="/operations"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          )
        }
      >
        <BarChart3 className="h-4 w-4" />
        {!isCollapsed && <span>Operations Hub</span>}
      </NavLink>

      {/* Sub-menu items */}
      {!isCollapsed && (
        <div className="ml-4 space-y-1 border-l border-border pl-4">
          {operationsItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
