import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RaffleService, Raffle } from "../services/raffleService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Play, 
  Pause, 
  Trophy,
  Users,
  DollarSign,
  Calendar,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  active: { label: "Ativa", color: "bg-green-500", textColor: "text-green-700" },
  paused: { label: "Pausada", color: "bg-yellow-500", textColor: "text-yellow-700" },
  finished: { label: "Finalizada", color: "bg-blue-500", textColor: "text-blue-700" },
  draft: { label: "Rascunho", color: "bg-gray-500", textColor: "text-gray-700" }
};

export default function ActiveRaffles() {
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    try {
      setIsLoading(true);
      const data = await RaffleService.getRaffles();
      setRaffles(data || []);
    } catch (error) {
      console.error('Erro ao carregar rifas:', error);
      setRaffles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRaffles = raffles.filter(raffle =>
    raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    raffle.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (raffleId: string, newStatus: Raffle["status"]) => {
    setRaffles(prev => prev.map(raffle => 
      raffle.id === raffleId ? { ...raffle, status: newStatus } : raffle
    ));
  };

  const handleDelete = () => {
    if (selectedRaffle) {
      setRaffles(prev => prev.filter(raffle => raffle.id !== selectedRaffle.id));
      setShowDeleteDialog(false);
      setSelectedRaffle(null);
    }
  };

  const calculateProgress = (sold: number, total: number) => {
    return Math.round((sold / total) * 100);
  };

  const getTotalStats = () => {
    const activeRaffles = raffles.filter(r => r.status === "active").length;
    const totalRevenue = raffles.reduce((sum, r) => sum + r.revenue, 0);
    const totalParticipants = raffles.reduce((sum, r) => sum + r.sold_tickets, 0);
    
    return { activeRaffles, totalRevenue, totalParticipants };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rifas Ativas</h1>
          <p className="text-foreground-muted">Gerencie todas as suas rifas</p>
        </div>
        
        <Button onClick={() => navigate("/admin/rifas/nova")} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nova Rifa</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.activeRaffles}</p>
                <p className="text-sm text-foreground-muted">Rifas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">R$ {stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-foreground-muted">Receita Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                <p className="text-sm text-foreground-muted">Participantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{raffles.length}</p>
                <p className="text-sm text-foreground-muted">Total de Rifas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted h-4 w-4" />
              <Input
                placeholder="Buscar rifas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Raffles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Rifas</CardTitle>
          <CardDescription>
            {filteredRaffles.length} rifa(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rifa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Sorteio</TableHead>
                <TableHead>Vencedor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRaffles.map((raffle) => (
                <TableRow key={raffle.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                        {raffle.institution_logo && (
                          <img 
                            src={raffle.institution_logo} 
                            alt={`Logo ${raffle.institution_name}`}
                            className="w-8 h-8 object-contain rounded border bg-white"
                          />
                        )}
                      <div>
                        <div className="font-medium">{raffle.title}</div>
                          <div className="text-sm text-foreground-muted">{raffle.category}</div>
                          {raffle.institution_name && (
                            <div className="text-xs text-blue-600 font-medium">
                              {raffle.institution_name}
                            </div>
                          )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {raffle.status === 'finished' && raffle.winner_name ? (
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        Sorteada
                      </Badge>
                    ) : (
                      <Badge 
                        variant="secondary" 
                        className={`${statusConfig[raffle.status].color} text-white`}
                      >
                        {statusConfig[raffle.status].label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{raffle.sold_tickets}/{raffle.total_tickets}</span>
                        <span>{calculateProgress(raffle.sold_tickets, raffle.total_tickets)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${calculateProgress(raffle.sold_tickets, raffle.total_tickets)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>R$ {raffle.ticket_price.toFixed(2)}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    R$ {raffle.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {format(new Date(raffle.draw_date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {raffle.status === 'finished' && raffle.winner_name ? (
                      <div className="space-y-1">
                        <div className="font-medium text-green-600">{raffle.winner_name}</div>
                        <div className="text-xs text-foreground-muted">Nº {raffle.winning_number}</div>
                        <div className="text-xs text-foreground-muted">
                          {raffle.draw_completed_at && format(new Date(raffle.draw_completed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-foreground-muted text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedRaffle(raffle);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/rifas/editar/${raffle.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {raffle.status === "active" ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(raffle.id, "paused")}>
                            <Pause className="mr-2 h-4 w-4" />
                            Pausar
                          </DropdownMenuItem>
                        ) : raffle.status === "paused" ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(raffle.id, "active")}>
                            <Play className="mr-2 h-4 w-4" />
                            Ativar
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setSelectedRaffle(raffle);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Rifa</DialogTitle>
            <DialogDescription>
              Informações completas sobre a rifa selecionada
            </DialogDescription>
          </DialogHeader>
          
          {selectedRaffle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Título</h4>
                  <p>{selectedRaffle.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Categoria</h4>
                  <p>{selectedRaffle.category}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Prêmio</h4>
                  <p>{selectedRaffle.prize}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Valor do Prêmio</h4>
                  <p>R$ {selectedRaffle.prize_value.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Preço do Bilhete</h4>
                  <p>R$ {selectedRaffle.ticket_price.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Status</h4>
                  <Badge className={`${statusConfig[selectedRaffle.status].color} text-white`}>
                    {statusConfig[selectedRaffle.status].label}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold">Progresso</h4>
                  <p>{selectedRaffle.sold_tickets}/{selectedRaffle.total_tickets} ({calculateProgress(selectedRaffle.sold_tickets, selectedRaffle.total_tickets)}%)</p>
                </div>
                <div>
                  <h4 className="font-semibold">Receita</h4>
                  <p className="text-green-600 font-medium">R$ {selectedRaffle.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Data do Sorteio</h4>
                  <p>{format(new Date(selectedRaffle.draw_date), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Criada em</h4>
                  <p>{format(new Date(selectedRaffle.created_at || ''), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              </div>
              
              {selectedRaffle.institution_name && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Instituição Responsável</h4>
                  <div className="flex items-center space-x-4">
                    {selectedRaffle.institution_logo && (
                      <img 
                        src={selectedRaffle.institution_logo} 
                        alt={`Logo ${selectedRaffle.institution_name}`}
                        className="w-16 h-16 object-contain rounded border bg-white"
                      />
                    )}
                    <div>
                      <p className="font-medium text-blue-600">{selectedRaffle.institution_name}</p>
                      <p className="text-sm text-foreground-muted">Instituição beneficiária</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fechar
            </Button>
            {selectedRaffle && (
              <Button onClick={() => navigate(`/admin/rifas/editar/${selectedRaffle.id}`)}>
                Editar Rifa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a rifa "{selectedRaffle?.title}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}