import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useClientNavigation } from "@/hooks/useClientNavigation";
import { ClientSidebar } from "@/components/ClientSidebar";
import { ClientDashboardSection } from "@/components/client-sections/ClientDashboardSection";
import { ClientRifasSection } from "@/components/client-sections/ClientRifasSection";
import { ClientHistoricoSection } from "@/components/client-sections/ClientHistoricoSection";
import { ClientPerfilSection } from "@/components/client-sections/ClientPerfilSection";
import { ClientSuporteSection } from "@/components/client-sections/ClientSuporteSection";
import ClientAfiliadoSection from "@/components/client-sections/ClientAfiliadoSection";
import { NumberSelectionModal } from "@/components/NumberSelectionModal";
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

  // Estado para controlar o modal de seleção de números
  const [selectedRaffle, setSelectedRaffle] = useState<any>(null);
  const [isNumberModalOpen, setIsNumberModalOpen] = useState(false);

  // Função para abrir o modal de seleção de números
  const handleOpenNumberModal = (raffle: any) => {
    setSelectedRaffle(raffle);
    setIsNumberModalOpen(true);
  };

  // Função para fechar o modal de seleção de números
  const handleCloseNumberModal = () => {
    setIsNumberModalOpen(false);
    setSelectedRaffle(null);
  };

  // Função para renderizar o conteúdo baseado na seção atual
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <ClientDashboardSection />;
      case 'rifas':
        return <ClientRifasSection onOpenNumberModal={handleOpenNumberModal} />;
      case 'historico':
        return <ClientHistoricoSection />;
      case 'afiliado':
        return <ClientAfiliadoSection />;
      case 'perfil':
        return <ClientPerfilSection />;
      case 'suporte':
        return <ClientSuporteSection />;
      default:
        return <ClientDashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <ClientSidebar
        activeSection={currentSection}
        onSectionChange={navigateToSection}
      />

      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen">
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

      {/* Modal de Seleção de Números */}
      {selectedRaffle && (
        <NumberSelectionModal
          isOpen={isNumberModalOpen}
          onClose={handleCloseNumberModal}
          raffle={{
            id: selectedRaffle.id,
            title: selectedRaffle.title,
            image: selectedRaffle.imageUrl || '',
            price: selectedRaffle.ticketPrice,
            totalTickets: selectedRaffle.totalTickets,
            soldTickets: selectedRaffle.soldTickets,
            drawDate: selectedRaffle.drawDate,
          }}
        />
      )}
    </div>
  );
};

export default ClientDashboard;