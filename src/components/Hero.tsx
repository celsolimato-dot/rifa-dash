import { Button } from "@/components/ui/button";
import { Trophy, Shield, Zap } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  const handleSmoothScroll = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
      <div className="absolute inset-0 bg-gradient-dark opacity-80" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="text-foreground">Sua </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Sorte</span>
            <br />
            <span className="text-foreground">Começa </span>
            <span className="bg-gradient-gold bg-clip-text text-transparent">Aqui</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed">
            A plataforma de rifas mais <strong className="text-primary">confiável</strong> e <strong className="text-accent-gold">transparente</strong> do Brasil. 
            Participe dos melhores sorteios e concorra a prêmios incríveis!
          </p>
          
          {/* Features Pills */}
          <div className="flex flex-wrap justify-center gap-4 py-6">
            <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-border rounded-full px-4 py-2">
              <Shield className="w-4 h-4 text-accent-success" />
              <span className="text-sm text-foreground-muted">100% Seguro</span>
            </div>
            <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-border rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground-muted">Sorteios Transparentes</span>
            </div>
            <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-border rounded-full px-4 py-2">
              <Trophy className="w-4 h-4 text-accent-gold" />
              <span className="text-sm text-foreground-muted">Prêmios Incríveis</span>
            </div>
          </div>
          
          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-6 animate-glow-pulse cursor-pointer"
              onClick={() => handleSmoothScroll('rifas')}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Ver Rifas Ativas
            </Button>
            <Button 
              variant="premium" 
              size="lg" 
              className="text-lg px-8 py-6 cursor-pointer"
              onClick={() => handleSmoothScroll('como-funciona')}
            >
              Como Funciona
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-foreground-muted">Participantes</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-accent-gold">R$ 2M+</div>
              <div className="text-sm text-foreground-muted">Em Prêmios</div>
            </div>
            <div className="text-center space-y-2 col-span-2 md:col-span-1">
              <div className="text-2xl md:text-3xl font-bold text-accent-success">100%</div>
              <div className="text-sm text-foreground-muted">Confiabilidade</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float" />
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-accent-gold/10 rounded-full animate-float" style={{ animationDelay: "1s" }} />
    </section>
  );
};

export default Hero;