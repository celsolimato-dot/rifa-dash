import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-16 h-16 text-destructive" />
          </div>
        </div>
        
        {/* Error Content */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Página Não Encontrada
          </h2>
          <p className="text-foreground-muted leading-relaxed">
            Ops! A página que você está procurando não existe ou foi movida. 
            Que tal voltar para as rifas incríveis que temos disponíveis?
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button 
            variant="hero" 
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/rifas')}
          >
            Ver Rifas Ativas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
