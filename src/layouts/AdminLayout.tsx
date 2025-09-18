import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminProfileModal } from "@/components/AdminProfileModal";
import { ReactNode, useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 bg-background-secondary border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="lg:hidden" />
              <h1 className="text-xl font-semibold text-foreground hidden sm:block">
                Painel Administrativo
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent-gold rounded-full flex items-center justify-center text-xs text-primary-foreground">
                  3
                </span>
              </Button>
              
              {/* Admin Info */}
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className="text-right">
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <p className="text-foreground-muted">Administrador</p>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                >
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0)}
                  </span>
                </button>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>

        {/* Admin Profile Modal */}
        <AdminProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;