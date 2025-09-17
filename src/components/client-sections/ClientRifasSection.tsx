import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientRafflesService, ClientRaffle } from '@/services/clientRafflesService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search,
  Calendar,
  Target,
  Clock,
  Trophy,
  Filter,
  Eye,
  Ticket
} from "lucide-react";

interface ClientRifasSectionProps {
  onOpenNumberModal?: (raffle: any) => void;
}

export const ClientRifasSection: React.FC<ClientRifasSectionProps> = ({ onOpenNumberModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRaffles, setActiveRaffles] = useState<ClientRaffle[]>([]);
  const [finishedRaffles, setFinishedRaffles] = useState<ClientRaffle[]>([]);
  const [availableRaffles, setAvailableRaffles] = useState<ClientRaffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadRafflesData();
    }
  }, [user]);

  const loadRafflesData = async () => {
    try {
      setIsLoading(true);
      const [active, finished, available] = await Promise.all([
        ClientRafflesService.getActiveRaffles(user!.id),
        ClientRafflesService.getCompletedRaffles(user!.id),
        ClientRafflesService.getActiveRaffles(user!.id) // Use same for now
      ]);
      
      setActiveRaffles(active);
      setFinishedRaffles(finished);
      setAvailableRaffles(available);
    } catch (error) {
      console.error('Erro ao carregar dados das rifas:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const filteredActiveRaffles = activeRaffles.filter(raffle =>
    raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    raffle.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFinishedRaffles = finishedRaffles.filter(raffle =>
    raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    raffle.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const RaffleCard = ({ raffle, isActive = true }: { raffle: any, isActive?: boolean }) => (
    <Card className="bg-gradient-card border-border overflow-hidden">
      <div className="aspect-video bg-muted flex items-center justify-center">
        <Trophy className="w-12 h-12 text-muted-foreground" />
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground line-clamp-2">
              {raffle.title}
            </CardTitle>
            <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
              {raffle.description}
            </p>
          </div>
          <Badge variant={isActive ? "default" : raffle.result === 'ganhou' ? "secondary" : "outline"}>
            {isActive ? 'Ativa' : raffle.result === 'ganhou' ? 'Ganhou' : 'Perdeu'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Números Participantes */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {isActive ? 'Seus números:' : 'Números participantes:'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {raffle.numbers.map((number: number) => (
              <Badge 
                key={number} 
                variant={
                  !isActive && raffle.winnerNumber === number ? "default" : "outline"
                }
                className={
                  !isActive && raffle.winnerNumber === number 
                    ? "bg-green-500 text-white" 
                    : ""
                }
              >
                {number.toString().padStart(2, '0')}
              </Badge>
            ))}
          </div>
          {!isActive && (
            <p className="text-xs text-foreground-muted mt-2">
              Número sorteado: <span className="font-medium">{raffle.winnerNumber?.toString().padStart(2, '0')}</span>
            </p>
          )}
        </div>

        {/* Informações da Rifa */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-1 text-foreground-muted">
              <Calendar className="w-3 h-3" />
              <span>Sorteio:</span>
            </div>
            <p className="font-medium text-foreground">
              {formatDate(raffle.drawDate)}
            </p>
          </div>
          
          <div>
            <div className="flex items-center space-x-1 text-foreground-muted">
              <Clock className="w-3 h-3" />
              <span>Progresso:</span>
            </div>
            <p className="font-medium text-foreground">
              {raffle.soldNumbers}/{raffle.totalNumbers}
            </p>
          </div>
        </div>

        {/* Progresso */}
        <div>
          <div className="flex justify-between text-xs text-foreground-muted mb-1">
            <span>Vendidos</span>
            <span>{Math.round((raffle.soldNumbers / raffle.totalNumbers) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(raffle.soldNumbers / raffle.totalNumbers) * 100}%` }}
            />
          </div>
        </div>

        {/* Ações */}
        {isActive && (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onOpenNumberModal?.(raffle)}
            >
              Comprar Mais
            </Button>
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Rifas</h1>
          <p className="text-foreground-muted">Gerencie suas participações em rifas</p>
        </div>
        
        {/* Busca */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar rifas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ativas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ativas">
            Rifas Ativas ({filteredActiveRaffles.length})
          </TabsTrigger>
          <TabsTrigger value="finalizadas">
            Finalizadas ({filteredFinishedRaffles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativas" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-gradient-card border-border">
                  <CardContent className="p-4">
                    <div className="h-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredActiveRaffles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActiveRaffles.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} isActive={true} />
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma rifa ativa encontrada
                </h3>
                <p className="text-foreground-muted text-center">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca ou explore outras rifas disponíveis.'
                    : 'Você ainda não participou de nenhuma rifa. Que tal começar agora?'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="finalizadas" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-gradient-card border-border">
                  <CardContent className="p-4">
                    <div className="h-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFinishedRaffles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFinishedRaffles.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} isActive={false} />
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma rifa finalizada encontrada
                </h3>
                <p className="text-foreground-muted text-center">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca.'
                    : 'Suas rifas finalizadas aparecerão aqui.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};