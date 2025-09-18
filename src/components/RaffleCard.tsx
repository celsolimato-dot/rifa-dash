import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Trophy, Eye, Timer, Calendar } from "lucide-react";
import { ImageCarousel } from "./ImageCarousel";
import { NumberSelectionModal } from "./NumberSelectionModal";
import { AuthModal } from "./AuthModal";
import { RaffleDetailsModal } from "./RaffleDetailsModal";
import { useAuth } from "@/contexts/AuthContext";

interface RaffleData {
  id: string;
  title: string;
  description?: string;
  image: string;
  images?: string[];  // Nova propriedade para múltiplas imagens
  prize: string;
  prizeValue: number;
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  drawDate: string | Date;
  timeLeft?: string;
  status?: string;
  featured?: boolean;
  institution?: string;
  rules?: string;
  imageUrl?: string;
}

interface RaffleCardProps {
  // Aceita tanto um objeto raffle quanto props individuais
  raffle?: RaffleData;
  isActive?: boolean;
  // Props individuais (para compatibilidade)
  id?: string;
  title?: string;
  prize?: string;
  prizeValue?: number;
  ticketPrice?: number;
  description?: string;
  image?: string;
  images?: string[];  // Nova propriedade para múltiplas imagens
  imageUrl?: string;
  totalTickets?: number;
  soldTickets?: number;
  drawDate?: string | Date;
  timeLeft?: string;
  status?: string;
  featured?: boolean;
  institution?: string;
  rules?: string;
}

export const RaffleCard: React.FC<RaffleCardProps> = (props) => {
  // Se raffle foi passado como prop, usa ele; senão usa as props individuais
  const raffleData = props.raffle || {
    id: props.id || '',
    title: props.title || '',
    prize: props.prize || '',
    prizeValue: props.prizeValue || 0,
    ticketPrice: props.ticketPrice || 0,
    description: props.description,
    image: props.image || props.imageUrl || '',
    images: props.images || (props.image ? [props.image] : []) || (props.imageUrl ? [props.imageUrl] : []),
    totalTickets: props.totalTickets || 0,
    soldTickets: props.soldTickets || 0,
    drawDate: props.drawDate || '',
    timeLeft: props.timeLeft,
    status: props.status,
    featured: props.featured || false,
    institution: props.institution,
    rules: props.rules,
  };

  const {
    id,
    title,
    prize,
    prizeValue,
    ticketPrice,
    description,
    image, 
    images = [],
    totalTickets, 
    soldTickets, 
    drawDate, 
    timeLeft,
    status,
    featured = false,
    institution,
    rules,
  } = raffleData;
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Validações para evitar erros
  const safeTicketPrice = typeof ticketPrice === 'number' ? ticketPrice : 0;
  const safeTotalTickets = typeof totalTickets === 'number' ? totalTickets : 0;
  const safeSoldTickets = typeof soldTickets === 'number' ? soldTickets : 0;
  const safePrizeValue = typeof prizeValue === 'number' ? prizeValue : 0;
  
  // Converter drawDate para string se for Date
  const drawDateString = drawDate instanceof Date ? drawDate.toLocaleDateString('pt-BR') : drawDate;
  
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
    <div className={`group relative bg-gradient-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-border-hover hover:shadow-card-hover hover-scale ${
      featured ? 'ring-2 ring-accent-gold ring-opacity-50' : ''
    }`}>
      
      {/* Enhanced Image Section with Custom Carousel */}
      <div className="relative group/image overflow-hidden">
        <ImageCarousel 
          images={images.length > 0 ? images : (image ? [image] : [])} 
          title={title}
          className="hover:scale-105 transition-transform duration-700"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {featured && (
            <Badge className="bg-gradient-gold text-primary-foreground shadow-lg animate-pulse">
              <Trophy className="w-3 h-3 mr-1" />
              Em Destaque
            </Badge>
          )}
        </div>
        
        {/* Status Badge */}
        <Badge className="absolute top-3 right-3 z-10 bg-green-500/90 text-white shadow-lg animate-fade-in">
          Rifa Ativa
        </Badge>
      </div>
      
      {/* Enhanced Content */}
      <div className="p-6 space-y-4">
        
        {/* Title & Price */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {title}
          </h3>
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-foreground-muted text-sm block">Preço do Bilhete</span>
                <span className="text-3xl font-bold text-accent-gold">
                  R$ {safeTicketPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <span className="text-sm text-foreground-muted font-medium">por número</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted font-medium">Progresso da Rifa</span>
            <span className="text-foreground font-bold">{progress.toFixed(0)}%</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3 bg-background-secondary/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full opacity-50"></div>
          </div>
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="flex items-center font-medium">
              <Users className="w-3 h-3 mr-1" />
              {safeSoldTickets} vendidos
            </span>
            <span className="font-medium">{remainingTickets} restantes</span>
          </div>
        </div>
        
        {/* Draw Date */}
        <div className="flex items-center justify-center text-sm text-foreground-muted bg-background-secondary/40 rounded-lg p-3 border border-background-secondary">
          <Calendar className="w-4 h-4 mr-2 text-primary" />
          <span className="font-medium">
            Sorteio: {drawDateString ? new Date(drawDateString).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            }) : 'Data a definir'}
          </span>
        </div>
        
        {/* Enhanced Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="hero" 
            className="flex-1 cursor-pointer bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold py-3 rounded-xl transition-all duration-300 hover-scale shadow-lg hover:shadow-primary/25"
            onClick={handleParticipate}
          >
            <Trophy className="w-4 h-4 mr-2 text-white" />
            Participar Agora
          </Button>
          <Button 
            variant="outline" 
            size="default" 
            onClick={handleViewDetails}
            className="border-primary/30 text-primary hover:bg-primary/5 font-semibold py-3 rounded-xl transition-all duration-300 hover-scale"
          >
            <Eye className="w-4 h-4 mr-1" />
            Detalhes
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
          price: safeTicketPrice,
          totalTickets: safeTotalTickets,
          soldTickets: safeSoldTickets,
          drawDate: drawDateString || ''
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
          images: images.length > 0 ? images : (image ? [image] : []),
          price: safeTicketPrice,
          prizeValue: safePrizeValue,
          totalTickets: safeTotalTickets,
          soldTickets: safeSoldTickets,
          drawDate: drawDateString || '',
          timeLeft,
          status,
          featured,
          institution,
          rules,
        }}
      />
    </div>
  );
};