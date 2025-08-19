
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
import Operations from "./pages/Operations";
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
              <Route path="/grass-cutting" element={<GrassCutting />} />
              <Route path="/cleaning" element={<Cleaning />} />
              <Route path="/field-inspection" element={<FieldInspection />} />
              <Route path="/vegetation" element={<Vegetation />} />
              <Route path="/operations" element={<Operations />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ClientProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
