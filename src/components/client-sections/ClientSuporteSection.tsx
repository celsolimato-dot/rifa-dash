import { useState } from 'react';
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
import { 
  HelpCircle, 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  Send
} from "lucide-react";

interface TicketResponse {
  id: number;
  author: string;
  message: string;
  date: string;
  isSupport: boolean;
}

interface SupportTicket {
  id: number;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
  description: string;
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

export const ClientSuporteSection: React.FC = () => {
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: '',
    description: ''
  });

  // Tickets de suporte reais do banco (integrar com API)
  const tickets: SupportTicket[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto':
        return 'bg-blue-500';
      case 'em_andamento':
        return 'bg-yellow-500';
      case 'resolvido':
        return 'bg-green-500';
      case 'fechado':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aberto':
        return <AlertCircle className="w-4 h-4" />;
      case 'em_andamento':
        return <Clock className="w-4 h-4" />;
      case 'resolvido':
        return <CheckCircle className="w-4 h-4" />;
      case 'fechado':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
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

  const handleSubmitTicket = () => {
    // Implementar envio do ticket
    console.log('Novo ticket:', newTicket);
    setNewTicket({ subject: '', category: '', priority: '', description: '' });
  };

  const openTickets = tickets.filter(t => ['aberto', 'em_andamento'].includes(t.status));
  const resolvedTickets = tickets.filter(t => ['resolvido', 'fechado'].includes(t.status));

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
            <div className="text-2xl font-bold text-foreground">{tickets.length}</div>
            <div className="text-sm text-foreground-muted">Total de Tickets</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-foreground">{openTickets.length}</div>
            <div className="text-sm text-foreground-muted">Em Aberto</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-accent-success" />
            <div className="text-2xl font-bold text-foreground">{resolvedTickets.length}</div>
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
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Criar Ticket de Suporte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gradient-card border-border">
              <DialogHeader>
                <DialogTitle>Novo Ticket de Suporte</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      placeholder="Descreva brevemente o problema"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      className="bg-background-secondary border-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                      <SelectTrigger className="bg-background-secondary border-border">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pagamento">Pagamento</SelectItem>
                        <SelectItem value="tecnico">Problema Técnico</SelectItem>
                        <SelectItem value="duvida">Dúvida Geral</SelectItem>
                        <SelectItem value="conta">Conta/Perfil</SelectItem>
                        <SelectItem value="rifa">Rifa/Sorteio</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
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
                  <Label htmlFor="description">Descrição</Label>
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
                  disabled={!newTicket.subject || !newTicket.description}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Ticket
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
            {tickets.length === 0 ? (
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
                                #{ticket.id} - {ticket.subject}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-foreground-muted">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Criado em {formatDate(ticket.createdAt)}</span>
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {ticket.category}
                                </Badge>
                                <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority === 'urgent' ? 'Urgente' :
                                   ticket.priority === 'high' ? 'Alta' :
                                   ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                                </Badge>
                              </div>
                            </div>
                            
                            <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(ticket.status)}
                                <span>
                                  {ticket.status === 'aberto' ? 'Aberto' :
                                   ticket.status === 'em_andamento' ? 'Em Andamento' :
                                   ticket.status === 'resolvido' ? 'Resolvido' : 'Fechado'}
                                </span>
                              </div>
                            </Badge>
                          </div>
                          
                          {/* Description */}
                          <p className="text-sm text-foreground-muted">
                            {ticket.description}
                          </p>
                          
                          {/* Responses */}
                          {ticket.responses.length > 0 && (
                            <div className="space-y-3">
                              <Separator />
                              <h4 className="text-sm font-medium text-foreground">Conversação:</h4>
                              <div className="space-y-3 max-h-40 overflow-y-auto">
                                {ticket.responses.map((response) => (
                                  <div key={response.id} className={`
                                    p-3 rounded-lg text-sm
                                    ${response.isSupport 
                                      ? 'bg-primary/10 border border-primary/20 ml-4' 
                                      : 'bg-background border border-border mr-4'
                                    }
                                  `}>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <User className="w-3 h-3" />
                                      <span className="font-medium text-xs">
                                        {response.author}
                                      </span>
                                      <span className="text-xs text-foreground-muted">
                                        {formatDate(response.date)}
                                      </span>
                                    </div>
                                    <p className="text-foreground">
                                      {response.message}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-foreground-muted pt-2 border-t border-border">
                            <span>Última atualização: {formatDate(ticket.updatedAt)}</span>
                            {ticket.status === 'aberto' && (
                              <Button variant="ghost" size="sm">
                                Adicionar resposta
                              </Button>
                            )}
                          </div>
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