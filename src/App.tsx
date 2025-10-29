
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ClientProvider } from "./contexts/ClientContext";
import Index from "./pages/Index";
import GenerationData from "./pages/GenerationData";
import GrassCutting from "./pages/GrassCutting";
import Cleaning from "./pages/Cleaning";
import FieldInspection from "./pages/FieldInspection";
import Vegetation from "./pages/Vegetation";
import OperationsHub from "./pages/OperationsHub";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import ClientManagement from "./pages/ClientManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClientProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/generation" element={<GenerationData />} />
              <Route path="/operations" element={<OperationsHub />} />
              <Route path="/grass-cutting" element={<GrassCutting />} />
              <Route path="/cleaning" element={<Cleaning />} />
              <Route path="/field-inspection" element={<FieldInspection />} />
              <Route path="/vegetation" element={<Vegetation />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/clients" element={<ClientManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ClientProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
