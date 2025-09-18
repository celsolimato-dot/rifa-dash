import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RaffleService, Raffle } from "../services/raffleService";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Trophy, 
  Users, 
  Calendar,
  Search,
  Eye,
  Filter,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const AllRaffles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"raffles" | "winners">("raffles");
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await RaffleService.getRaffles();
      setRaffles(data || []);
      // TODO: Implementar serviço de ganhadores quando disponível
      setWinners([]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setRaffles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRaffles = raffles.filter(raffle =>
    raffle.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWinners = winners.filter(winner =>
    winner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    winner.raffleTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-accent-success text-white">Ativa</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-accent-gold text-white">Finalizada</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Todas as Rifas</h1>
        <p className="text-foreground-muted">
          Gerencie todas as rifas e visualize os ganhadores
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-background-secondary p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "raffles" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("raffles")}
          className="flex items-center space-x-2"
        >
          <Trophy className="w-4 h-4" />
          <span>Rifas</span>
        </Button>
        <Button
          variant={activeTab === "winners" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("winners")}
          className="flex items-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>Ganhadores</span>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
          <Input
            placeholder={activeTab === "raffles" ? "Buscar rifas..." : "Buscar ganhadores..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </Button>
      </div>

      {/* Content */}
      {activeTab === "raffles" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaffles.map((raffle) => (
            <Card key={raffle.id} className="bg-gradient-card border-border hover:border-border-hover transition-all">
              <CardHeader className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-foreground line-clamp-2">
                      {raffle.title}
                    </CardTitle>
                    <CardDescription className="text-foreground-muted">
                      {raffle.description}
                    </CardDescription>
                  </div>
                  {getStatusBadge(raffle.status)}
                </div>
                
                <div className="aspect-video bg-background-secondary rounded-lg overflow-hidden">
                  {raffle.image_url ? (
                    <img 
                      src={raffle.image_url} 
                      alt={raffle.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`flex items-center justify-center w-full h-full ${raffle.image_url ? 'hidden' : ''}`}>
                    <Trophy className="w-12 h-12 text-foreground-muted" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-accent-gold" />
                    <span className="text-foreground-muted">R$ {raffle.ticket_price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-foreground-muted">{raffle.sold_tickets}/{raffle.total_tickets}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-accent-success" />
                    <span className="text-foreground-muted">{new Date(raffle.draw_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-foreground-muted" />
                    <span className="text-foreground-muted">{new Date(raffle.created_at || '').toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="w-full bg-background-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(raffle.sold_tickets / raffle.total_tickets) * 100}%` }}
                  />
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedRaffle(raffle)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{selectedRaffle?.title}</DialogTitle>
                      <DialogDescription>
                        Detalhes completos da rifa
                      </DialogDescription>
                    </DialogHeader>
                    {selectedRaffle && (
                      <div className="space-y-6">
                        <div className="aspect-video bg-background-secondary rounded-lg overflow-hidden">
                          {selectedRaffle.image_url ? (
                            <img 
                              src={selectedRaffle.image_url} 
                              alt={selectedRaffle.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`flex items-center justify-center w-full h-full ${selectedRaffle.image_url ? 'hidden' : ''}`}>
                            <Trophy className="w-16 h-16 text-foreground-muted" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-foreground">Informações Gerais</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-foreground-muted">Preço:</span> R$ {selectedRaffle.ticket_price.toFixed(2)}</p>
                              <p><span className="text-foreground-muted">Total de Números:</span> {selectedRaffle.total_tickets}</p>
                              <p><span className="text-foreground-muted">Vendidos:</span> {selectedRaffle.sold_tickets}</p>
                              <p><span className="text-foreground-muted">Disponíveis:</span> {selectedRaffle.total_tickets - selectedRaffle.sold_tickets}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-semibold text-foreground">Datas</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-foreground-muted">Criada em:</span> {new Date(selectedRaffle.created_at || '').toLocaleDateString()}</p>
                              <p><span className="text-foreground-muted">Sorteio:</span> {new Date(selectedRaffle.draw_date).toLocaleDateString()}</p>
                              <p><span className="text-foreground-muted">Status:</span> {getStatusBadge(selectedRaffle.status)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Descrição</h4>
                          <p className="text-foreground-muted text-sm">{selectedRaffle.description}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Progresso de Vendas</h4>
                          <div className="w-full bg-background-secondary rounded-full h-3">
                            <div 
                              className="bg-primary h-3 rounded-full transition-all"
                              style={{ width: `${(selectedRaffle.sold_tickets / selectedRaffle.total_tickets) * 100}%` }}
                            />
                          </div>
                          <p className="text-sm text-foreground-muted">
                            {((selectedRaffle.sold_tickets / selectedRaffle.total_tickets) * 100).toFixed(1)}% vendido
                          </p>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-accent-gold" />
              <span>Ganhadores</span>
            </CardTitle>
            <CardDescription>
              Lista de todos os ganhadores das rifas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ganhador</TableHead>
                  <TableHead>Rifa</TableHead>
                  <TableHead>Número Sorteado</TableHead>
                  <TableHead>Prêmio</TableHead>
                  <TableHead>Data do Sorteio</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWinners.map((winner) => (
                  <TableRow key={winner.id}>
                    <TableCell className="font-medium">{winner.name}</TableCell>
                    <TableCell>{winner.raffleTitle}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {winner.winningNumber}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-accent-gold">
                      {winner.prize}
                    </TableCell>
                    <TableCell>{new Date(winner.drawDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedWinner(winner)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalhes do Ganhador</DialogTitle>
                            <DialogDescription>
                              Informações completas do ganhador
                            </DialogDescription>
                          </DialogHeader>
                          {selectedWinner && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-foreground">Dados Pessoais</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-foreground-muted">Nome:</span> {selectedWinner.name}</p>
                                    <p><span className="text-foreground-muted">Telefone:</span> {selectedWinner.phone}</p>
                                    <p><span className="text-foreground-muted">Email:</span> {selectedWinner.email}</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-foreground">Dados da Rifa</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-foreground-muted">Rifa:</span> {selectedWinner.raffleTitle}</p>
                                    <p><span className="text-foreground-muted">Número:</span> 
                                      <Badge variant="outline" className="ml-2 font-mono">
                                        {selectedWinner.winningNumber}
                                      </Badge>
                                    </p>
                                    <p><span className="text-foreground-muted">Prêmio:</span> 
                                      <span className="ml-2 font-semibold text-accent-gold">{selectedWinner.prize}</span>
                                    </p>
                                    <p><span className="text-foreground-muted">Data:</span> {new Date(selectedWinner.drawDate).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 p-3 bg-accent-success/10 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-accent-success" />
                                <span className="text-sm text-accent-success font-medium">
                                  Prêmio entregue com sucesso
                                </span>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AllRaffles;