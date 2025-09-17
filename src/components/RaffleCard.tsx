import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Trophy, Eye, Timer, Calendar } from "lucide-react";
import { NumberSelectionModal } from "./NumberSelectionModal";
import { AuthModal } from "./AuthModal";
import { RaffleDetailsModal } from "./RaffleDetailsModal";
import { useAuth } from "@/contexts/AuthContext";

interface RaffleData {
  id: string;
  title: string;
  description?: string;
  image: string;
  price: number;
  totalTickets: number;
  soldTickets: number;
  drawDate: string;
  timeLeft?: string;
  status?: string;
  featured?: boolean;
  institution?: string;
  rules?: string;
  prizeValue?: number;
}

interface RaffleCardProps {
  // Aceita tanto um objeto raffle quanto props individuais
  raffle?: RaffleData;
  isActive?: boolean;
  // Props individuais (para compatibilidade)
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  price?: number;
  totalTickets?: number;
  soldTickets?: number;
  drawDate?: string;
  timeLeft?: string;
  status?: string;
  featured?: boolean;
  institution?: string;
  rules?: string;
  prizeValue?: number;
}

export const RaffleCard: React.FC<RaffleCardProps> = (props) => {
  // Se raffle foi passado como prop, usa ele; senão usa as props individuais
  const raffleData = props.raffle || {
    id: props.id || '',
    title: props.title || '',
    description: props.description,
    image: props.image || '',
    price: props.price || 0,
    totalTickets: props.totalTickets || 0,
    soldTickets: props.soldTickets || 0,
    drawDate: props.drawDate || '',
    timeLeft: props.timeLeft,
    status: props.status,
    featured: props.featured || false,
    institution: props.institution,
    rules: props.rules,
    prizeValue: props.prizeValue
  };

  const {
    id,
    title,
    description,
    image, 
    price, 
    totalTickets, 
    soldTickets, 
    drawDate, 
    timeLeft,
    status,
    featured = false,
    institution,
    rules,
    prizeValue
  } = raffleData;
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Validações para evitar erros
  const safePrice = typeof price === 'number' ? price : 0;
  const safeTotalTickets = typeof totalTickets === 'number' ? totalTickets : 0;
  const safeSoldTickets = typeof soldTickets === 'number' ? soldTickets : 0;
  
  const progress = safeTotalTickets > 0 ? (safeSoldTickets / safeTotalTickets) * 100 : 0;
  const remainingTickets = safeTotalTickets - safeSoldTickets;

  const handleParticipate = () => {
    if (user) {
      // Usuário logado - abrir modal de seleção de números
      setIsModalOpen(true);
    } else {
      // Usuário não logado - abrir modal de autenticação
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    // Após login bem-sucedido, abrir modal de seleção de números
    setIsAuthModalOpen(false);
    setIsModalOpen(true);
  };

  const handleViewDetails = () => {
    setIsDetailsModalOpen(true);
  };

  const handleParticipateFromDetails = () => {
    setIsDetailsModalOpen(false);
    handleParticipate();
  };
  
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
              R$ {safePrice.toFixed(2).replace('.', ',')}
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
              {safeSoldTickets} vendidos
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
          <Button 
            variant="hero" 
            className="flex-1 cursor-pointer"
            onClick={handleParticipate}
          >
            Participar Agora
          </Button>
          <Button variant="outline" size="default" onClick={handleViewDetails}>
            Ver Detalhes
          </Button>
        </div>
      </div>

      {/* Modal de Seleção de Números */}
      <NumberSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        raffle={{
          id: id || '',
          title: title || '',
          image: image || '',
          price: safePrice,
          totalTickets: safeTotalTickets,
          soldTickets: safeSoldTickets,
          drawDate: drawDate || ''
        }}
      />

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Modal de Detalhes */}
      <RaffleDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onParticipate={handleParticipateFromDetails}
        raffle={{
          id: id || '',
          title: title || '',
          description,
          image: image || '',
          price: safePrice,
          totalTickets: safeTotalTickets,
          soldTickets: safeSoldTickets,
          drawDate: drawDate || '',
          timeLeft,
          status,
          featured,
          institution,
          rules,
          prizeValue
        }}
      />
    </div>
  );
};