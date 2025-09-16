import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Trophy, Timer } from "lucide-react";

interface RaffleCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  totalTickets: number;
  soldTickets: number;
  drawDate: string;
  timeLeft: string;
  featured?: boolean;
}

const RaffleCard = ({ 
  title, 
  image, 
  price, 
  totalTickets, 
  soldTickets, 
  drawDate, 
  timeLeft,
  featured = false 
}: RaffleCardProps) => {
  const progress = (soldTickets / totalTickets) * 100;
  const remainingTickets = totalTickets - soldTickets;
  
  return (
    <div className={`group relative bg-gradient-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-border-hover hover:shadow-card-hover hover:scale-105 ${
      featured ? 'ring-2 ring-accent-gold ring-opacity-50' : ''
    }`}>
      {/* Featured Badge */}
      {featured && (
        <Badge className="absolute top-3 left-3 z-10 bg-gradient-gold text-primary-foreground">
          <Trophy className="w-3 h-3 mr-1" />
          Em Destaque
        </Badge>
      )}
      
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        {/* Timer Badge */}
        <Badge className="absolute top-3 right-3 bg-background-secondary/80 backdrop-blur-sm text-foreground">
          <Timer className="w-3 h-3 mr-1" />
          {timeLeft}
        </Badge>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        
        {/* Title & Price */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-accent-gold">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-sm text-foreground-muted">por número</span>
          </div>
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">Progresso da Rifa</span>
            <span className="text-foreground font-medium">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {soldTickets} vendidos
            </span>
            <span>{remainingTickets} restantes</span>
          </div>
        </div>
        
        {/* Draw Date */}
        <div className="flex items-center text-sm text-foreground-muted">
          <Calendar className="w-4 h-4 mr-2 text-primary" />
          Sorteio em: <span className="font-medium ml-1">{drawDate}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="hero" className="flex-1">
            Participar Agora
          </Button>
          <Button variant="outline" size="default">
            Ver Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RaffleCard;