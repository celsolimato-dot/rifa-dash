import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  Plus,
  MessageCircle,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Phone,
  Mail,
  MessageSquare
} from "lucide-react";

export const ClientSuporteSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: '',
    description: ''
  });

  // Mock data - em produção viria de uma API
  const tickets = [
    {
      id: 1,
      subject: 'Problema com pagamento da rifa',
      category: 'Pagamento',
      priority: 'high',
      status: 'aberto',
      description: 'Realizei o pagamento da rifa do iPhone mas não apareceu como confirmado no sistema.',
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T14:20:00',
      responses: [
        {
          id: 1,
          author: 'Suporte Rifa Dash',
          message: 'Olá! Recebemos sua solicitação e estamos verificando o status do seu pagamento. Em breve retornaremos com uma resposta.',
          date: '2024-01-15T11:00:00',
          isSupport: true
        },
        {
          id: 2,
          author: 'Você',
          message: 'Obrigado pelo retorno. Aguardo a resolução.',
          date: '2024-01-15T11:30:00',
          isSupport: false
        }
      ]
    },
    {
      id: 2,
      subject: 'Dúvida sobre sorteio',
      category: 'Geral',
      priority: 'medium',
      status: 'resolvido',
      description: 'Gostaria de saber como funciona o processo de sorteio das rifas.',
      createdAt: '2024-01-12T16:45:00',
      updatedAt: '2024-01-13T09:15:00',
      responses: [
        {
          id: 1,
          author: 'Suporte Rifa Dash',
          message: 'Olá! O sorteio é realizado de forma totalmente transparente através de um sistema automatizado. Todos os números vendidos participam do sorteio e o ganhador é escolhido aleatoriamente.',
          date: '2024-01-13T09:15:00',
          isSupport: true
        }
      ]
    },
    {
      id: 3,
      subject: 'Não recebi meu prêmio',
      category: 'Prêmio',
      priority: 'high',
      status: 'em_andamento',
      description: 'Ganhei a rifa do smartwatch há uma semana mas ainda não recebi informações sobre a retirada.',
      createdAt: '2024-01-10T14:20:00',
      updatedAt: '2024-01-14T16:30:00',
      responses: [
        {
          id: 1,
          author: 'Suporte Rifa Dash',
          message: 'Parabéns pelo prêmio! Estamos preparando seu smartwatch para entrega. Você receberá um e-mail com as instruções de retirada em até 2 dias úteis.',
          date: '2024-01-14T16:30:00',
          isSupport: true
        }
      ]
    }
  ];

  const faq = [
    {
      id: 1,
      question: 'Como funciona o sorteio das rifas?',
      answer: 'O sorteio é realizado de forma totalmente transparente através de um sistema automatizado. Todos os números vendidos participam do sorteio e o ganhador é escolhido aleatoriamente na data e horário especificados.'
    },
    {
      id: 2,
      question: 'Como posso acompanhar minhas participações?',
      answer: 'Você pode acompanhar todas suas participações na seção "Minhas Rifas" do seu painel. Lá você verá o status de cada rifa, números participantes e datas dos sorteios.'
    },
    {
      id: 3,
      question: 'Quais são as formas de pagamento aceitas?',
      answer: 'Aceitamos pagamentos via PIX, cartão de crédito, cartão de débito e boleto bancário. O PIX é a forma mais rápida para confirmação da participação.'
    },
    {
      id: 4,
      question: 'Como recebo meu prêmio se ganhar?',
      answer: 'Assim que o sorteio for realizado, entraremos em contato via e-mail e telefone para coordenar a entrega do prêmio. Você pode optar por retirada presencial ou entrega via correios.'
    },
    {
      id: 5,
      question: 'Posso cancelar minha participação?',
      answer: 'Participações podem ser canceladas até 24 horas antes do sorteio. Após esse período, não é possível cancelar devido às regras da rifa.'
    }
  ];

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openTickets = tickets.filter(ticket => ticket.status === 'aberto' || ticket.status === 'em_andamento');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'resolvido': return 'bg-green-100 text-green-800';
      case 'fechado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aberto': return <AlertCircle className="w-4 h-4" />;
      case 'em_andamento': return <Clock className="w-4 h-4" />;
      case 'resolvido': return <CheckCircle className="w-4 h-4" />;
      case 'fechado': return <XCircle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleSubmitTicket = () => {
    // Aqui seria feita a submissão do ticket para a API
    console.log('Novo ticket:', newTicket);
    setShowNewTicketForm(false);
    setNewTicket({ subject: '', category: '', priority: '', description: '' });
  };

  const TicketCard = ({ ticket }: { ticket: any }) => (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground mb-2">
              #{ticket.id} - {ticket.subject}
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className={getStatusColor(ticket.status)}>
                {getStatusIcon(ticket.status)}
                <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
              </Badge>
              <Badge variant="outline">
                {ticket.category}
              </Badge>
              <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority === 'high' ? 'Alta' : 
                 ticket.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-foreground-muted">{ticket.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-foreground-muted">Criado em:</span>
            <p className="font-medium text-foreground">{formatDate(ticket.createdAt)}</p>
          </div>
          <div>
            <span className="text-foreground-muted">Última atualização:</span>
            <p className="font-medium text-foreground">{formatDate(ticket.updatedAt)}</p>
          </div>
        </div>
        
        {ticket.responses && ticket.responses.length > 0 && (
          <div>
            <h4 className="font-medium text-foreground mb-2">Última resposta:</h4>
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {ticket.responses[ticket.responses.length - 1].author}
                </span>
                <span className="text-xs text-foreground-muted">
                  {formatDate(ticket.responses[ticket.responses.length - 1].date)}
                </span>
              </div>
              <p className="text-sm text-foreground-muted">
                {ticket.responses[ticket.responses.length - 1].message}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            Ver Detalhes
          </Button>
          {ticket.status !== 'resolvido' && ticket.status !== 'fechado' && (
            <Button size="sm">
              Responder
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const FAQCard = ({ faq }: { faq: any }) => (
    <Card className="bg-gradient-card border-border">
      <CardContent className="p-4">
        <h4 className="font-medium text-foreground mb-2">{faq.question}</h4>
        <p className="text-foreground-muted text-sm">{faq.answer}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suporte</h1>
          <p className="text-foreground-muted">Central de atendimento e ajuda</p>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowNewTicketForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Ticket
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Tickets Abertos
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{openTickets.length}</div>
            <p className="text-xs text-foreground-muted">
              Aguardando resposta
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Total de Tickets
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{tickets.length}</div>
            <p className="text-xs text-foreground-muted">
              Histórico completo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Tempo Médio
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2h</div>
            <p className="text-xs text-foreground-muted">
              Resposta do suporte
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contatos Rápidos */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle>Contatos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Telefone</p>
                <p className="text-sm text-foreground-muted">(11) 9999-9999</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-sm text-foreground-muted">suporte@rifadash.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <MessageSquare className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">WhatsApp</p>
                <p className="text-sm text-foreground-muted">(11) 99999-9999</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Novo Ticket */}
      {showNewTicketForm && (
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle>Abrir Novo Ticket de Suporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground-muted">Assunto</label>
                <Input
                  placeholder="Descreva brevemente o problema"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground-muted">Categoria</label>
                <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pagamento">Pagamento</SelectItem>
                    <SelectItem value="premio">Prêmio</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground-muted">Prioridade</label>
              <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground-muted">Descrição</label>
              <Textarea
                placeholder="Descreva detalhadamente o problema ou dúvida"
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                rows={4}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleSubmitTicket}>
                Enviar Ticket
              </Button>
              <Button variant="outline" onClick={() => setShowNewTicketForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tickets">
            Meus Tickets ({filteredTickets.length})
          </TabsTrigger>
          <TabsTrigger value="faq">
            FAQ ({faq.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <Card className="bg-gradient-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum ticket encontrado
                </h3>
                <p className="text-foreground-muted text-center">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca.'
                    : 'Você ainda não abriu nenhum ticket de suporte.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {faq.map((item) => (
              <FAQCard key={item.id} faq={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};