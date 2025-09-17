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
import { 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  DollarSign, 
  Timer, 
  Building,
  Gift,
  Star,
  Shield,
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
          {/* Imagem Principal */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={raffle.image}
                alt={raffle.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              {raffle.featured && (
                <Badge className="absolute top-3 left-3 bg-gradient-gold text-primary-foreground">
                  <Trophy className="w-3 h-3 mr-1" />
                  Em Destaque
                </Badge>
              )}
              {raffle.timeLeft && (
                <Badge className="absolute top-3 right-3 bg-background-secondary/80 backdrop-blur-sm text-foreground">
                  <Timer className="w-3 h-3 mr-1" />
                  {raffle.timeLeft}
                </Badge>
              )}
            </div>

            {/* Informações da Instituição */}
            {raffle.institution && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Instituição</p>
                      <p className="text-sm text-foreground-muted">{raffle.institution}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detalhes da Rifa */}
          <div className="space-y-4">
            {/* Preço e Valor do Prêmio */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-accent-gold mx-auto mb-2" />
                  <p className="text-2xl font-bold text-accent-gold">
                    R$ {raffle.price.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-foreground-muted">por número</p>
                </CardContent>
              </Card>

              {raffle.prizeValue && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-primary">
                      R$ {raffle.prizeValue.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-foreground-muted">valor do prêmio</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Progresso da Rifa */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Progresso da Rifa</span>
                    <span className="text-lg font-bold text-primary">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="font-bold text-accent-success">{raffle.soldTickets}</p>
                      <p className="text-foreground-muted">Vendidos</p>
                    </div>
                    <div>
                      <p className="font-bold text-foreground-muted">{remainingTickets}</p>
                      <p className="text-foreground-muted">Restantes</p>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{raffle.totalTickets}</p>
                      <p className="text-foreground-muted">Total</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Sorteio */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Data do Sorteio</p>
                      <p className="text-sm text-foreground-muted">{raffle.drawDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-accent-gold" />
                    <div>
                      <p className="font-medium">Arrecadação Atual</p>
                      <p className="text-sm text-foreground-muted">
                        R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-accent-success" />
                    <div>
                      <p className="font-medium">Status</p>
                      <Badge variant="success">{raffle.status || 'Ativa'}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botão Participar */}
            <Button
              onClick={onParticipate}
              className="w-full h-12 text-lg font-semibold"
              variant="hero"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Participar Agora
            </Button>
          </div>
        </div>

        {/* Descrição e Regras */}
        <div className="space-y-4 mt-6">
          {raffle.description && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Descrição
                </h3>
                <p className="text-foreground-muted">{raffle.description}</p>
              </CardContent>
            </Card>
          )}

          {raffle.rules && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Regras e Termos
                </h3>
                <p className="text-foreground-muted whitespace-pre-line">{raffle.rules}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};