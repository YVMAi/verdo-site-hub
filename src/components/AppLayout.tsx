
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VerdoSidebar } from "./VerdoSidebar";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isFullWidthPage = location.pathname === '/operations' 
    || location.pathname === '/generation'
    || location.pathname === '/reports'
    || location.pathname.startsWith('/admin/');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <VerdoSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          {!isFullWidthPage && (
            <header className="h-16 bg-white border-b border-border flex items-center px-6 md:hidden">
              <SidebarTrigger>
                <Menu className="w-6 h-6 text-gray-600" />
              </SidebarTrigger>
              <h1 className="ml-4 text-xl font-bold text-verdo-navy">Verdo</h1>
            </header>
          )}

          {/* Desktop Trigger - Outside of sidebar */}
          <div className="hidden md:block fixed top-4 left-4 z-50">
            <SidebarTrigger className="bg-white shadow-lg border border-gray-200 hover:bg-gray-50 rounded-lg p-2">
              <Menu className="w-5 h-5 text-gray-600" />
            </SidebarTrigger>
          </div>

          {/* Main Content */}
          <main className={isFullWidthPage ? "flex-1" : "flex-1 p-6 md:p-8 md:pl-16"}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
