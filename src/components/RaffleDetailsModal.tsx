import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ImageCarousel } from "./ImageCarousel";
import { 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  DollarSign, 
  Timer, 
  Building,
  Gift,
  X
} from "lucide-react";

interface RaffleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParticipate: () => void;
  raffle: {
    id: string;
    title: string;
    description?: string;
    image: string;
    images?: string[];
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
  };
}

export const RaffleDetailsModal: React.FC<RaffleDetailsModalProps> = ({
  isOpen,
  onClose,
  onParticipate,
  raffle
}) => {
  const progress = (raffle.soldTickets / raffle.totalTickets) * 100;
  const remainingTickets = raffle.totalTickets - raffle.soldTickets;
  const totalRevenue = raffle.soldTickets * raffle.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-bold">{raffle.title}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Imagem Principal com Carousel */}
          <div className="space-y-4">
            <ImageCarousel 
              images={raffle.images && raffle.images.length > 0 ? raffle.images : (raffle.image ? [raffle.image] : [])} 
              title={raffle.title}
              className="rounded-lg shadow-lg"
            />
            
            {/* Badges de Status */}
            <div className="flex gap-2">
              {raffle.featured && (
                <Badge className="bg-accent-gold text-black">
                  <Trophy className="w-3 h-3 mr-1" />
                  Destaque
                </Badge>
              )}
              <Badge variant={raffle.status === 'active' ? 'default' : 'secondary'}>
                {raffle.status === 'active' ? '🟢 Ativa' : '⏸️ Pausada'}
              </Badge>
            </div>
          </div>

          {/* Informações da Rifa */}
          <div className="space-y-6">
            {/* Preço e Ticket Info */}
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-gold mb-2">
                    R$ {raffle.price.toFixed(2).replace('.', ',')}
                  </div>
                  <p className="text-foreground-muted">por número</p>
                </div>
              </CardContent>
            </Card>

            {/* Progresso */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">Progresso da Rifa</span>
                <span className="text-foreground font-bold">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-sm text-foreground-muted">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {raffle.soldTickets} vendidos
                </span>
                <span>{remainingTickets} restantes</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-background-secondary border-border">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{raffle.totalTickets}</div>
                  <div className="text-xs text-foreground-muted">Total de Números</div>
                </CardContent>
              </Card>
              <Card className="bg-background-secondary border-border">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-accent-gold">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-foreground-muted">Arrecadado</div>
                </CardContent>
              </Card>
            </div>

            {/* Draw Date */}
            <Card className="bg-background-secondary border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-center text-foreground">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  <span className="font-medium">
                    Sorteio: {new Date(raffle.drawDate).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Prize Info */}
            {raffle.prizeValue && (
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Gift className="w-5 h-5 mr-2 text-primary" />
                      <span className="font-medium text-foreground">Valor do Prêmio</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      R$ {raffle.prizeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Institution */}
            {raffle.institution && (
              <Card className="bg-background-secondary border-border">
                <CardContent className="p-3">
                  <div className="flex items-center text-foreground-muted">
                    <Building className="w-4 h-4 mr-2" />
                    <span className="text-sm">{raffle.institution}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <Button 
              onClick={onParticipate}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold py-3 text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-primary/25"
              size="lg"
            >
              🎟️ Participar Agora
            </Button>
          </div>
        </div>

        {/* Description */}
        {raffle.description && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Descrição</h3>
            <p className="text-foreground-muted leading-relaxed">{raffle.description}</p>
          </div>
        )}

        {/* Rules */}
        {raffle.rules && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Regulamento</h3>
            <Card className="bg-background-secondary border-border">
              <CardContent className="p-4">
                <p className="text-sm text-foreground-muted leading-relaxed">{raffle.rules}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};