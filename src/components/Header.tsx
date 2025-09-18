import { Button } from "@/components/ui/button";
import { Menu, User, LogIn, MessageCircle, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    closeMobileMenu(); // Fechar menu ao clicar nos links
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/');
    closeMobileMenu();
  };

  const handleVerRifasClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/rifas');
    closeMobileMenu();
  };

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
            <a 
              href="/" 
              onClick={handleHomeClick}
              className="text-foreground-muted hover:text-primary transition-colors cursor-pointer"
            >
              Home
            </a>
            <a 
              href="#rifas" 
              onClick={(e) => handleSmoothScroll(e, 'rifas')}
              className="text-foreground-muted hover:text-primary transition-colors cursor-pointer"
            >
              Rifas Ativas
            </a>
            <a 
              href="#ganhadores" 
              onClick={(e) => handleSmoothScroll(e, 'ganhadores')}
              className="text-foreground-muted hover:text-primary transition-colors cursor-pointer"
            >
              Ganhadores
            </a>
            <a 
              href="#como-funciona" 
              onClick={(e) => handleSmoothScroll(e, 'como-funciona')}
              className="text-foreground-muted hover:text-primary transition-colors cursor-pointer"
            >
              Como Funciona
            </a>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleVerRifasClick}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Ver Rifas
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open('https://wa.me/5563992940044', '_blank')}
              className="text-foreground-muted hover:text-primary hover:bg-accent"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contato
            </Button>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              // Authenticated User
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:flex"
                  onClick={() => navigate(user.role === 'admin' ? '/admin' : '/cliente')}
                >
                  <User className="w-4 h-4 mr-2" />
                  {user.role === 'admin' ? 'Painel Admin' : 'Minha Conta'}
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:flex"
                  onClick={() => navigate('/auth')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Minha Conta
                </Button>
                <Button 
                  variant="hero" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </>
            )}
            
            {/* Mobile Menu */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="absolute top-20 left-0 right-0 bg-background border-b border-border shadow-lg">
            <nav className="container mx-auto px-4 py-6 space-y-4">
              <a 
                href="/" 
                onClick={handleHomeClick}
                className="block py-3 text-foreground hover:text-primary transition-colors border-b border-border/50"
              >
                Home
              </a>
              <a 
                href="#rifas" 
                onClick={(e) => handleSmoothScroll(e, 'rifas')}
                className="block py-3 text-foreground hover:text-primary transition-colors border-b border-border/50"
              >
                Rifas Ativas
              </a>
              <a 
                href="#ganhadores" 
                onClick={(e) => handleSmoothScroll(e, 'ganhadores')}
                className="block py-3 text-foreground hover:text-primary transition-colors border-b border-border/50"
              >
                Ganhadores
              </a>
              <a 
                href="#como-funciona" 
                onClick={(e) => handleSmoothScroll(e, 'como-funciona')}
                className="block py-3 text-foreground hover:text-primary transition-colors border-b border-border/50"
              >
                Como Funciona
              </a>
              
              <div className="space-y-3 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleVerRifasClick}
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Ver Rifas
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    window.open('https://wa.me/5563992940044', '_blank');
                    closeMobileMenu();
                  }}
                  className="w-full text-foreground-muted hover:text-primary hover:bg-accent"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contato
                </Button>
                
                {user ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      navigate(user.role === 'admin' ? '/admin' : '/cliente');
                      closeMobileMenu();
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user.role === 'admin' ? 'Painel Admin' : 'Minha Conta'}
                  </Button>
                ) : (
                  <Button 
                    variant="hero" 
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigate('/auth');
                      closeMobileMenu();
                    }}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;