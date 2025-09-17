import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientHistoryService, ClientTransaction, ClientPrize } from '@/services/clientHistoryService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search,
  Calendar,
  DollarSign,
  Trophy,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  Eye
} from "lucide-react";

export const ClientHistoricoSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadHistoryData();
    }
  }, [user]);

  const loadHistoryData = async () => {
    try {
      setIsLoading(true);
      const [transactionsData, participationsData, prizesData] = await Promise.all([
        ClientHistoryService.getClientTransactions(user!.id),
        ClientHistoryService.getClientTransactions(user!.id), // Reuse for now
        ClientHistoryService.getClientPrizes(user!.id)
      ]);
      
      setTransactions(transactionsData);
      setParticipations(participationsData);
      setPrizes(prizesData);
    } catch (error) {
      console.error('Erro ao carregar dados do histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const filteredTransactions = transactions.filter(transaction =>
    transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredParticipations = participations.filter(participation =>
    participation.raffleTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(amount));
  };

  const TransactionCard = ({ transaction }: { transaction: any }) => (
    <Card className="bg-gradient-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              transaction.type === 'premio' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {transaction.type === 'premio' ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownLeft className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">
                {transaction.title}
              </h4>
              <p className="text-sm text-foreground-muted mt-1">
                {transaction.description}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-foreground-muted">
                  {formatDate(transaction.date)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right ml-4">
            <p className={`font-bold text-lg ${
              transaction.amount > 0 ? 'text-green-600' : 'text-foreground'
            }`}>
              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
            </p>
            <Badge variant={
              transaction.status === 'recebido' ? 'secondary' : 'outline'
            }>
              {transaction.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ParticipationCard = ({ participation }: { participation: any }) => (
    <Card className="bg-gradient-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-foreground mb-2">
              {participation.raffleTitle}
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-foreground-muted">Números:</span>
                <div className="flex space-x-1">
                  {participation.numbers.map((number: number) => (
                    <Badge 
                      key={number}
                      variant={
                        participation.result === 'ganhou' && participation.winnerNumber === number
                          ? 'default'
                          : 'outline'
                      }
                      className={
                        participation.result === 'ganhou' && participation.winnerNumber === number
                          ? 'bg-green-500 text-white'
                          : ''
                      }
                    >
                      {number.toString().padStart(2, '0')}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-foreground-muted">Participação:</span>
                  <p className="font-medium text-foreground">
                    {formatDate(participation.participationDate)}
                  </p>
                </div>
                <div>
                  <span className="text-foreground-muted">Sorteio:</span>
                  <p className="font-medium text-foreground">
                    {formatDate(participation.drawDate)}
                  </p>
                </div>
              </div>
              
              {participation.result && (
                <div className="text-sm">
                  <span className="text-foreground-muted">Número sorteado:</span>
                  <span className="font-medium text-foreground ml-1">
                    {participation.winnerNumber?.toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right ml-4">
            <p className="font-bold text-foreground">
              {formatCurrency(participation.amount)}
            </p>
            <Badge variant={
              participation.status === 'ativa' ? 'default' :
              participation.result === 'ganhou' ? 'secondary' : 'outline'
            }>
              {participation.status === 'ativa' ? 'Ativa' :
               participation.result === 'ganhou' ? 'Ganhou' : 'Perdeu'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Histórico</h1>
          <p className="text-foreground-muted">Acompanhe suas transações e participações</p>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Total Investido
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">R$ 240,00</div>
            <p className="text-xs text-foreground-muted">
              Em {participations.length} participações
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Prêmios Ganhos
            </CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">R$ 299,00</div>
            <p className="text-xs text-foreground-muted">
              1 prêmio conquistado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Saldo Líquido
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+R$ 59,00</div>
            <p className="text-xs text-foreground-muted">
              Lucro total até agora
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transacoes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transacoes">
            Transações ({filteredTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="participacoes">
            Participações ({filteredParticipations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transacoes" className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-gradient-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <Card className="bg-gradient-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma transação encontrada
                </h3>
                <p className="text-foreground-muted text-center">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca.'
                    : 'Suas transações aparecerão aqui conforme você participa de rifas.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="participacoes" className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-gradient-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                      <div className="flex space-x-2 mt-2">
                        <div className="h-6 w-8 bg-muted rounded animate-pulse" />
                        <div className="h-6 w-8 bg-muted rounded animate-pulse" />
                        <div className="h-6 w-8 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                      <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredParticipations.length > 0 ? (
            filteredParticipations.map((participation) => (
              <ParticipationCard key={participation.id} participation={participation} />
            ))
          ) : (
            <Card className="bg-gradient-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma participação encontrada
                </h3>
                <p className="text-foreground-muted text-center">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca.'
                    : 'Suas participações em rifas aparecerão aqui.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};