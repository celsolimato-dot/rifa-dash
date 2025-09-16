import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="rifas" element={<div className="p-8 text-center text-foreground-muted">Página de Rifas em desenvolvimento</div>} />
                      <Route path="participantes" element={<div className="p-8 text-center text-foreground-muted">Página de Participantes em desenvolvimento</div>} />
                      <Route path="sorteador" element={<div className="p-8 text-center text-foreground-muted">Página do Sorteador em desenvolvimento</div>} />
                      <Route path="relatorios" element={<div className="p-8 text-center text-foreground-muted">Página de Relatórios em desenvolvimento</div>} />
                      <Route path="mensagens" element={<div className="p-8 text-center text-foreground-muted">Página de Mensagens em desenvolvimento</div>} />
                      <Route path="configuracoes" element={<div className="p-8 text-center text-foreground-muted">Página de Configurações em desenvolvimento</div>} />
                      <Route path="rifas/nova" element={<div className="p-8 text-center text-foreground-muted">Página Nova Rifa em desenvolvimento</div>} />
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
            
            {/* Fallback redirects for authenticated users */}
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
