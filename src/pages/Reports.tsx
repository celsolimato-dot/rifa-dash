import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RaffleService } from "../services/raffleService";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Ticket,
  Trophy,
  Calendar,
  Download,
  Filter,
  Eye,
  Target,
  Percent,
  Clock
} from "lucide-react";

interface SalesData {
  month: string;
  revenue: number;
  tickets: number;
  raffles: number;
}

interface TopRaffle {
  id: string;
  title: string;
  revenue: number;
  ticketsSold: number;
  totalTickets: number;
  participants: number;
  status: string;
}

interface RevenueMetrics {
  total: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
}

export default function Reports() {
  // Estados para dados reais
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topRaffles, setTopRaffles] = useState<TopRaffle[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Função para carregar dados reais
  const loadReportsData = async () => {
    setIsLoading(true);
    try {
      // Carregar métricas de receita
      const revenueData = await RaffleService.getRevenueMetrics();
      if (!revenueData.error) {
        setRevenueMetrics({
          total: revenueData.total,
          thisMonth: revenueData.thisMonth,
          lastMonth: revenueData.lastMonth,
          growth: revenueData.growth
        });
      }

      // Carregar dados de vendas - convert format
      const salesResponse = await RaffleService.getSalesData();
      if (!salesResponse.error) {
        const formattedSales = salesResponse.data?.map((item: any) => ({
          month: item.date,
          revenue: 0,
          tickets: item.sales,
          raffles: 1
        })) || [];
        setSalesData(formattedSales);
      }

      // Carregar top rifas - convert format with all required properties
      const topRafflesResponse = await RaffleService.getRaffles();
      const formattedTopRaffles = topRafflesResponse.slice(0, 5).map((raffle: any) => ({
        id: raffle.id,
        title: raffle.title,
        ticketsSold: raffle.sold_tickets || 0,
        totalTickets: raffle.total_tickets || 0,
        revenue: raffle.revenue || 0,
        participants: raffle.sold_tickets || 0,
        status: raffle.status
      }));
      setTopRaffles(formattedTopRaffles);
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const SimpleBarChart = ({ data, metric }: { data: SalesData[], metric: string }) => {
    const maxValue = Math.max(...data.map(d => 
      metric === 'revenue' ? d.revenue : 
      metric === 'tickets' ? d.tickets : d.raffles
    ));

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">
            {metric === 'revenue' ? 'Receita Mensal' : 
             metric === 'tickets' ? 'Bilhetes Vendidos' : 'Rifas Criadas'}
          </h4>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Receita</SelectItem>
              <SelectItem value="tickets">Bilhetes</SelectItem>
              <SelectItem value="raffles">Rifas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end space-x-2 h-64">
          {data.map((item, index) => {
            const value = metric === 'revenue' ? item.revenue : 
                         metric === 'tickets' ? item.tickets : item.raffles;
            const height = (value / maxValue) * 200;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-md transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                  style={{ height: `${height}px` }}
                />
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium">{item.month}</p>
                  <p className="text-xs text-foreground-muted">
                    {metric === 'revenue' ? formatCurrency(value) : value.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-foreground-muted">Análise detalhada do desempenho das rifas</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Último mês</SelectItem>
              <SelectItem value="3months">3 meses</SelectItem>
              <SelectItem value="6months">6 meses</SelectItem>
              <SelectItem value="1year">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Receita Total</p>
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(revenueMetrics.total)}</p>
                    <div className="flex items-center mt-1">
                      {revenueMetrics.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${revenueMetrics.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {revenueMetrics.growth >= 0 ? '+' : ''}{revenueMetrics.growth.toFixed(1)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Bilhetes Vendidos</p>
                <p className="text-2xl font-bold text-foreground">12,400</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8%</span>
                </div>
              </div>
              <Ticket className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Participantes Únicos</p>
                <p className="text-2xl font-bold text-foreground">1,234</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-foreground">87%</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-2%</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="raffles">Rifas</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Desempenho de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <SimpleBarChart data={salesData} metric={selectedMetric} />
                )}
              </CardContent>
            </Card>

            {/* Top Raffles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Top Rifas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : topRaffles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-foreground-muted">Nenhuma rifa encontrada.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topRaffles.map((raffle, index) => (
                    <div key={raffle.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{raffle.title}</p>
                          <div className="flex items-center space-x-2 text-xs text-foreground-muted">
                            <span>{raffle.ticketsSold}/{raffle.totalTickets} bilhetes</span>
                            <span>•</span>
                            <span>{raffle.participants} participantes</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(raffle.revenue)}</p>
                        {getStatusBadge(raffle.status)}
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "Nova rifa criada", item: "PlayStation 5", time: "2 horas atrás", type: "create" },
                  { action: "Sorteio realizado", item: "iPhone 15 Pro Max", time: "4 horas atrás", type: "draw" },
                  { action: "Meta de vendas atingida", item: "Notebook Gamer", time: "6 horas atrás", type: "goal" },
                  { action: "Novo participante", item: "João Silva", time: "8 horas atrás", type: "user" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'create' ? 'bg-blue-500' :
                      activity.type === 'draw' ? 'bg-green-500' :
                      activity.type === 'goal' ? 'bg-yellow-500' : 'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-foreground-muted">{activity.item}</p>
                    </div>
                    <p className="text-xs text-foreground-muted">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raffles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-2xl font-bold">103</p>
                <p className="text-sm text-foreground-muted">Total de Rifas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-2xl font-bold">87%</p>
                <p className="text-sm text-foreground-muted">Taxa de Sucesso</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Percent className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-2xl font-bold">R$ 1,234</p>
                <p className="text-sm text-foreground-muted">Ticket Médio</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="participants" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-foreground-muted">Participantes Únicos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-2xl font-bold">+15%</p>
                <p className="text-sm text-foreground-muted">Crescimento Mensal</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <p className="text-2xl font-bold">3.2</p>
                <p className="text-sm text-foreground-muted">Rifas por Participante</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-muted">Este mês</span>
                    <span className="font-bold">{formatCurrency(revenueMetrics.thisMonth)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-muted">Mês anterior</span>
                    <span className="font-bold">{formatCurrency(revenueMetrics.lastMonth)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-muted">Crescimento</span>
                    <span className="font-bold text-green-600">+{revenueMetrics.growth}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Eletrônicos", percentage: 45, amount: 57150 },
                    { category: "Veículos", percentage: 30, amount: 38100 },
                    { category: "Casa & Decoração", percentage: 15, amount: 19050 },
                    { category: "Outros", percentage: 10, amount: 12700 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.category}</span>
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}