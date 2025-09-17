import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  MessageCircle,
  Calendar,
  Eye,
  EyeOff,
  Trash2,
  Archive,
  Star,
  StarOff,
  Bell,
  BellOff
} from "lucide-react";

export const ClientMensagensSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - em produção viria de uma API
  const messages = [
    {
      id: 1,
      subject: 'Parabéns! Você ganhou o prêmio!',
      content: 'Olá! Temos uma ótima notícia para você. Você foi o ganhador da rifa do Smartwatch Apple Watch Series 9. Seu número sorteado foi o 19. Entre em contato conosco para retirar seu prêmio.',
      sender: 'Sistema Rifa Dash',
      date: '2024-01-10T20:30:00',
      read: true,
      starred: true,
      category: 'premio',
      priority: 'high'
    },
    {
      id: 2,
      subject: 'Nova rifa disponível: iPhone 15 Pro Max',
      content: 'Uma nova rifa incrível está disponível! iPhone 15 Pro Max 256GB por apenas R$ 25,00 o número. Não perca essa oportunidade única de concorrer a este prêmio incrível.',
      sender: 'Equipe Rifa Dash',
      date: '2024-01-08T14:15:00',
      read: true,
      starred: false,
      category: 'promocao',
      priority: 'medium'
    },
    {
      id: 3,
      subject: 'Confirmação de participação - Notebook Gamer',
      content: 'Sua participação na rifa do Notebook Gamer Acer Nitro 5 foi confirmada com sucesso. Seus números são: 08 e 34. O sorteio será realizado no dia 30/01/2024 às 21:00.',
      sender: 'Sistema Rifa Dash',
      date: '2024-01-08T16:50:00',
      read: false,
      starred: false,
      category: 'confirmacao',
      priority: 'medium'
    },
    {
      id: 4,
      subject: 'Lembrete: Sorteio hoje às 20:00',
      content: 'Não esqueça! Hoje às 20:00 será realizado o sorteio da rifa do Smartwatch Apple Watch Series 9. Você está participando com os números 07 e 19. Boa sorte!',
      sender: 'Sistema Rifa Dash',
      date: '2024-01-10T18:00:00',
      read: true,
      starred: false,
      category: 'lembrete',
      priority: 'high'
    },
    {
      id: 5,
      subject: 'Promoção especial: 20% de desconto',
      content: 'Por tempo limitado, você tem 20% de desconto em todas as rifas. Use o código DESCONTO20 e aproveite esta oportunidade única para participar de mais rifas com preços especiais.',
      sender: 'Marketing Rifa Dash',
      date: '2024-01-05T10:30:00',
      read: true,
      starred: false,
      category: 'promocao',
      priority: 'low'
    },
    {
      id: 6,
      subject: 'Bem-vindo ao Rifa Dash!',
      content: 'Seja bem-vindo ao Rifa Dash! Estamos muito felizes em tê-lo conosco. Explore nossas rifas incríveis e tenha a chance de ganhar prêmios fantásticos. Boa sorte!',
      sender: 'Equipe Rifa Dash',
      date: '2024-01-01T09:00:00',
      read: true,
      starred: true,
      category: 'boas-vindas',
      priority: 'medium'
    }
  ];

  const notifications = [
    {
      id: 1,
      title: 'Novo sorteio em 2 horas',
      description: 'Rifa do iPhone 15 Pro Max será sorteada hoje às 20:00',
      date: '2024-01-15T18:00:00',
      read: false,
      type: 'sorteio'
    },
    {
      id: 2,
      title: 'Pagamento confirmado',
      description: 'Sua participação na rifa do Notebook foi confirmada',
      date: '2024-01-15T16:30:00',
      read: true,
      type: 'pagamento'
    },
    {
      id: 3,
      title: 'Nova rifa disponível',
      description: 'Vale Compras R$ 500 - Participe agora!',
      date: '2024-01-15T14:00:00',
      read: false,
      type: 'nova-rifa'
    }
  ];

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadMessages = messages.filter(msg => !msg.read);
  const starredMessages = messages.filter(msg => msg.starred);

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premio': return 'bg-green-100 text-green-800';
      case 'promocao': return 'bg-blue-100 text-blue-800';
      case 'confirmacao': return 'bg-yellow-100 text-yellow-800';
      case 'lembrete': return 'bg-orange-100 text-orange-800';
      case 'boas-vindas': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '';
    }
  };

  const MessageCard = ({ message }: { message: any }) => (
    <Card className={`bg-gradient-card border-border cursor-pointer transition-all hover:shadow-md ${
      !message.read ? 'ring-2 ring-primary/20' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className={`font-medium truncate ${
                !message.read ? 'text-foreground font-semibold' : 'text-foreground'
              }`}>
                {message.subject}
              </h4>
              {!message.read && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              )}
              {message.starred && (
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              )}
              <span className="text-xs">{getPriorityIcon(message.priority)}</span>
            </div>
            
            <p className="text-sm text-foreground-muted line-clamp-2 mb-3">
              {message.content}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-foreground-muted">{message.sender}</span>
                <Badge variant="outline" className={getCategoryColor(message.category)}>
                  {message.category}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-foreground-muted">
                  {formatDate(message.date)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-4">
            <Button variant="ghost" size="sm">
              {message.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              {message.starred ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <Archive className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const NotificationCard = ({ notification }: { notification: any }) => (
    <Card className={`bg-gradient-card border-border ${
      !notification.read ? 'ring-2 ring-primary/20' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`w-2 h-2 rounded-full mt-2 ${
            !notification.read ? 'bg-primary' : 'bg-muted-foreground'
          }`} />
          
          <div className="flex-1">
            <h4 className={`font-medium ${
              !notification.read ? 'text-foreground font-semibold' : 'text-foreground'
            }`}>
              {notification.title}
            </h4>
            <p className="text-sm text-foreground-muted mt-1">
              {notification.description}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-foreground-muted">
                {formatDate(notification.date)}
              </span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            {notification.read ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mensagens</h1>
          <p className="text-foreground-muted">Central de comunicações e notificações</p>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Total de Mensagens
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{messages.length}</div>
            <p className="text-xs text-foreground-muted">
              Todas as mensagens recebidas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Não Lidas
            </CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{unreadMessages.length}</div>
            <p className="text-xs text-foreground-muted">
              Mensagens pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Favoritas
            </CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{starredMessages.length}</div>
            <p className="text-xs text-foreground-muted">
              Mensagens marcadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="mensagens" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mensagens">
            Mensagens ({filteredMessages.length})
          </TabsTrigger>
          <TabsTrigger value="notificacoes">
            Notificações ({notifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mensagens" className="space-y-4">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))
          ) : (
            <Card className="bg-gradient-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma mensagem encontrada
                </h3>
                <p className="text-foreground-muted text-center">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca.'
                    : 'Suas mensagens aparecerão aqui.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          ) : (
            <Card className="bg-gradient-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma notificação
                </h3>
                <p className="text-foreground-muted text-center">
                  Suas notificações aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};