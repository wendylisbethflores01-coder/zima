import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Agents from "./pages/Agents";
import Asesores from "./pages/Asesores";
import Oficinas from "./pages/Oficinas";
import Auth from "./pages/Auth";
import AdminAmenities from "./pages/AdminAmenities";
import AdminPropertyTypes from "./pages/AdminPropertyTypes";
import PasswordRecovery from "./pages/PasswordRecovery";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import AgentEditProperties from "./pages/AgentEditProperties";
import LibroReclamaciones from "./pages/LibroReclamaciones";
import AdminReclamaciones from "./pages/AdminReclamaciones";
import ReclamacionesLogin from "./pages/ReclamacionesLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/propiedades" element={<Properties />} />
          <Route path="/propiedad/:id" element={<PropertyDetails />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/password-recovery" element={<PasswordRecovery />} />
          <Route path="/admin" element={<AuthRedirect />} />
          <Route path="/admin/amenities" element={<AdminAmenities />} />
          <Route path="/admin/property-types" element={<AdminPropertyTypes />} />
          <Route path="/agent/edit-properties" element={<AgentEditProperties />} />
          <Route path="/agent-dashboard" element={<AuthRedirect />} />
          <Route path="/agentes" element={<Agents />} />
          <Route path="/oficinas" element={<Oficinas />} />
          <Route path="/asesores" element={<Asesores />} />
          <Route path="/contacto" element={<Index />} />
          <Route path="/libro-reclamaciones" element={<LibroReclamaciones />} />
          <Route path="/reclamaciones-admin/login" element={<ReclamacionesLogin />} />
          <Route path="/reclamaciones-admin" element={
            <ProtectedRoute>
              <AdminReclamaciones />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
