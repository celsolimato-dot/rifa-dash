import { Button } from "@/components/ui/button";
import { Menu, User, LogIn } from "lucide-react";

const Header = () => {
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
            <a href="#" className="text-foreground-muted hover:text-primary transition-colors">
              Rifas Ativas
            </a>
            <a href="#" className="text-foreground-muted hover:text-primary transition-colors">
              Ganhadores
            </a>
            <a href="#" className="text-foreground-muted hover:text-primary transition-colors">
              Como Funciona
            </a>
            <a href="#" className="text-foreground-muted hover:text-primary transition-colors">
              Contato
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <User className="w-4 h-4 mr-2" />
              Minha Conta
            </Button>
            <Button variant="hero" size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
            
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