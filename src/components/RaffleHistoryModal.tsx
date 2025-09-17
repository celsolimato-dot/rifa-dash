import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, 
  Calendar, 
  Trophy, 
  DollarSign, 
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Ticket
} from 'lucide-react';

interface RaffleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RaffleHistoryItem {
  id: string;
  title: string;
  image: string;
  numbers: number[];
  totalInvested: number;
  drawDate: string;
  status: 'active' | 'completed' | 'won' | 'lost';
  result?: {
    winningNumber?: number;
    prize?: string;
    prizeValue?: number;
  };
  purchaseDate: string;
}

export const RaffleHistoryModal: React.FC<RaffleHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Mock data para histórico completo
  const raffleHistory: RaffleHistoryItem[] = [
    {
      id: "1",
      title: "Carro dos Sonhos - Civic Sport 2024",
      image: "/placeholder-car.jpg",
      numbers: [1234, 5678, 9012],
      totalInvested: 47.97,
      drawDate: "2024-02-15T20:00:00Z",
      status: "active",
      purchaseDate: "2024-01-20T14:30:00Z"
    },
    {
      id: "2",
      title: "R$ 50.000 em Dinheiro",
      image: "/placeholder-money.jpg",
      numbers: [3456, 7890],
      totalInvested: 19.98,
      drawDate: "2024-01-30T20:00:00Z",
      status: "completed",
      result: {
        winningNumber: 1111,
        prize: "R$ 50.000",
        prizeValue: 50000
      },
      purchaseDate: "2024-01-15T16:45:00Z"
    },
    {
      id: "3",
      title: "iPhone 15 Pro Max 256GB",
      image: "/placeholder-phone.jpg",
      numbers: [2468, 1357, 9753],
      totalInvested: 38.97,
      drawDate: "2024-01-25T20:00:00Z",
      status: "won",
      result: {
        winningNumber: 2468,
        prize: "iPhone 15 Pro Max 256GB",
        prizeValue: 8999
      },
      purchaseDate: "2024-01-10T10:20:00Z"
    },
    {
      id: "4",
      title: "Notebook Gamer RTX 4060",
      image: "/placeholder-laptop.jpg",
      numbers: [5555, 6666],
      totalInvested: 39.98,
      drawDate: "2024-01-20T20:00:00Z",
      status: "lost",
      result: {
        winningNumber: 7777,
        prize: "Notebook Gamer RTX 4060",
        prizeValue: 4500
      },
      purchaseDate: "2024-01-05T12:15:00Z"
    },
    {
      id: "5",
      title: "PlayStation 5 + 2 Controles",
      image: "/placeholder-ps5.jpg",
      numbers: [1111, 2222, 3333, 4444],
      totalInvested: 51.96,
      drawDate: "2024-01-15T20:00:00Z",
      status: "lost",
      result: {
        winningNumber: 9999,
        prize: "PlayStation 5 + 2 Controles",
        prizeValue: 3200
      },
      purchaseDate: "2023-12-28T18:30:00Z"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-blue-500">Ativa</Badge>;
      case 'completed':
        return <Badge variant="secondary">Finalizada</Badge>;
      case 'won':
        return <Badge variant="success" className="bg-green-500">Ganhei!</Badge>;
      case 'lost':
        return <Badge variant="destructive">Não ganhei</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'won':
        return <Trophy className="w-4 h-4 text-green-500" />;
      case 'lost':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Ticket className="w-4 h-4" />;
    }
  };

  const filteredHistory = raffleHistory.filter(raffle => {
    const matchesSearch = raffle.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || raffle.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && raffle.status === 'active') ||
      (activeTab === 'completed' && ['completed', 'won', 'lost'].includes(raffle.status)) ||
      (activeTab === 'won' && raffle.status === 'won');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalStats = {
    totalInvested: raffleHistory.reduce((sum, raffle) => sum + raffle.totalInvested, 0),
    totalRaffles: raffleHistory.length,
    activeRaffles: raffleHistory.filter(r => r.status === 'active').length,
    wonRaffles: raffleHistory.filter(r => r.status === 'won').length,
    totalWinnings: raffleHistory
      .filter(r => r.status === 'won')
      .reduce((sum, raffle) => sum + (raffle.result?.prizeValue || 0), 0)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-bold">Histórico Completo de Rifas</span>
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

        <div className="space-y-6">
          {/* Estatísticas Resumidas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{totalStats.totalRaffles}</p>
                <p className="text-sm text-foreground-muted">Total de Rifas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-500">{totalStats.activeRaffles}</p>
                <p className="text-sm text-foreground-muted">Ativas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-500">{totalStats.wonRaffles}</p>
                <p className="text-sm text-foreground-muted">Vitórias</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-accent-gold">
                  R$ {totalStats.totalInvested.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-sm text-foreground-muted">Investido</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalStats.totalWinnings.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-foreground-muted">Ganhos</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
              <Input
                placeholder="Buscar por nome da rifa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="completed">Finalizadas</SelectItem>
                <SelectItem value="won">Ganhei</SelectItem>
                <SelectItem value="lost">Não Ganhei</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="active">Ativas</TabsTrigger>
              <TabsTrigger value="completed">Finalizadas</TabsTrigger>
              <TabsTrigger value="won">Vitórias</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="max-h-96 overflow-y-auto space-y-4">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-foreground-muted">Nenhuma rifa encontrada com os filtros aplicados.</p>
                  </div>
                ) : (
                  filteredHistory.map((raffle) => (
                    <Card key={raffle.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <img 
                            src={raffle.image} 
                            alt={raffle.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-foreground line-clamp-2">{raffle.title}</h3>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(raffle.status)}
                                {getStatusBadge(raffle.status)}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <span className="text-sm text-foreground-muted">Seus números:</span>
                              {raffle.numbers.map((number) => (
                                <Badge 
                                  key={number} 
                                  variant={raffle.status === 'won' && raffle.result?.winningNumber === number ? "success" : "outline"} 
                                  className={`font-mono ${raffle.status === 'won' && raffle.result?.winningNumber === number ? 'bg-green-500 text-white' : ''}`}
                                >
                                  {number.toString().padStart(4, '0')}
                                </Badge>
                              ))}
                            </div>

                            {raffle.result && (
                              <div className="text-sm space-y-1">
                                <p className="text-foreground-muted">
                                  <strong>Número sorteado:</strong> {raffle.result.winningNumber?.toString().padStart(4, '0')}
                                </p>
                                {raffle.status === 'won' && (
                                  <p className="text-green-600 font-medium">
                                    🎉 Parabéns! Você ganhou: {raffle.result.prize}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="space-y-1">
                                <span className="flex items-center text-foreground-muted">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Sorteio: {formatDate(raffle.drawDate)}
                                </span>
                                <span className="flex items-center text-foreground-muted">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Compra: {formatDate(raffle.purchaseDate)}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-accent-gold">
                                  Investido: R$ {raffle.totalInvested.toFixed(2).replace('.', ',')}
                                </span>
                                {raffle.status === 'won' && raffle.result?.prizeValue && (
                                  <p className="text-green-600 font-medium">
                                    Ganho: R$ {raffle.result.prizeValue.toLocaleString('pt-BR')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};