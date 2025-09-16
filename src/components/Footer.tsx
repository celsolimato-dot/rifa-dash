import { Button } from "@/components/ui/button";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Phone, 
  Mail, 
  MapPin,
  Shield,
  Award
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background-tertiary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                RIFOU.NET
              </h3>
            </div>
            
            <p className="text-foreground-muted max-w-md leading-relaxed">
              A plataforma de rifas mais confiável do Brasil. Sorteios transparentes, 
              prêmios garantidos e a chance de realizar seus sonhos.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center space-x-2 bg-background-secondary px-3 py-2 rounded-lg">
                <Shield className="w-4 h-4 text-accent-success" />
                <span className="text-xs text-foreground-muted">SSL Seguro</span>
              </div>
              <div className="flex items-center space-x-2 bg-background-secondary px-3 py-2 rounded-lg">
                <Award className="w-4 h-4 text-accent-gold" />
                <span className="text-xs text-foreground-muted">Licenciado</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Links Rápidos</h4>
            <nav className="space-y-2">
              <a href="#" className="block text-foreground-muted hover:text-primary transition-colors text-sm">
                Rifas Ativas
              </a>
              <a href="#" className="block text-foreground-muted hover:text-primary transition-colors text-sm">
                Como Funciona
              </a>
              <a href="#" className="block text-foreground-muted hover:text-primary transition-colors text-sm">
                Ganhadores
              </a>
              <a href="#" className="block text-foreground-muted hover:text-primary transition-colors text-sm">
                Minha Conta
              </a>
              <a href="#" className="block text-foreground-muted hover:text-primary transition-colors text-sm">
                Suporte
              </a>
            </nav>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground-muted text-sm">(11) 9999-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground-muted text-sm">contato@rifou.net</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground-muted text-sm">
                  São Paulo, SP<br />
                  Brasil
                </span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="pt-4">
              <div className="flex space-x-3">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Legal Links */}
            <div className="flex flex-wrap gap-4 text-xs text-foreground-muted">
              <a href="#" className="hover:text-primary transition-colors">
                Termos de Uso
              </a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">
                Política de Privacidade
              </a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">
                Regulamento
              </a>
            </div>
            
            {/* Copyright */}
            <div className="text-xs text-foreground-muted text-center md:text-right">
              <p>© 2024 RIFOU.NET - Todos os direitos reservados</p>
              <p className="mt-1">CNPJ: XX.XXX.XXX/0001-XX</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;