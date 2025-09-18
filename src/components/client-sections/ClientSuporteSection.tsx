import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SupportTicketService, SupportTicket, SupportMessage, CreateTicketData } from '@/services/supportTicketService';
import { 
  HelpCircle, 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  Send,
  X,
  Loader2
} from "lucide-react";

export const ClientSuporteSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketMessages, setTicketMessages] = useState<{ [key: string]: SupportMessage[] }>({});
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, inProgress: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<CreateTicketData>({
    subject: '',
    description: '',
    priority: 'medium'
  });
  const [newMessage, setNewMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      loadTicketsData();
    }
  }, [user]);

  const loadTicketsData = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        SupportTicketService.getUserTickets(user.email),
        SupportTicketService.getTicketStats(user.email)
      ]);
      
      setTickets(ticketsData);
      setStats(statsData);

      // Load messages for each ticket
      const messagesPromises = ticketsData.map(async (ticket) => {
        const messages = await SupportTicketService.getTicketMessages(ticket.id);
        return { ticketId: ticket.id, messages };
      });

      const messagesResults = await Promise.all(messagesPromises);
      const messagesMap: { [key: string]: SupportMessage[] } = {};
      messagesResults.forEach(({ ticketId, messages }) => {
        messagesMap[ticketId] = messages;
      });
      setTicketMessages(messagesMap);

    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tickets de suporte.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getPriorityLabel = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitTicket = async () => {
    if (!user || !newTicket.subject || !newTicket.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await SupportTicketService.createTicket(newTicket, {
        id: user.id!,
        email: user.email!,
        name: user.name || user.email!
      });

      if (result.success) {
        toast({
          title: "Ticket criado com sucesso!",
          description: `Ticket #${result.ticket?.ticket_number} foi criado. Nossa equipe entrará em contato em breve.`,
        });
        setNewTicket({ subject: '', description: '', priority: 'medium' });
        setIsModalOpen(false);
        loadTicketsData(); // Reload tickets
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Erro ao criar ticket:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o ticket. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (ticketId: string) => {
    if (!user || !newMessage.trim()) return;

    try {
      const result = await SupportTicketService.sendMessage(
        { ticket_id: ticketId, message: newMessage },
        { id: user.id!, name: user.name || user.email! }
      );

      if (result.success) {
        setNewMessage('');
        loadTicketsData(); // Reload to get updated messages
        toast({
          title: "Mensagem enviada",
          description: "Sua mensagem foi enviada com sucesso.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const result = await SupportTicketService.closeTicket(ticketId);
      
      if (result.success) {
        toast({
          title: "Ticket fechado",
          description: "Ticket fechado com sucesso.",
        });
        loadTicketsData(); // Reload tickets
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Erro ao fechar ticket:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fechar o ticket.",
        variant: "destructive",
      });
    }
  };

  const openTickets = tickets.filter(t => ['open', 'in_progress'].includes(t.status));
  const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Central de Suporte</h1>
        <p className="text-foreground-muted">
          Precisa de ajuda? Crie um ticket de suporte ou consulte seus tickets existentes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-foreground-muted">Total de Tickets</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-foreground">{stats.open + stats.inProgress}</div>
            <div className="text-sm text-foreground-muted">Em Aberto</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-accent-success" />
            <div className="text-2xl font-bold text-foreground">{stats.closed}</div>
            <div className="text-sm text-foreground-muted">Resolvidos</div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Ticket */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Abrir Novo Ticket</span>
          </CardTitle>
          <CardDescription>
            Descreva sua dúvida ou problema e nossa equipe te ajudará
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Ticket de Suporte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gradient-card border-border">
              <DialogHeader>
                <DialogTitle>Novo Ticket de Suporte</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto *</Label>
                  <Input
                    id="subject"
                    placeholder="Descreva brevemente o problema"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    className="bg-background-secondary border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket({ ...newTicket, priority: value })}>
                    <SelectTrigger className="bg-background-secondary border-border">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente seu problema ou dúvida..."
                    rows={6}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="bg-background-secondary border-border"
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitTicket} 
                  className="w-full"
                  disabled={!newTicket.subject || !newTicket.description || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando Ticket...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Ticket
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Seus Tickets</span>
          </CardTitle>
          <CardDescription>
            Acompanhe o status de todos os seus tickets de suporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-background-secondary border-border">
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 mx-auto mb-4 text-foreground-muted opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum ticket ainda
                </h3>
                <p className="text-foreground-muted">
                  Quando você criar um ticket de suporte, ele aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={ticket.id}>
                    <Card className="bg-background-secondary border-border hover:border-primary/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-foreground">
                                #{ticket.ticket_number} - {ticket.subject}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-foreground-muted">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Criado em {formatDate(ticket.created_at)}</span>
                                </span>
                                <Badge className={`text-xs border ${getPriorityColor(ticket.priority)}`}>
                                  {getPriorityLabel(ticket.priority)}
                                </Badge>
                              </div>
                            </div>
                            
                            <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(ticket.status)}
                                <span>{getStatusLabel(ticket.status)}</span>
                              </div>
                            </Badge>
                          </div>
                          
                          {/* Description */}
                          <p className="text-sm text-foreground-muted">
                            {ticket.description}
                          </p>
                          
                          {/* Messages */}
                          {ticketMessages[ticket.id] && ticketMessages[ticket.id].length > 0 && (
                            <div className="space-y-3">
                              <Separator />
                              <h4 className="text-sm font-medium text-foreground">Conversação:</h4>
                              <div className="space-y-3 max-h-40 overflow-y-auto">
                                {ticketMessages[ticket.id].map((message) => (
                                  <div key={message.id} className={`
                                    p-3 rounded-lg text-sm border
                                    ${message.sender_type === 'admin' 
                                      ? 'bg-primary/10 border-primary/20 ml-4' 
                                      : 'bg-background border-border mr-4'
                                    }
                                  `}>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <User className="w-3 h-3" />
                                      <span className="font-medium text-xs">
                                        {message.sender_name}
                                      </span>
                                      <span className="text-xs text-foreground-muted">
                                        {formatDate(message.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-foreground">
                                      {message.message}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-foreground-muted pt-2 border-t border-border">
                            <span>Última atualização: {formatDate(ticket.updated_at)}</span>
                            <div className="flex space-x-2">
                              {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedTicketId(selectedTicketId === ticket.id ? null : ticket.id)}
                                  >
                                    {selectedTicketId === ticket.id ? 'Cancelar' : 'Responder'}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleCloseTicket(ticket.id)}
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Fechar
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Reply form */}
                          {selectedTicketId === ticket.id && (
                            <div className="space-y-3 pt-3 border-t border-border">
                              <Textarea
                                placeholder="Digite sua mensagem..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="bg-background-secondary border-border"
                                rows={3}
                              />
                              <Button 
                                onClick={() => handleSendMessage(ticket.id)}
                                disabled={!newMessage.trim()}
                                size="sm"
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Enviar Mensagem
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {index < tickets.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};