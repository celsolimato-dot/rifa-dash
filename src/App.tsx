import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { TestimonialsProvider } from "@/contexts/TestimonialsContext";
import { NextDrawProvider } from "@/contexts/NextDrawContext";
import { NextDrawCardProvider } from "@/contexts/NextDrawCardContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";
import BackToTop from "@/components/BackToTop";
import Index from "./pages/Index";
import PublicRaffles from "./pages/PublicRaffles";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ActiveRaffles from "./pages/ActiveRaffles";
import AllRaffles from "./pages/AllRaffles";
import NewRaffle from "./pages/NewRaffle";
import EditRaffle from "./pages/EditRaffle";
import Participants from "./pages/Participants";
import Sorteador from "./pages/Sorteador";
import Reports from "./pages/Reports";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import TestimonialsManagement from "./pages/TestimonialsManagement";
import NextDrawManagement from "./pages/NextDrawManagement";
import NextDrawCardManagement from "./pages/NextDrawCardManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <AuthProvider>
        <TestimonialsProvider>
          <NextDrawProvider>
            <NextDrawCardProvider>
              <TooltipProvider>
              <Toaster />
        <Sonner />
        <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/rifas" element={<PublicRaffles />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminLayout>
                          <Routes>
                            <Route index element={<AdminDashboard />} />
                            <Route path="rifas" element={<ActiveRaffles />} />
                            <Route path="todas-rifas" element={<AllRaffles />} />
                            <Route path="participantes" element={<Participants />} />
                            <Route path="sorteador" element={<Sorteador />} />
                            <Route path="relatorios" element={<Reports />} />
                            <Route path="mensagens" element={<Messages />} />
                            <Route path="configuracoes" element={<Settings />} />
                            <Route path="depoimentos" element={<TestimonialsManagement />} />
                            <Route path="proximo-sorteio" element={<NextDrawManagement />} />
                            <Route path="card-sorteio" element={<NextDrawCardManagement />} />
                            <Route path="rifas/nova" element={<NewRaffle />} />
                            <Route path="rifas/editar/:id" element={<EditRaffle />} />
                          </Routes>
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Protected Client Routes */}
                  <Route
                    path="/cliente"
                    element={
                      <ProtectedRoute requiredRole="client">
                        <ClientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Redirects */}
                  <Route 
                    path="/dashboard" 
                    element={<Navigate to="/cliente" replace />} 
                  />
                  <Route 
                    path="/painel" 
                    element={<Navigate to="/admin" replace />} 
                  />
                  
                  {/* 404 - Must be last */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <BackToTop />
              </BrowserRouter>
              </TooltipProvider>
            </NextDrawCardProvider>
          </NextDrawProvider>
        </TestimonialsProvider>
      </AuthProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
