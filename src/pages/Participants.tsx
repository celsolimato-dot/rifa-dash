import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ParticipantService, Participant, ParticipantRaffle } from "../services/participantService";
import { 
  Search, 
  Filter, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Trophy,
  Ticket,
  DollarSign,
  Users,
  TrendingUp,
  Download
} from "lucide-react";

const participantService = new ParticipantService();

// Dados mockados removidos - agora usando dados reais do ParticipantService

export default function Participants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [participantRaffles, setParticipantRaffles] = useState<ParticipantRaffle[]>([]);
  const [isLoadingRaffles, setIsLoadingRaffles] = useState(false);

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      setIsLoading(true);
      const data = await participantService.getAllParticipants();
      setParticipants(data);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadParticipantRaffles = async (participantId: string) => {
    try {
      setIsLoadingRaffles(true);
      const data = await participantService.getParticipantRaffles(participantId);
      setParticipantRaffles(data);
    } catch (error) {
      console.error('Erro ao carregar rifas do participante:', error);
      setParticipantRaffles([]);
    } finally {
      setIsLoadingRaffles(false);
    }
  };

  const filteredParticipants = useMemo(() => {
    return participants.filter(participant => {
      const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           participant.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || participant.status === statusFilter;
      const matchesState = stateFilter === "all" || participant.state === stateFilter;
      
      return matchesSearch && matchesStatus && matchesState;
    });
  }, [participants, searchTerm, statusFilter, stateFilter]);

  const stats = useMemo(() => {
    const total = participants.length;
    const active = participants.filter(p => p.status === "active").length;
    const totalRevenue = participants.reduce((sum, p) => sum + p.totalSpent, 0);
    const totalTickets = participants.reduce((sum, p) => sum + p.totalTickets, 0);
    
    return { total, active, totalRevenue, totalTickets };
  }, [participants]);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      blocked: "bg-red-100 text-red-800"
    };
    
    const labels = {
      active: "Ativo",
      inactive: "Inativo",
      blocked: "Bloqueado"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Participantes</h1>
          <p className="text-foreground-muted">Gerencie todos os participantes das rifas</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4 mr-2" />
          Exportar Dados
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Total de Participantes</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Participantes Ativos</p>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Receita Total</p>
                <p className="text-2xl font-bold text-foreground">R$ {stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Bilhetes Vendidos</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalTickets}</p>
              </div>
              <Ticket className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Participantes ({filteredParticipants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-foreground-muted">Participante</th>
                  <th className="text-left p-4 font-medium text-foreground-muted">Contato</th>
                  <th className="text-left p-4 font-medium text-foreground-muted">Localização</th>
                  <th className="text-left p-4 font-medium text-foreground-muted">Estatísticas</th>
                  <th className="text-left p-4 font-medium text-foreground-muted">Status</th>
                  <th className="text-left p-4 font-medium text-foreground-muted">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{participant.name}</p>
                          <p className="text-sm text-foreground-muted">
                            Cadastrado em {new Date(participant.registrationDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-foreground-muted" />
                          {participant.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 mr-2 text-foreground-muted" />
                          {participant.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-foreground-muted" />
                        {participant.city}, {participant.state}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Ticket className="w-4 h-4 mr-2 text-foreground-muted" />
                          {participant.totalTickets} bilhetes
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-foreground-muted" />
                          R$ {participant.totalSpent.toFixed(2)}
                        </div>
                        <div className="flex items-center">
                          <Trophy className="w-4 h-4 mr-2 text-foreground-muted" />
                          {participant.wins} vitórias
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(participant.status)}
                    </td>
                    <td className="p-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedParticipant(participant);
                              loadParticipantRaffles(participant.id);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Participante</DialogTitle>
                          </DialogHeader>
                          
                          {selectedParticipant && (
                            <div className="space-y-6">
                              {/* Participant Info */}
                              <div className="flex items-start space-x-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={selectedParticipant.avatar} />
                                  <AvatarFallback className="text-lg">
                                    {getInitials(selectedParticipant.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="text-xl font-semibold">{selectedParticipant.name}</h3>
                                  <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                      <p className="text-sm font-medium text-foreground-muted">Email</p>
                                      <p className="text-foreground">{selectedParticipant.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-foreground-muted">Telefone</p>
                                      <p className="text-foreground">{selectedParticipant.phone}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-foreground-muted">Localização</p>
                                      <p className="text-foreground">{selectedParticipant.city}, {selectedParticipant.state}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-foreground-muted">Status</p>
                                      {getStatusBadge(selectedParticipant.status)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-4 gap-4">
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-foreground">{selectedParticipant.totalTickets}</p>
                                    <p className="text-sm text-foreground-muted">Bilhetes Comprados</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-foreground">R$ {selectedParticipant.totalSpent.toFixed(2)}</p>
                                    <p className="text-sm text-foreground-muted">Total Gasto</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-foreground">{selectedParticipant.rafflesParticipated}</p>
                                    <p className="text-sm text-foreground-muted">Rifas Participadas</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-foreground">{selectedParticipant.wins}</p>
                                    <p className="text-sm text-foreground-muted">Vitórias</p>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Raffles History */}
                              <div>
                                <h4 className="text-lg font-semibold mb-4">Histórico de Participações</h4>
                                {isLoadingRaffles ? (
                                  <div className="text-center py-8">
                                    <p className="text-foreground-muted">Carregando rifas...</p>
                                  </div>
                                ) : participantRaffles.length === 0 ? (
                                  <div className="text-center py-8">
                                    <p className="text-foreground-muted">Nenhuma participação encontrada.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {participantRaffles.map((raffle) => (
                                      <Card key={raffle.id}>
                                        <CardContent className="p-4">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <h5 className="font-medium">{raffle.raffle_name}</h5>
                                              <p className="text-sm text-foreground-muted">
                                                Bilhetes: {raffle.ticket_numbers.join(', ')}
                                              </p>
                                              <p className="text-sm text-foreground-muted">
                                                Comprado em: {new Date(raffle.purchase_date).toLocaleDateString('pt-BR')}
                                              </p>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-medium">R$ {raffle.amount.toFixed(2)}</p>
                                              <Badge className={
                                                raffle.status === 'winner' ? 'bg-green-100 text-green-800' :
                                                raffle.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                              }>
                                                {raffle.status === 'winner' ? 'Vencedor' :
                                                 raffle.status === 'active' ? 'Ativo' : 'Perdedor'}
                                              </Badge>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}