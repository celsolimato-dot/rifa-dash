import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useClientNavigation } from "@/hooks/useClientNavigation";
import { ClientSidebar } from "@/components/ClientSidebar";
import { ClientDashboardSection } from "@/components/client-sections/ClientDashboardSection";
import { ClientRifasSection } from "@/components/client-sections/ClientRifasSection";
import { ClientHistoricoSection } from "@/components/client-sections/ClientHistoricoSection";
import { ClientPerfilSection } from "@/components/client-sections/ClientPerfilSection";
import { ClientMensagensSection } from "@/components/client-sections/ClientMensagensSection";
import { ClientSuporteSection } from "@/components/client-sections/ClientSuporteSection";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    currentSection,
    breadcrumb,
    navigateToSection,
    goBack,
    canGoBack
  } = useClientNavigation('dashboard');

  // Função para renderizar o conteúdo baseado na seção atual
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <ClientDashboardSection />;
      case 'rifas':
        return <ClientRifasSection />;
      case 'historico':
        return <ClientHistoricoSection />;
      case 'perfil':
        return <ClientPerfilSection />;
      case 'mensagens':
        return <ClientMensagensSection />;
      case 'suporte':
        return <ClientSuporteSection />;
      default:
        return <ClientDashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <ClientSidebar
        activeSection={currentSection}
        onSectionChange={navigateToSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header com Breadcrumb */}
        <header className="bg-background-secondary border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {canGoBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="text-foreground-muted hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToSection('dashboard')}
                      className="h-auto p-1 text-foreground-muted hover:text-foreground"
                    >
                      <Home className="w-4 h-4" />
                    </Button>
                  </BreadcrumbItem>
                  {breadcrumb.map((item, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <span className="text-muted-foreground">/</span>}
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-foreground">
                          {item}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="text-sm text-foreground-muted">
              Bem-vindo, <span className="font-medium text-foreground">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderCurrentSection()}
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;