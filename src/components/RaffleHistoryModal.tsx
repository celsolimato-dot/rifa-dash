import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Calendar, 
  DollarSign, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Gift
} from "lucide-react";

export interface RaffleHistoryItem {
  id: string;
  title: string;
  image: string;
  numbers: number[];
  totalInvested: number;
  drawDate: string;
  status: "active" | "finished" | "won" | "lost";
  result?: {
    winningNumber: number;
    prize: string;
    prizeValue: number;
  };
  purchaseDate: string;
}

interface RaffleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RaffleHistoryModal: React.FC<RaffleHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Histórico de participação real do usuário (buscar do banco)
  const raffleHistory: RaffleHistoryItem[] = [];

  const filteredHistory = raffleHistory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && item.status === 'active') ||
      (activeTab === 'finished' && ['finished', 'won', 'lost'].includes(item.status)) ||
      (activeTab === 'won' && item.status === 'won') ||
      (activeTab === 'lost' && item.status === 'lost');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-blue-500">Ativa</Badge>;
      case 'finished':
        return <Badge variant="outline">Finalizada</Badge>;
      case 'won':
        return <Badge variant="default" className="bg-green-500">Ganhou</Badge>;
      case 'lost':
        return <Badge variant="destructive">Perdeu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <Trophy className="w-4 h-4 text-green-500" />;
      case 'lost':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'active':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalInvested = raffleHistory.reduce((sum, item) => sum + item.totalInvested, 0);
  const totalWon = raffleHistory
    .filter(item => item.status === 'won')
    .reduce((sum, item) => sum + (item.result?.prizeValue || 0), 0);
  const activeRaffles = raffleHistory.filter(item => item.status === 'active').length;
  const wonRaffles = raffleHistory.filter(item => item.status === 'won').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <Trophy className="w-5 h-5 text-accent-gold" />
            <span>Histórico de Participações</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full space-y-4">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-background-secondary border-border">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-foreground">{formatCurrency(totalInvested)}</div>
                <div className="text-xs text-foreground-muted">Total Investido</div>
              </CardContent>
            </Card>
            
            <Card className="bg-background-secondary border-border">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-accent-success">{formatCurrency(totalWon)}</div>
                <div className="text-xs text-foreground-muted">Total Ganho</div>
              </CardContent>
            </Card>
            
            <Card className="bg-background-secondary border-border">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-primary">{activeRaffles}</div>
                <div className="text-xs text-foreground-muted">Rifas Ativas</div>
              </CardContent>
            </Card>
            
            <Card className="bg-background-secondary border-border">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-accent-gold">{wonRaffles}</div>
                <div className="text-xs text-foreground-muted">Rifas Ganhas</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Pesquisar rifas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background-secondary border-border"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-5 bg-background-secondary">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="active">Ativas</TabsTrigger>
              <TabsTrigger value="finished">Finalizadas</TabsTrigger>
              <TabsTrigger value="won">Ganhas</TabsTrigger>
              <TabsTrigger value="lost">Perdidas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 mt-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {filteredHistory.length === 0 ? (
                    <Card className="bg-background-secondary border-border">
                      <CardContent className="p-8 text-center">
                        <Gift className="w-12 h-12 mx-auto mb-4 text-foreground-muted opacity-50" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Nenhuma participação encontrada
                        </h3>
                        <p className="text-foreground-muted">
                          {activeTab === 'all' 
                            ? 'Você ainda não participou de nenhuma rifa.'
                            : `Nenhuma rifa ${activeTab === 'active' ? 'ativa' : activeTab === 'won' ? 'ganha' : activeTab === 'lost' ? 'perdida' : 'finalizada'} encontrada.`
                          }
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredHistory.map((item) => (
                      <Card key={item.id} className="bg-background-secondary border-border hover:border-primary/20 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                            
                            {/* Image */}
                            <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
                              <Trophy className="w-8 h-8 text-accent-gold" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                                  <div className="flex items-center space-x-4 text-sm text-foreground-muted">
                                    <span className="flex items-center space-x-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>Sorteio: {formatDate(item.drawDate)}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <DollarSign className="w-4 h-4" />
                                      <span>Investido: {formatCurrency(item.totalInvested)}</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(item.status)}
                                  {getStatusBadge(item.status)}
                                </div>
                              </div>

                              {/* Numbers */}
                              <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-foreground-muted">Números:</span>
                                {item.numbers.map((number, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {number.toString().padStart(4, '0')}
                                  </Badge>
                                ))}
                              </div>

                              {/* Result (for finished raffles) */}
                              {item.result && (
                                <div className="p-3 bg-background rounded-lg border border-border">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="text-sm font-medium text-foreground">
                                        Número sorteado: {item.result.winningNumber.toString().padStart(4, '0')}
                                      </div>
                                      <div className="text-sm text-foreground-muted">
                                        Prêmio: {item.result.prize}
                                      </div>
                                    </div>
                                    {item.status === 'won' && (
                                      <Badge variant="default" className="bg-green-500">
                                        Você ganhou! 🎉
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RaffleHistoryModal;