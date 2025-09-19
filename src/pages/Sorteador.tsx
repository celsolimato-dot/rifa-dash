import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { RaffleService, Raffle } from "../services/raffleService";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Users, 
  Ticket,
  Calendar,
  Gift,
  Sparkles,
  Download,
  Share2,
  CheckCircle
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  email: string;
  ticketNumbers: string[];
}

interface DrawResult {
  winnerTicket: string;
  winner: Participant;
  timestamp: string;
}

export default function Sorteador() {
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<string>("");
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    try {
      setIsLoading(true);
      // Buscar rifas ativas e completadas
      const [activeRaffles, completedRaffles] = await Promise.all([
        RaffleService.getRaffles({ status: 'active' }),
        RaffleService.getRaffles({ status: 'completed' })
      ]);
      
      // Combinar e ordenar: rifas ativas primeiro, depois completadas
      const allRaffles = [
        ...(activeRaffles || []),
        ...(completedRaffles || [])
      ].sort((a, b) => {
        // Rifas ativas primeiro
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (b.status === 'active' && a.status !== 'active') return 1;
        
        // Dentro do mesmo status, ordenar por data
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setRaffles(allRaffles);
    } catch (error) {
      console.error('Erro ao carregar rifas:', error);
      setRaffles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadParticipants = async (raffleId: string) => {
    try {
      setLoadingParticipants(true);
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('number, buyer_name, buyer_email, buyer_phone, purchase_date')
        .eq('raffle_id', raffleId)
        .eq('status', 'sold')
        .order('number', { ascending: true });

      if (error) {
        console.error('Erro ao carregar participantes:', error);
        setParticipants([]);
        return;
      }

      // Group tickets by buyer to show participants
      const participantsMap = new Map();
      tickets?.forEach(ticket => {
        const key = ticket.buyer_email;
        if (participantsMap.has(key)) {
          participantsMap.get(key).ticketNumbers.push(ticket.number.toString());
        } else {
          participantsMap.set(key, {
            id: ticket.buyer_email,
            name: ticket.buyer_name,
            email: ticket.buyer_email,
            phone: ticket.buyer_phone,
            purchaseDate: ticket.purchase_date,
            ticketNumbers: [ticket.number.toString()]
          });
        }
      });

      setParticipants(Array.from(participantsMap.values()));
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Animation for number rolling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isDrawing && selectedRaffle) {
      interval = setInterval(() => {
        const randomTicket = String(Math.floor(Math.random() * selectedRaffle.total_tickets) + 1).padStart(3, '0');
        setCurrentNumber(randomTicket);
        setProgress(prev => Math.min(prev + 2, 100));
      }, 50);
    }

    return () => clearInterval(interval);
  }, [isDrawing, selectedRaffle]);

  const startDraw = async () => {
    if (!selectedRaffle) return;
    
    // Verificar autenticação antes de iniciar
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      toast.error('Erro: Você precisa estar logado para realizar sorteios');
      return;
    }
    
    console.log('🔐 Usuário autenticado para sorteio:', currentUser.email);
    
    // Check if raffle is already completed
    if (selectedRaffle.status === 'completed' && selectedRaffle.winner_name) {
      toast.error('Esta rifa já foi sorteada!');
      return;
    }
    
    setIsDrawing(true);
    setDrawResult(null);
    setProgress(0);
    setShowConfetti(false);
    
    // Simulate draw duration
    setTimeout(() => {
      finishDraw();
    }, 5000);
  };

  const finishDraw = async () => {
    if (!selectedRaffle) return;
    
    setIsDrawing(false);
    setProgress(100);
    
    // Get all sold tickets from database
    const { data: tickets } = await supabase
      .from('tickets')
      .select('number, buyer_name, buyer_email')
      .eq('raffle_id', selectedRaffle.id)
      .eq('status', 'sold');
    
    if (!tickets || tickets.length === 0) {
      toast.error('Nenhum bilhete vendido para esta rifa');
      return;
    }
    
    // Select random winner
    const winnerTicket = tickets[Math.floor(Math.random() * tickets.length)];
    const winner: any = {
      id: winnerTicket.buyer_email,
      name: winnerTicket.buyer_name,
      email: winnerTicket.buyer_email,
      phone: '',
      city: '',
      state: '',
      registration_date: '',
      total_tickets: 0,
      total_spent: 0,
      raffles_participated: 0,
      wins: 0,
      status: 'active',
      last_activity: '',
      ticketNumbers: [winnerTicket.number.toString()]
    };
    
    if (winner) {
      try {
        console.log('🔍 Iniciando salvamento do sorteio...');
        console.log('🎯 Dados do vencedor:', {
          name: winnerTicket.buyer_name,
          email: winnerTicket.buyer_email,
          number: winnerTicket.number.toString()
        });
        console.log('🎲 Rifa selecionada:', selectedRaffle.id);
        
        // Verificar autenticação atual
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        console.log('👤 Usuário atual:', currentUser?.id, currentUser?.email);
        
        if (!currentUser) {
          console.error('❌ Usuário não autenticado!');
          toast.error('Erro: Usuário não autenticado. Faça login novamente.');
          return;
        }
        
        // Update raffle with winner information and change status to completed
        console.log('💾 Tentando salvar resultado...');
        const { data: updateResult, error } = await supabase
          .from('raffles')
          .update({
            status: 'completed',
            winner_name: winnerTicket.buyer_name,
            winner_email: winnerTicket.buyer_email,
            winning_number: winnerTicket.number.toString(),
            draw_completed_at: new Date().toISOString()
          })
          .eq('id', selectedRaffle.id)
          .select();

        console.log('📊 Resultado da atualização:', { updateResult, error });

        if (error) {
          console.error('❌ Erro ao salvar resultado do sorteio:', error);
          toast.error(`Erro ao salvar resultado: ${error.message}`);
          return;
        }

        if (!updateResult || updateResult.length === 0) {
          console.error('❌ Nenhuma linha foi atualizada!');
          toast.error('Erro: Nenhuma rifa foi atualizada');
          return;
        }

        console.log('✅ Sorteio salvo com sucesso!', updateResult);

        const result: DrawResult = {
          winnerTicket: winnerTicket.number.toString(),
          winner: winner,
          timestamp: new Date().toISOString()
        };
        
        setCurrentNumber(winnerTicket.number.toString());
        setDrawResult(result);
        setShowConfetti(true);
        
        toast.success(`🎉 Sorteio realizado! Vencedor: ${winnerTicket.buyer_name}`);
        
        // Reload raffles to update the list
        loadRaffles();
      } catch (error) {
        console.error('Erro ao finalizar sorteio:', error);
        toast.error('Erro ao finalizar sorteio');
      }
    }
  };

  const resetDraw = () => {
    setIsDrawing(false);
    setCurrentNumber("");
    setDrawResult(null);
    setProgress(0);
    setShowConfetti(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800"
    };
    
    const labels = {
      active: "Ativa",
      completed: "Finalizada",
      cancelled: "Cancelada"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sorteador</h1>
          <p className="text-foreground-muted">Realize sorteios das rifas de forma transparente</p>
        </div>
        {drawResult && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar Resultado
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Baixar Certificado
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Raffle Selection */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Rifa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {raffles.filter(r => r.status === "active" || (r.status === "completed" && r.winner_name)).map((raffle) => (
                <Card 
                  key={raffle.id} 
                  className={`cursor-pointer transition-all ${
                    selectedRaffle?.id === raffle.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    if (raffle.status === "active") {
                      setSelectedRaffle(raffle);
                      loadParticipants(raffle.id);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm">{raffle.title}</h3>
                        {raffle.status === "completed" && raffle.winner_name ? (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                            <Trophy className="w-3 h-3 mr-1" />
                            Sorteada
                          </Badge>
                        ) : (
                          getStatusBadge(raffle.status)
                        )}
                      </div>
                      
                      {raffle.status === "completed" && raffle.winner_name ? (
                        <div className="text-xs text-foreground-muted bg-yellow-50 p-2 rounded">
                          <div>Vencedor: <span className="font-medium">{raffle.winner_name}</span></div>
                          <div>Número: <span className="font-medium">{raffle.winning_number}</span></div>
                          <div>Sorteio: {raffle.draw_completed_at && new Date(raffle.draw_completed_at).toLocaleString('pt-BR')}</div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center">
                              <Ticket className="w-3 h-3 mr-1 text-foreground-muted" />
                               {raffle.sold_tickets}/{raffle.total_tickets}
                             </div>
                             <div className="flex items-center">
                               <Users className="w-3 h-3 mr-1 text-foreground-muted" />
                               {raffle.sold_tickets}
                            </div>
                          </div>
                          
                          <div className="flex items-center text-xs">
                            <Calendar className="w-3 h-3 mr-1 text-foreground-muted" />
                            Sorteio: {new Date(raffle.draw_date).toLocaleDateString('pt-BR')}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {selectedRaffle && (
            <Card>
              <CardHeader>
                <CardTitle>Informações da Rifa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedRaffle.title}</h3>
                  <p className="text-sm text-foreground-muted">{selectedRaffle.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground-muted">Total de Bilhetes</p>
                     <p className="text-lg font-bold">{selectedRaffle.total_tickets}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-foreground-muted">Vendidos</p>
                     <p className="text-lg font-bold text-green-600">{selectedRaffle.sold_tickets}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-foreground-muted">Participantes</p>
                     <p className="text-lg font-bold">{participants.length}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-foreground-muted">Valor</p>
                     <p className="text-lg font-bold">R$ {selectedRaffle.prize_value.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Draw Interface */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Sorteio
                {showConfetti && <Sparkles className="w-5 h-5 ml-2 text-yellow-500 animate-pulse" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedRaffle ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Gift className="w-16 h-16 text-foreground-muted mb-4" />
                  <h3 className="text-lg font-medium text-foreground-muted">Selecione uma rifa</h3>
                  <p className="text-foreground-muted">Escolha uma rifa ativa para realizar o sorteio</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Number Display */}
                  <div className="text-center">
                    <div className={`
                      inline-flex items-center justify-center w-32 h-32 rounded-full text-4xl font-bold
                      ${isDrawing ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white animate-pulse' : 
                        drawResult ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                        'bg-muted text-foreground-muted'}
                      transition-all duration-300
                    `}>
                      {currentNumber || "000"}
                    </div>
                    
                    {isDrawing && (
                      <div className="mt-4">
                        <p className="text-sm text-foreground-muted mb-2">Sorteando...</p>
                        <Progress value={progress} className="w-64 mx-auto" />
                      </div>
                    )}
                    
                    {drawResult && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-lg font-medium text-green-600">Sorteio Realizado!</span>
                        </div>
                        <p className="text-sm text-foreground-muted">
                          Bilhete sorteado: <span className="font-bold">{drawResult.winnerTicket}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Winner Info */}
                  {drawResult && (
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <CardContent className="p-6 text-center">
                        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">🎉 Parabéns!</h3>
                        <p className="text-lg font-medium text-foreground">{drawResult.winner.name}</p>
                        <p className="text-foreground-muted">{drawResult.winner.email}</p>
                        <p className="text-sm text-foreground-muted mt-2">
                          Sorteio realizado em: {new Date(drawResult.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Controls */}
                  <div className="flex justify-center space-x-4">
                    {!isDrawing && !drawResult && (
                      <Button 
                        onClick={startDraw}
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Iniciar Sorteio
                      </Button>
                    )}
                    
                    {isDrawing && (
                      <Button 
                        onClick={() => setIsDrawing(false)}
                        variant="outline"
                        size="lg"
                      >
                        <Pause className="w-5 h-5 mr-2" />
                        Pausar
                      </Button>
                    )}
                    
                    {(drawResult || (!isDrawing && currentNumber)) && (
                      <Button 
                        onClick={resetDraw}
                        variant="outline"
                        size="lg"
                      >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Novo Sorteio
                      </Button>
                    )}
                  </div>

                  {/* Participants List */}
                  <div>
                    <h4 className="font-medium mb-3">Participantes ({participants.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {loadingParticipants ? (
                        <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                          Carregando participantes...
                        </div>
                      ) : participants.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                          Nenhum participante encontrado
                        </div>
                      ) : (
                        participants.map((participant, index) => (
                          <div key={participant.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{participant.name}</p>
                              <p className="text-xs text-muted-foreground">{participant.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {participant.ticketNumbers.length} bilhete(s)
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Nºs: {participant.ticketNumbers.slice(0, 3).join(', ')}
                                {participant.ticketNumbers.length > 3 && '...'}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}