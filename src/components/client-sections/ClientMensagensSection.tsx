import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, 
  MailOpen, 
  Search, 
  Star, 
  StarOff, 
  Calendar, 
  Gift,
  Trophy,
  CreditCard,
  Info
} from "lucide-react";

interface Message {
  id: number;
  subject: string;
  content: string;
  sender: string;
  date: string;
  read: boolean;
  starred: boolean;
  category: 'welcome' | 'promotion' | 'winner' | 'purchase' | 'result' | 'general';
  priority: 'low' | 'medium' | 'high';
  prize?: string;
  numbers?: number[];
  winningNumber?: number;
}

export const ClientMensagensSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mensagens reais do banco (integrar com realMessageService)
  const messages: Message[] = [];

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'winner':
        return <Trophy className="w-4 h-4 text-accent-gold" />;
      case 'promotion':
        return <Gift className="w-4 h-4 text-primary" />;
      case 'purchase':
        return <CreditCard className="w-4 h-4 text-accent-success" />;
      case 'result':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Mail className="w-4 h-4 text-foreground-muted" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'winner':
        return <Badge variant="default" className="bg-accent-gold text-black">Prêmio</Badge>;
      case 'promotion':
        return <Badge variant="default" className="bg-primary">Promoção</Badge>;
      case 'purchase':
        return <Badge variant="default" className="bg-accent-success">Compra</Badge>;
      case 'result':
        return <Badge variant="outline">Resultado</Badge>;
      case 'welcome':
        return <Badge variant="secondary">Boas-vindas</Badge>;
      default:
        return <Badge variant="outline">Geral</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-green-500';
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

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Mensagens</h1>
        <p className="text-foreground-muted">
          Acompanhe todas as suas mensagens e notificações
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <Mail className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-foreground">{messages.length}</div>
            <div className="text-sm text-foreground-muted">Total de Mensagens</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <MailOpen className="w-8 h-8 mx-auto mb-2 text-accent-success" />
            <div className="text-2xl font-bold text-foreground">{unreadCount}</div>
            <div className="text-sm text-foreground-muted">Não Lidas</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-accent-gold" />
            <div className="text-2xl font-bold text-foreground">
              {messages.filter(m => m.starred).length}
            </div>
            <div className="text-sm text-foreground-muted">Favoritas</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-primary" />
            <span>Pesquisar Mensagens</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
            <Input
              placeholder="Digite para pesquisar mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background-secondary border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <span>Suas Mensagens</span>
            </span>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} não lidas</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Todas as suas mensagens e notificações importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 mx-auto mb-4 text-foreground-muted opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem ainda'}
                </h3>
                <p className="text-foreground-muted">
                  {searchTerm 
                    ? 'Tente ajustar sua pesquisa.' 
                    : 'Suas mensagens aparecerão aqui quando você recebê-las.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message, index) => (
                  <div key={message.id}>
                    <Card className={`
                      bg-background-secondary border-border hover:border-primary/20 transition-all cursor-pointer
                      border-l-4 ${getPriorityColor(message.priority)}
                      ${!message.read ? 'bg-primary/5' : ''}
                    `}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between space-x-4">
                          <div className="flex items-start space-x-3 flex-1">
                            {getCategoryIcon(message.category)}
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className={`font-semibold ${!message.read ? 'text-foreground' : 'text-foreground-muted'}`}>
                                  {message.subject}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  {getCategoryBadge(message.category)}
                                  <Button variant="ghost" size="sm" className="p-1">
                                    {message.starred ? (
                                      <Star className="w-4 h-4 fill-accent-gold text-accent-gold" />
                                    ) : (
                                      <StarOff className="w-4 h-4 text-foreground-muted" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-sm text-foreground-muted line-clamp-2">
                                {message.content}
                              </p>
                              
                              {/* Special content for different message types */}
                              {message.prize && (
                                <div className="p-2 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <Trophy className="w-4 h-4 text-accent-gold" />
                                    <span className="text-sm font-medium text-accent-gold">
                                      Prêmio: {message.prize}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {message.numbers && (
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-xs text-foreground-muted">Números:</span>
                                  {message.numbers.map((number, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {number.toString().padStart(4, '0')}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {message.winningNumber && (
                                <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <Info className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-primary">
                                      Número sorteado: {message.winningNumber.toString().padStart(4, '0')}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between text-xs text-foreground-muted">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(message.date)}</span>
                                </span>
                                <span>De: {message.sender}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!message.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {index < filteredMessages.length - 1 && (
                      <Separator className="my-2" />
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