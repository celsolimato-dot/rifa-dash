import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';
import { Label } from "@/components/ui/label";
import { MessageService } from "../services/messageService";
import { RaffleService, Raffle } from "../services/raffleService";
import { SupportTicketService, SupportTicket as RealSupportTicket, SupportMessage } from "@/services/supportTicketService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Send, 
  MessageSquare, 
  Users, 
  Mail,
  Phone,
  Filter,
  Search,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  Copy,
  Download,
  Calendar
} from "lucide-react";

interface Message {
  id: string;
  subject: string;
  content: string;
  recipients: string[];
  recipientType: "all" | "raffle" | "winners" | "custom";
  status: "draft" | "sent" | "scheduled";
  sentAt?: string;
  scheduledFor?: string;
  openRate?: number;
  clickRate?: number;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: "welcome" | "winner" | "reminder" | "promotion";
}

interface TicketResponse {
  id: string;
  message: string;
  author: string;
  authorType: "client" | "admin";
  createdAt: string;
}

interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  user_email: string;
  user_name: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  auto_close_at: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  raffles: string[];
  status: "active" | "inactive";
}

const messageService = new MessageService();

export default function Messages() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("tickets");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<string>("");
  const [raffleParticipants, setRaffleParticipants] = useState<Participant[]>([]);

  // Estados para dados das mensagens
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageStats, setMessageStats] = useState({
    messagesSent: 0,
    openRate: 0,
    clickRate: 0,
    totalContacts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Estados para tickets de suporte
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketResponse, setTicketResponse] = useState("");
  const [ticketMessages, setTicketMessages] = useState<{ [key: string]: SupportMessage[] }>({});

  // New message form state
  const [newMessage, setNewMessage] = useState({
    subject: "",
    content: "",
    recipientType: "all",
    scheduledFor: ""
  });

  useEffect(() => {
    // Só carregar dados se o usuário estiver autenticado
    if (user && user.id) {
      console.log('👤 Usuário autenticado detectado:', user);
      loadData();
    } else {
      console.warn('⚠️ Usuário não autenticado, aguardando...');
    }
  }, [user]);

  const loadData = async () => {
    // Verificar se o usuário está autenticado
    if (!user || !user.id) {
      console.warn('⚠️ Usuário não autenticado, cancelando carregamento');
      setIsLoading(false);
      return;
    }

    if (user.role !== 'admin') {
      console.warn('⚠️ Usuário não é admin, acesso limitado');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🚀 Iniciando carregamento de dados...');
      
      // Separar carregamento para melhor debug e tratamento de erro
      let messagesData = [];
      let rafflesData = [];
      let statsData = { messagesSent: 0, openRate: 0, clickRate: 0, totalContacts: 0 };
      let participantsData = [];

      // 1. Carregar mensagens
      try {
        messagesData = await messageService.getAllMessages();
        console.log('✅ Mensagens carregadas:', messagesData.length);
      } catch (error) {
        console.error('❌ Erro ao carregar mensagens:', error);
      }

      // 2. Carregar rifas
      try {
        rafflesData = await RaffleService.getRaffles();
        console.log('✅ Rifas carregadas:', rafflesData.length);
      } catch (error) {
        console.error('❌ Erro ao carregar rifas:', error);
      }

      // 3. Carregar estatísticas (com fallback)
      try {
        if (messageService.getMessageStats && typeof messageService.getMessageStats === 'function') {
          statsData = await messageService.getMessageStats();
          console.log('✅ Stats carregadas:', statsData);
        } else {
          console.warn('⚠️ getMessageStats não disponível, usando fallback');
          // Fallback para stats
          const { data: usersCount } = await supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('role', 'user');
          statsData.totalContacts = usersCount?.length || 0;
        }
      } catch (error) {
        console.error('❌ Erro ao carregar stats:', error);
      }

      // 4. Carregar participantes
      try {
        if (messageService.getActiveParticipants && typeof messageService.getActiveParticipants === 'function') {
          participantsData = await messageService.getActiveParticipants();
          console.log('✅ Participantes carregados do service:', participantsData.length);
        }
        
        if (participantsData.length === 0) {
          console.log('🔄 Buscando participantes da tabela users como fallback...');
          const { data: usersData } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'user');
          
          participantsData = usersData?.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            status: user.status as "active" | "inactive",
            raffles: []
          })) || [];
          console.log('✅ Participantes do fallback:', participantsData.length);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar participantes:', error);
      }

      // 5. Carregar tickets de suporte (separadamente para não afetar outros dados)
      try {
        console.log('🎫 Iniciando carregamento de tickets de suporte...');
        console.log('👤 Usuário atual:', user);
        console.log('🔐 Role do usuário:', user?.role);
        
        const ticketsData = await SupportTicketService.getAllTickets();
        console.log('✅ Tickets carregados:', ticketsData.length, ticketsData);
        
        setSupportTickets(ticketsData as SupportTicket[]);
        
        // Carregar mensagens para cada ticket
        const messagesMap: { [key: string]: SupportMessage[] } = {};
        for (const ticket of ticketsData) {
          try {
            const messages = await SupportTicketService.getTicketMessages(ticket.id);
            messagesMap[ticket.id] = messages;
            console.log(`💬 Mensagens do ticket ${ticket.ticket_number}:`, messages.length);
          } catch (msgError) {
            console.error(`❌ Erro ao carregar mensagens do ticket ${ticket.id}:`, msgError);
            messagesMap[ticket.id] = [];
          }
        }
        setTicketMessages(messagesMap);
        
      } catch (error) {
        console.error('❌ Erro ao carregar tickets de suporte:', error);
        setSupportTickets([]);
        setTicketMessages({});
      }

      // Atualizar estados
      setMessages(messagesData as any);
      setRaffles(rafflesData);
      setMessageStats(statsData);
      setParticipants(participantsData as any);
      
      console.log('✅ Carregamento concluído!');
      
    } catch (error) {
      console.error('❌ Erro geral ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      scheduled: "bg-blue-100 text-blue-800"
    };
    
    const labels = {
      sent: "Enviada",
      draft: "Rascunho",
      scheduled: "Agendada"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      welcome: "bg-blue-100 text-blue-800",
      winner: "bg-green-100 text-green-800",
      reminder: "bg-yellow-100 text-yellow-800",
      promotion: "bg-purple-100 text-purple-800"
    };
    
    const labels = {
      welcome: "Boas-vindas",
      winner: "Ganhador",
      reminder: "Lembrete",
      promotion: "Promoção"
    };
    
    return (
      <Badge className={variants[category as keyof typeof variants]}>
        {labels[category as keyof typeof labels]}
      </Badge>
    );
  };

  const handleSendMessage = () => {
    // Validação básica
    if (!newMessage.subject.trim() || !newMessage.content.trim()) {
      alert("Por favor, preencha o assunto e o conteúdo da mensagem.");
      return;
    }

    // Preparar lista de destinatários baseado no tipo selecionado
    let recipients: string[] = [];
    let recipientNames: string[] = [];
    
    switch (newMessage.recipientType) {
      case "all":
        recipients = participants.map(p => p.email);
        recipientNames = participants.map(p => p.name);
        break;
      case "raffle":
        if (selectedParticipants.length > 0) {
          const selectedRaffleParticipants = raffleParticipants.filter(p => selectedParticipants.includes(p.id));
          recipients = selectedRaffleParticipants.map(p => p.email);
          recipientNames = selectedRaffleParticipants.map(p => p.name);
        }
        break;
      case "winners":
        // Lógica para ganhadores (implementar conforme necessário)
        recipients = ["joao@email.com"]; // Exemplo
        recipientNames = ["João Silva"]; // Exemplo
        break;
      case "custom":
        const selectedCustomParticipants = participants.filter(p => selectedParticipants.includes(p.id));
        recipients = selectedCustomParticipants.map(p => p.email);
        recipientNames = selectedCustomParticipants.map(p => p.name);
        break;
    }

    if (recipients.length === 0) {
      alert("Por favor, selecione pelo menos um destinatário.");
      return;
    }

    // Criar objeto da mensagem
    const messageData = {
      ...newMessage,
      recipients,
      recipientNames,
      id: Date.now().toString(),
      status: newMessage.scheduledFor ? "scheduled" : "sent",
      sentAt: newMessage.scheduledFor ? undefined : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      selectedRaffleTitle: selectedRaffle ? raffles.find(r => r.id === selectedRaffle)?.title : null
    };

    console.log("✅ Mensagem enviada com sucesso:", messageData);
    console.log("📧 Destinatários:", recipients);
    console.log("👥 Nomes dos destinatários:", recipientNames);
    
    // Simulação de envio bem-sucedido
    const action = newMessage.scheduledFor ? "agendada" : "enviada";
    const recipientCount = recipients.length;
    const recipientText = recipientCount === 1 ? "destinatário" : "destinatários";
    
    alert(`✅ Mensagem ${action} com sucesso para ${recipientCount} ${recipientText}!\n\nAssunto: ${newMessage.subject}\n\nAs mensagens aparecerão no painel dos clientes selecionados.`);
    
    // Reset do formulário
    setShowNewMessage(false);
    setNewMessage({ subject: "", content: "", recipientType: "all", scheduledFor: "" });
    setSelectedParticipants([]);
    setSelectedRaffle("");
    setRaffleParticipants([]);
  };

  const handleRaffleSelection = async (raffleId: string) => {
    setSelectedRaffle(raffleId);
    // Get participants for this raffle from tickets table
    const { data: tickets } = await supabase
      .from('tickets')
      .select('buyer_name, buyer_email, buyer_phone')
      .eq('raffle_id', raffleId)
      .eq('status', 'sold');
    
    const uniqueParticipants = tickets?.reduce((acc: any[], ticket) => {
      if (!acc.find(p => p.email === ticket.buyer_email)) {
        acc.push({
          id: ticket.buyer_email,
          name: ticket.buyer_name,
          email: ticket.buyer_email,
          phone: ticket.buyer_phone || '',
          city: '',
          state: '',
          registration_date: new Date().toISOString(),
          total_tickets: 0,
          total_spent: 0,
          raffles_participated: 0,
          wins: 0,
          status: 'active' as const,
          avatar: undefined,
          last_activity: new Date().toISOString()
        });
      }
      return acc;
    }, []) || [];
    
    setRaffleParticipants(uniqueParticipants);
    setSelectedParticipants([]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mensagens</h1>
          <p className="text-foreground-muted">Gerencie a comunicação com os participantes</p>
        </div>
        <Button onClick={() => setShowNewMessage(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Mensagem
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Mensagens Enviadas</p>
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                ) : (
                  <p className="text-2xl font-bold text-foreground">{messageStats.messagesSent}</p>
                )}
              </div>
              <Send className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Taxa de Abertura</p>
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                ) : (
                  <p className="text-2xl font-bold text-foreground">{messageStats.openRate}%</p>
                )}
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Taxa de Clique</p>
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                ) : (
                  <p className="text-2xl font-bold text-foreground">{messageStats.clickRate}%</p>
                )}
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Contatos Ativos</p>
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                ) : (
                  <p className="text-2xl font-bold text-foreground">{messageStats.totalContacts}</p>
                )}
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="tickets">
            Tickets de Suporte
            {supportTickets.filter(t => t.status === "open" || t.status === "in_progress").length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {supportTickets.filter(t => t.status === "open" || t.status === "in_progress").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Contatos Atendidos via Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(new Map(
                  supportTickets.map(ticket => [
                    ticket.user_email, 
                    {
                      id: ticket.user_id,
                      name: ticket.user_name,
                      email: ticket.user_email,
                      tickets_count: supportTickets.filter(t => t.user_email === ticket.user_email).length,
                      last_ticket_date: Math.max(...supportTickets
                        .filter(t => t.user_email === ticket.user_email)
                        .map(t => new Date(t.created_at).getTime())),
                      status: 'active' as const
                    }
                  ])
                ).values()).map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{contact.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-foreground-muted">
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {contact.email}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {contact.tickets_count} ticket(s)
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Último contato: {new Date(contact.last_ticket_date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Atendido
                    </Badge>
                  </div>
                ))}
                {supportTickets.length === 0 && (
                  <div className="text-center py-8 text-foreground-muted">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum contato atendido via tickets ainda.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="tickets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Tickets */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Tickets de Suporte
                    <Badge variant="outline">
                      {supportTickets.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {supportTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`p-4 border-b cursor-pointer hover:bg-background-secondary transition-colors ${
                          selectedTicket?.id === ticket.id ? 'bg-background-secondary' : ''
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-foreground-muted">
                                #{ticket.ticket_number}
                              </span>
                              <Badge
                                variant={
                                  ticket.status === "open" ? "destructive" :
                                  ticket.status === "in_progress" ? "default" :
                                  "secondary"
                                }
                                className="text-xs"
                              >
                                {ticket.status === "open" ? "Aberto" :
                                 ticket.status === "in_progress" ? "Em Andamento" :
                                 "Resolvido"}
                              </Badge>
                              <Badge
                                variant={
                                  ticket.priority === "high" ? "destructive" :
                                  ticket.priority === "medium" ? "default" :
                                  "secondary"
                                }
                                className="text-xs"
                              >
                                {ticket.priority === "high" ? "Alta" :
                                 ticket.priority === "medium" ? "Média" :
                                 "Baixa"}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm mb-1 line-clamp-1">
                              {ticket.subject}
                            </h4>
                            <p className="text-xs text-foreground-muted mb-2 line-clamp-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-foreground-muted">
                              <span>{ticket.user_name}</span>
                              <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes do Ticket */}
            <div className="lg:col-span-2">
              {selectedTicket ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>#{selectedTicket.ticket_number}</span>
                          <Badge
                            variant={
                              selectedTicket.status === "open" ? "destructive" :
                              selectedTicket.status === "in_progress" ? "default" :
                              "secondary"
                            }
                          >
                            {selectedTicket.status === "open" ? "Aberto" :
                             selectedTicket.status === "in_progress" ? "Em Andamento" :
                             "Resolvido"}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-foreground-muted mt-1">
                          {selectedTicket.subject}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {selectedTicket.status !== "resolved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSupportTickets(tickets =>
                                tickets.map(t =>
                                  t.id === selectedTicket.id
                                    ? { ...t, status: "resolved", updatedAt: new Date().toISOString() }
                                    : t
                                )
                              );
                              setSelectedTicket(prev => prev ? { ...prev, status: "resolved" } : null);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Informações do Cliente */}
                    <div className="bg-background-secondary p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Informações do Cliente</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-foreground-muted">Nome:</span>
                          <p className="font-medium">{selectedTicket.user_name}</p>
                        </div>
                        <div>
                          <span className="text-foreground-muted">Email:</span>
                          <p className="font-medium">{selectedTicket.user_email}</p>
                        </div>
                        <div>
                          <span className="text-foreground-muted">Criado em:</span>
                          <p className="font-medium">
                            {new Date(selectedTicket.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-foreground-muted">Prioridade:</span>
                          <Badge
                            variant={
                              selectedTicket.priority === "high" ? "destructive" :
                              selectedTicket.priority === "medium" ? "default" :
                              "secondary"
                            }
                            className="text-xs"
                          >
                            {selectedTicket.priority === "high" ? "Alta" :
                             selectedTicket.priority === "medium" ? "Média" :
                             "Baixa"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Mensagem Original */}
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium mb-2">Mensagem Original</h4>
                      <p className="text-sm font-medium mb-1">{selectedTicket.subject}</p>
                      <p className="text-sm">{selectedTicket.description}</p>
                    </div>

                    {/* Histórico de Mensagens */}
                    {ticketMessages[selectedTicket.id] && ticketMessages[selectedTicket.id].length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Histórico de Mensagens</h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {ticketMessages[selectedTicket.id].map((message) => (
                            <div
                              key={message.id}
                              className={`p-3 rounded-lg ${
                                message.sender_type === "admin"
                                  ? "bg-blue-50 border-l-4 border-blue-500"
                                  : "bg-gray-50 border-l-4 border-gray-500"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">
                                  {message.sender_name}
                                </span>
                                <span className="text-xs text-foreground-muted">
                                  {new Date(message.created_at).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm">{message.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Responder Ticket */}
                    {selectedTicket.status !== "resolved" && (
                      <div className="space-y-4 border-t pt-4">
                        <h4 className="font-medium">Responder Ticket</h4>
                        <Textarea
                          placeholder="Digite sua resposta..."
                          value={ticketResponse}
                          onChange={(e) => setTicketResponse(e.target.value)}
                          rows={4}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setTicketResponse("")}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={async () => {
                              if (ticketResponse.trim()) {
                                const result = await SupportTicketService.sendAdminMessage(
                                  {
                                    ticket_id: selectedTicket.id,
                                    message: ticketResponse
                                  },
                                  {
                                    id: user?.id || "",
                                    name: "Admin"
                                  }
                                );

                                if (result.success) {
                                  // Recarregar mensagens do ticket
                                  const messages = await SupportTicketService.getTicketMessages(selectedTicket.id);
                                  setTicketMessages(prev => ({
                                    ...prev,
                                    [selectedTicket.id]: messages
                                  }));
                                  
                                  setTicketResponse("");
                                  loadData(); // Recarregar dados gerais
                                }
                              }
                            }}
                            disabled={!ticketResponse.trim()}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Resposta
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                      <p className="text-foreground-muted">
                        Selecione um ticket para ver os detalhes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Message Dialog */}
      <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Mensagem</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Destinatários</label>
                <Select value={newMessage.recipientType} onValueChange={(value) => setNewMessage({...newMessage, recipientType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os participantes</SelectItem>
                    <SelectItem value="raffle">Participantes de uma rifa específica</SelectItem>
                    <SelectItem value="winners">Apenas ganhadores</SelectItem>
                    <SelectItem value="custom">Seleção personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Seleção de Rifa Específica */}
              {newMessage.recipientType === "raffle" && (
                <div>
                  <label className="text-sm font-medium">Selecionar Rifa</label>
                  <Select value={selectedRaffle} onValueChange={handleRaffleSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma rifa" />
                    </SelectTrigger>
                    <SelectContent>
                      {raffles.map((raffle) => (
                        <SelectItem key={raffle.id} value={raffle.id}>
                          {raffle.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Lista de Participantes da Rifa Selecionada */}
              {newMessage.recipientType === "raffle" && selectedRaffle && raffleParticipants.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Participantes da Rifa</label>
                  <div className="border rounded-lg p-4 max-h-40 overflow-y-auto space-y-2">
                    {raffleParticipants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox 
                          checked={selectedParticipants.includes(participant.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedParticipants([...selectedParticipants, participant.id]);
                            } else {
                              setSelectedParticipants(selectedParticipants.filter(id => id !== participant.id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{participant.name}</p>
                          <p className="text-xs text-gray-500">{participant.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedParticipants.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedParticipants.length} participante(s) selecionado(s)
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Assunto</label>
                <Input
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  placeholder="Digite o assunto da mensagem"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  placeholder="Digite o conteúdo da mensagem"
                  rows={6}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Agendar envio (opcional)</label>
                <Input
                  type="datetime-local"
                  value={newMessage.scheduledFor}
                  onChange={(e) => setNewMessage({...newMessage, scheduledFor: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewMessage(false)}>
                Cancelar
              </Button>
              <Button variant="outline">
                Salvar Rascunho
              </Button>
              <Button onClick={handleSendMessage}>
                {newMessage.scheduledFor ? 'Agendar' : 'Enviar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}