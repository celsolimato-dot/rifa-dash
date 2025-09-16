import { Button } from "@/components/ui/button";
import { Menu, User, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              RIFOU.NET
            </h1>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#rifas" className="text-foreground-muted hover:text-primary transition-colors">
              Rifas Ativas
            </a>
            <a href="#ganhadores" className="text-foreground-muted hover:text-primary transition-colors">
              Ganhadores
            </a>
            <a href="#como-funciona" className="text-foreground-muted hover:text-primary transition-colors">
              Como Funciona
            </a>
            <a href="#contato" className="text-foreground-muted hover:text-primary transition-colors">
              Contato
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              // Authenticated User
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                  <a href={user.role === 'admin' ? '/admin' : '/cliente'}>
                    <User className="w-4 h-4 mr-2" />
                    {user.role === 'admin' ? 'Painel Admin' : 'Minha Conta'}
                  </a>
                </Button>
                
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {user.name.charAt(0)}
                  </span>
                </div>
              </div>
            ) : (
              // Not Authenticated
              <>
                <Button variant="ghost" size="sm" className="hidden md:flex" asChild>
                  <a href="/auth">
                    <User className="w-4 h-4 mr-2" />
                    Minha Conta
                  </a>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <a href="/auth">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </a>
                </Button>
              </>
            )}
            
            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;