import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  CreditCard, 
  Users, 
  Trophy, 
  CheckCircle, 
  Sparkles 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNextDrawCard } from "@/contexts/NextDrawCardContext";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Escolha sua Rifa",
    description: "Navegue pelas rifas ativas e escolha aquela com o prêmio dos seus sonhos. Todas são 100% confiáveis!",
    color: "text-primary"
  },
  {
    icon: CreditCard,
    number: "02", 
    title: "Selecione seus Números",
    description: "Escolha quantos números quiser aumentar suas chances. Pagamento seguro via Pix ou cartão de crédito.",
    color: "text-accent-success"
  },
  {
    icon: Users,
    number: "03",
    title: "Aguarde o Sorteio",
    description: "Acompanhe o progresso da rifa e receba notificações. Todos os sorteios são transparentes e ao vivo!",
    color: "text-accent-gold"
  },
  {
    icon: Trophy,
    number: "04",
    title: "Ganhe e Comemore!",
    description: "Se for sorteado, você será contactado imediatamente. Seu prêmio será entregue rapidamente!",
    color: "text-primary"
  }
];

const features = [
  "✅ Sorteios 100% transparentes",
  "✅ Pagamentos seguros", 
  "✅ Prêmios garantidos",
  "✅ Suporte 24/7"
];

const HowItWorks = () => {
  const navigate = useNavigate();
  const { cardData, isLoading } = useNextDrawCard();
  
  const handleSmoothScroll = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleParticipate = () => {
    navigate('/auth');
  };

  return (
    <section id="como-funciona" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-accent-gold animate-float" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Como <span className="bg-gradient-primary bg-clip-text text-transparent">Funciona?</span>
            </h2>
            <Sparkles className="w-6 h-6 text-accent-gold animate-float" style={{ animationDelay: "1s" }} />
          </div>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Participar é super fácil! Siga estes 4 passos simples e concorra aos melhores prêmios.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card 
                key={index}
                className="relative p-6 text-center bg-gradient-card border-border hover:border-border-hover transition-all duration-300 hover:shadow-card-hover group"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-glow">
                    {step.number}
                  </div>
                </div>
                
                {/* Icon */}
                <div className="mt-4 mb-4 flex justify-center">
                  <div className={`p-3 rounded-full bg-background-secondary group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${step.color}`} />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {step.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Features & CTA */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Features */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Por que escolher a <span className="text-primary">RIFOU.NET</span>?
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-background-secondary rounded-lg border border-border hover:border-border-hover transition-colors"
                >
                  <CheckCircle className="w-5 h-5 text-accent-success flex-shrink-0" />
                  <span className="text-foreground-muted text-sm">{feature.slice(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <Button 
                variant="success" 
                size="lg" 
                className="w-full sm:w-auto cursor-pointer"
                onClick={() => handleSmoothScroll('rifas')}
              >
                Começar Agora
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-card border-border text-center">
              <div className="space-y-4">
                <Trophy className="w-12 h-12 text-accent-gold mx-auto" />
                <h4 className="text-xl font-semibold text-foreground">Próximo Sorteio</h4>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">
                    {isLoading ? "Carregando..." : cardData?.time || "Aguarde..."}
                  </div>
                  <p className="text-foreground-muted">
                    {isLoading ? "Carregando dados..." : cardData?.prize || "Próximo sorteio em breve"}
                  </p>
                </div>
                <Button 
                  variant="gold" 
                  className="w-full cursor-pointer"
                  onClick={handleParticipate}
                >
                  Participar Agora
                </Button>
              </div>
            </Card>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-background-secondary border-border text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-foreground-muted">Ganhadores</div>
              </Card>
              <Card className="p-4 bg-background-secondary border-border text-center">
                <div className="text-2xl font-bold text-accent-gold">R$ 2M+</div>
                <div className="text-sm text-foreground-muted">Pagos</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;