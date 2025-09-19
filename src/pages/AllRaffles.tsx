import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Users, 
  Calendar,
  Search,
  Eye,
  Edit,
  Filter,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const AllRaffles = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("rifas");
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Static instance for direct method calls
  // Static async getAllRaffles(): Promise<Raffle[]> {
  //   const { data, error } = await supabase
  //     .from('raffles')
  //     .select('*')
  //     .order('created_at', { ascending: false });

  //   if (error) {
  //     console.error('Erro ao buscar rifas:', error);
  //     throw new Error(error.message);
  //   }

  //   return data || [];
  // }

  // Static async getRaffles(filters?: { status?: string; category?: string }): Promise<Raffle[]> {
  //   let query = supabase
  //     .from('raffles')
  //     .select('*')
  //     .order('created_at', { ascending: false });

  //   if (filters?.status) {
  //     query = query.eq('status', filters.status);
  //   }

  //   if (filters?.category) {
  //     query = query.eq('category', filters.category);
  //   }

  //   const { data, error } = await query;

  //   if (error) {
  //     console.error('Erro ao buscar rifas:', error);
  //     throw new Error(error.message);
  //   }

  //   return data || [];
  // }

  // Static async getActiveRaffles(): Promise<Raffle[]> {
  //   const { data, error } = await supabase
  //     .from('raffles')
  //     .select('*')
  //     .eq('status', 'active')
  //     .order('draw_date', { ascending: true });

  //   if (error) {
  //     console.error('Erro ao buscar rifas ativas:', error);
  //     throw new Error(error.message);
  //   }

  //   return data || [];
  // }

  // Static async getRaffleById(id: string): Promise<Raffle | null> {
  //   const { data, error } = await supabase
  //     .from('raffles')
  //     .select('*')
  //     .eq('id', id)
  //     .single();

  //   if (error) {
  //     console.error('Erro ao buscar rifa:', error);
  //     throw new Error(error.message);
  //   }

  //   return data;
  // }

  // Static async createRaffle(raffle: RaffleInsert): Promise<Raffle> {
  //   const { data, error } = await supabase
  //     .from('raffles')
  //     .insert(raffle)
  //     .select()
  //     .single();

  //   if (error) {
  //     console.error('Erro ao criar rifa:', error);
  //     throw new Error(error.message);
  //   }

  //   return data;
  // }

  // Static async updateRaffle(id: string, updates: RaffleUpdate): Promise<Raffle> {
  //   const { data, error } = await supabase
  //     .from('raffles')
  //     .update(updates)
  //     .eq('id', id)
  //     .select()
  //     .single();

  //   if (error) {
  //     console.error('Erro ao atualizar rifa:', error);
  //     throw new Error(error.message);
  //   }

  //   return data;
  // }

  // Static async deleteRaffle(id: string): Promise<void> {
  //   const { error } = await supabase
  //     .from('raffles')
  //     .delete()
  //     .eq('id', id);

  //   if (error) {
  //     console.error('Erro ao deletar rifa:', error);
  //     throw new Error(error.message);
  //   }
  // }

  // Static async getRafflesByCategory(category: string): Promise<Raffle[]> {
  //   const { data, error } = await supabase
  //     .from('raffles')
  //     .select('*')
  //     .eq('category', category)
  //     .eq('status', 'active')
  //     .order('draw_date', { ascending: true });

  //   if (error) {
  //     console.error('Erro ao buscar rifas por categoria:', error);
  //     throw new Error(error.message);
  //   }

  //   return data || [];
  // }

  // Static async getRevenueMetrics() {
  //   try {
  //     const { data: raffles, error } = await supabase
  //       .from('raffles')
  //       .select('revenue, created_at');
      
  //     if (error) throw error;
      
  //     const total = raffles?.reduce((sum, raffle) => sum + (raffle.revenue || 0), 0) || 0;
  //     const thisMonth = raffles?.filter(r => {
  //       const created = new Date(r.created_at);
  //       const now = new Date();
  //       return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  //     }).reduce((sum, raffle) => sum + (raffle.revenue || 0), 0) || 0;
      
  //     return { total, thisMonth, lastMonth: 0, growth: 0 };
  //   } catch (error) {
  //     console.error('Error getting revenue metrics:', error);
  //     return { error: true };
  //   }
  // }

  // Static async getSalesData() {
  //   try {
  //     const { data: raffles, error } = await supabase
  //       .from('raffles')
  //       .select('sold_tickets, created_at')
  //       .order('created_at', { ascending: false })
  //       .limit(30);
      
  //     if (error) throw error;
      
  //     const data = raffles?.map(raffle => ({
  //       date: raffle.created_at,
  //       sales: raffle.sold_tickets || 0
  //     })) || [];
      
  //     return { data };
  //   } catch (error) {
  //     console.error('Error getting sales data:', error);
  //     return { error: true };
  //   }
  // }

  useEffect(() => {
    async function loadData() {
      try {
        const raffleData = await RaffleService.getRaffles();
        setRaffles(raffleData);
        
        const mockWinners = [
          {
            id: 1,
            name: "João Silva",
            raffle: "iPhone 15 Pro Max",
            number: "0156",
            prize: "iPhone 15 Pro Max 256GB",
            drawDate: "2024-12-15"
          },
          {
            id: 2,
            name: "Maria Santos",
            raffle: "Civic 2023",
            number: "0892",
            prize: "Honda Civic 2023",
            drawDate: "2024-11-28"
          }
        ];
        setWinners(mockWinners);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredRaffles = raffles.filter(raffle =>
    raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    raffle.prize.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWinners = winners.filter(winner =>
    winner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    winner.raffle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativa", variant: "default" as const, color: "bg-green-500" },
      paused: { label: "Pausada", variant: "secondary" as const, color: "bg-yellow-500" },
      finished: { label: "Finalizada", variant: "outline" as const, color: "bg-blue-500" },
      draft: { label: "Rascunho", variant: "secondary" as const, color: "bg-gray-500" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground-muted">Carregando rifas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Todas as Rifas</h1>
          <p className="text-foreground-muted">Gerencie todas as rifas e visualize os ganhadores</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="rifas" className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Rifas</span>
              </TabsTrigger>
              <TabsTrigger value="ganhadores" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Ganhadores</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted h-4 w-4" />
                <Input
                  placeholder="Buscar rifas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground w-full sm:w-80"
                />
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </Button>
            </div>
          </div>

          <TabsContent value="rifas">
            {filteredRaffles.length === 0 ? (
              <Card className="bg-gradient-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="w-16 h-16 text-foreground-muted mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma rifa encontrada</h3>
                  <p className="text-foreground-muted text-center">
                    {searchTerm ? "Tente ajustar os termos de busca." : "Comece criando sua primeira rifa."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRaffles.map((raffle) => (
                  <Card key={raffle.id} className="bg-gradient-card border-border hover:shadow-lg transition-all duration-300 hover-scale overflow-hidden">
                    <CardContent className="p-0">
                      {/* Image Carousel Section */}
                      <div className="relative group">
                        <div className="aspect-[16/10] bg-background-secondary overflow-hidden">
                          {raffle.image_url ? (
                            <Carousel className="w-full h-full">
                              <CarouselContent className="h-full">
                                {/* Primary Image */}
                                <CarouselItem className="h-full">
                                  <img 
                                    src={raffle.image_url} 
                                    alt={raffle.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  <div className="hidden flex items-center justify-center w-full h-full bg-background-secondary">
                                    <Trophy className="w-16 h-16 text-foreground-muted" />
                                  </div>
                                </CarouselItem>
                                
                                {/* Additional Images - Mock for demonstration */}
                                {raffle.image_url && (
                                  <>
                                    <CarouselItem className="h-full">
                                      <img 
                                        src={raffle.image_url}
                                        alt={`${raffle.title} - Imagem 2`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        style={{ filter: 'brightness(0.9)' }}
                                      />
                                    </CarouselItem>
                                    <CarouselItem className="h-full">
                                      <img 
                                        src={raffle.image_url}
                                        alt={`${raffle.title} - Imagem 3`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        style={{ filter: 'brightness(1.1)' }}
                                      />
                                    </CarouselItem>
                                  </>
                                )}
                              </CarouselContent>
                              
                              {/* Carousel Controls - Only show on hover */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white border-none hover:bg-black/80 w-8 h-8" />
                                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white border-none hover:bg-black/80 w-8 h-8" />
                              </div>
                              
                              {/* Image Indicator Dots */}
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-2 h-2 rounded-full bg-white/60"></div>
                                <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                <div className="w-2 h-2 rounded-full bg-white/30"></div>
                              </div>
                            </Carousel>
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <Trophy className="w-16 h-16 text-foreground-muted" />
                            </div>
                          )}
                        </div>
                        
                        {/* Status Badge Overlay */}
                        <div className="absolute top-3 left-3">
                          {getStatusBadge(raffle.status)}
                        </div>
                        
                        {/* Featured Badge */}
                        {raffle.status === 'active' && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-accent-gold text-black font-semibold animate-pulse">
                              Destaque
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold text-foreground text-xl line-clamp-2 leading-tight">
                            {raffle.title}
                          </h3>
                          <p className="text-foreground-muted text-sm line-clamp-2 leading-relaxed">
                            {raffle.description}
                          </p>
                        </div>
                        
                        {/* Price Section */}
                        <div className="bg-background-secondary/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground-muted text-sm">Preço do Bilhete:</span>
                            <span className="font-bold text-primary text-lg">
                              R$ {raffle.ticket_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress Section */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground-muted">Progresso de Vendas:</span>
                            <span className="text-foreground font-medium">
                              {raffle.sold_tickets}/{raffle.total_tickets}
                            </span>
                          </div>
                          <div className="w-full bg-background-secondary rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${Math.min((raffle.sold_tickets / raffle.total_tickets) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-foreground-muted">
                            <span>{((raffle.sold_tickets / raffle.total_tickets) * 100).toFixed(1)}% vendido</span>
                            <span>{raffle.total_tickets - raffle.sold_tickets} restam</span>
                          </div>
                        </div>
                        
                        {/* Draw Date */}
                        <div className="flex items-center text-sm text-foreground-muted bg-background-secondary/30 rounded-lg p-2">
                          <Calendar className="w-4 h-4 mr-2 text-primary" />
                          <span>Sorteio: {new Date(raffle.draw_date).toLocaleDateString('pt-BR')}</span>
                        </div>

                        {/* Action Buttons */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline" 
                                className="flex-1 hover-scale"
                                onClick={() => setSelectedRaffle(raffle)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </Button>
                              <Button 
                                variant="default" 
                                className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-300"
                                onClick={() => navigate(`/admin/rifas/editar/${raffle.id}`)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">{selectedRaffle?.title}</DialogTitle>
                              <DialogDescription>
                                Detalhes completos da rifa
                              </DialogDescription>
                            </DialogHeader>
                            {selectedRaffle && (
                              <div className="space-y-6">
                                {/* Enhanced Image Gallery */}
                                <div className="relative">
                                  <Carousel className="w-full">
                                    <CarouselContent>
                                      <CarouselItem>
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
                                            <Trophy className="w-20 h-20 text-foreground-muted" />
                                          </div>
                                        </div>
                                      </CarouselItem>
                                      
                                      {/* Additional demo images */}
                                      {selectedRaffle.image_url && (
                                        <>
                                          <CarouselItem>
                                            <div className="aspect-video bg-background-secondary rounded-lg overflow-hidden">
                                              <img 
                                                src={selectedRaffle.image_url}
                                                alt={`${selectedRaffle.title} - Detalhes`}
                                                className="w-full h-full object-cover"
                                                style={{ filter: 'brightness(0.95) contrast(1.05)' }}
                                              />
                                            </div>
                                          </CarouselItem>
                                          <CarouselItem>
                                            <div className="aspect-video bg-background-secondary rounded-lg overflow-hidden">
                                              <img 
                                                src={selectedRaffle.image_url}
                                                alt={`${selectedRaffle.title} - Vista adicional`}
                                                className="w-full h-full object-cover"
                                                style={{ filter: 'brightness(1.05) contrast(0.95)' }}
                                              />
                                            </div>
                                          </CarouselItem>
                                        </>
                                      )}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-4 bg-black/60 text-white border-none hover:bg-black/80" />
                                    <CarouselNext className="right-4 bg-black/60 text-white border-none hover:bg-black/80" />
                                  </Carousel>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ganhadores">
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
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWinners.map((winner) => (
                      <TableRow key={winner.id}>
                        <TableCell className="font-medium">{winner.name}</TableCell>
                        <TableCell>{winner.raffle}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {winner.number}
                          </Badge>
                        </TableCell>
                        <TableCell>{winner.prize}</TableCell>
                        <TableCell>{new Date(winner.drawDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
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
                                  Informações completas sobre o ganhador
                                </DialogDescription>
                              </DialogHeader>
                              {selectedWinner && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Nome</Label>
                                      <p className="text-sm text-foreground-muted">{selectedWinner.name}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Número Sorteado</Label>
                                      <p className="text-sm text-foreground-muted font-mono">{selectedWinner.number}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Rifa</Label>
                                    <p className="text-sm text-foreground-muted">{selectedWinner.raffle}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Prêmio</Label>
                                    <p className="text-sm text-foreground-muted">{selectedWinner.prize}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Data do Sorteio</Label>
                                    <p className="text-sm text-foreground-muted">{new Date(selectedWinner.drawDate).toLocaleDateString()}</p>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AllRaffles;
