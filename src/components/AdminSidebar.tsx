import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Settings, 
  Shuffle,
  BarChart3,
  PlusCircle,
  MessageCircle,
  LogOut,
  ChevronDown
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const mainMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Rifas Ativas", url: "/admin/rifas", icon: Trophy },
  { title: "Participantes", url: "/admin/participantes", icon: Users },
  { title: "Sorteador", url: "/admin/sorteador", icon: Shuffle },
  { title: "Relatórios", url: "/admin/relatorios", icon: BarChart3 },
];

const managementItems = [
  { title: "Nova Rifa", url: "/admin/rifas/nova", icon: PlusCircle },
  { title: "Mensagens", url: "/admin/mensagens", icon: MessageCircle },
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [managementOpen, setManagementOpen] = useState(true);
  
  const currentPath = location.pathname;
  const isActive = (path: string, exact = false) => 
    exact ? currentPath === path : currentPath.startsWith(path);
  
  const getNavClass = (path: string, exact = false) =>
    isActive(path, exact) 
      ? "bg-primary/10 text-primary border-r-2 border-primary" 
      : "hover:bg-background-secondary/50";

  return (
    <Sidebar
      className="w-64"
    >
      {/* Header */}
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div>
            <h2 className="font-bold text-foreground">Admin Panel</h2>
            <p className="text-xs text-foreground-muted">RIFOU.NET</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.exact}
                      className={getNavClass(item.url, item.exact)}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center justify-between w-full">
              <span>Gestão</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setManagementOpen(!managementOpen)}
                className="h-4 w-4 p-0"
              >
                <ChevronDown 
                  className={`h-3 w-3 transition-transform ${managementOpen ? 'rotate-180' : ''}`} 
                />
              </Button>
            </div>
          </SidebarGroupLabel>
          
          {managementOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {managementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={getNavClass(item.url)}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border p-4">
        <div className="space-y-3">
          
          {/* User Info */}
          {user && (
            <div className="p-3 bg-background-secondary rounded-lg">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-foreground-muted">{user.email}</p>
            </div>
          )}
          
          {/* Logout Button */}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="ml-2">Sair</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}