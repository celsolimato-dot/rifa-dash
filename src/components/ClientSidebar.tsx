import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard,
  Ticket,
  History,
  User,
  MessageCircle,
  HeadphonesIcon,
  LogOut,
  Home,
  Trophy,
  Bell,
  Settings
} from "lucide-react";

interface ClientSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  openTickets?: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  description?: string;
}

export const ClientSidebar: React.FC<ClientSidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  openTickets = 0 
}) => {
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Visão geral da conta'
    },
    {
      id: 'rifas',
      label: 'Minhas Rifas',
      icon: <Ticket className="w-5 h-5" />,
      description: 'Participações ativas'
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: <History className="w-5 h-5" />,
      description: 'Transações e participações'
    },
    {
      id: 'perfil',
      label: 'Meu Perfil',
      icon: <User className="w-5 h-5" />,
      description: 'Informações pessoais'
    },
    {
      id: 'suporte',
      label: 'Suporte',
      icon: <HeadphonesIcon className="w-5 h-5" />,
      badge: openTickets,
      description: 'Atendimento e tickets'
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
  };

  return (
    <div className="w-64 bg-gradient-card border-r border-border h-full flex flex-col">
      {/* Header do Sidebar */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <div>
            <h2 className="font-bold text-foreground">Rifa Dash</h2>
            <p className="text-xs text-foreground-muted">Painel do Cliente</p>
          </div>
        </div>
      </div>

      {/* Informações do Usuário */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-foreground-muted truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={`w-full justify-start h-auto p-3 ${
              activeSection === item.id 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-muted"
            }`}
            onClick={() => handleSectionClick(item.id)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                {item.icon}
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-xs opacity-70">{item.description}</div>
                  )}
                </div>
              </div>
              {item.badge && item.badge > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
          </Button>
        ))}
      </nav>

      {/* Ações do Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => window.open('/', '_blank')}
        >
          <Home className="w-4 h-4 mr-3" />
          Voltar ao Site
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
};