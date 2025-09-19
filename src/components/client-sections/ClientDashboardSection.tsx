import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Ticket, 
  Trophy, 
  TrendingUp,
  Calendar,
  Clock,
  Target
} from "lucide-react";
import { RealClientStatsService, RealClientStats, RealRecentActivity, RealActiveRaffle } from "@/services/realClientStatsService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';

interface ClientDashboardSectionProps {
  onSectionChange?: (section: string) => void;
}

export const ClientDashboardSection: React.FC<ClientDashboardSectionProps> = ({ onSectionChange }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RealClientStats>({
    totalInvestido: 0,
    rifasAtivas: 0,
    premiosGanhos: 0,
    economiaTotal: 0
  });
  const [recentActivity, setRecentActivity] = useState<RealRecentActivity[]>([]);
  const [activeRaffles, setActiveRaffles] = useState<RealActiveRaffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wonRaffles, setWonRaffles] = useState<any[]>([]);
  const [showWinnerAlert, setShowWinnerAlert] = useState(false);

  useEffect(() => {
    console.log('🔄 useEffect ClientDashboard executado, user:', user?.email);
    if (user?.email) {
      loadDashboardData();
    }
  }, [user?.email]);

  const loadDashboardData = async () => {
    if (!user?.email) {
      console.log('🚫 loadDashboardData: Sem email do usuário');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🔄 Carregando dados do dashboard do cliente para:', user.email);
      
      const [statsData, activityData, rafflesData] = await Promise.all([
        RealClientStatsService.getClientStats(user.email),
        RealClientStatsService.getRecentActivity(user.email, 3),
        RealClientStatsService.getActiveRaffles(user.email)
      ]);

      console.log('✅ Dados carregados:', { statsData, activityData, rafflesData });
      
      setStats(statsData);
      setRecentActivity(activityData);
      setActiveRaffles(rafflesData);

      // Check for won raffles - IMPORTANTE: executar após carregar dados
      console.log('🎯 Iniciando verificação de vitórias...');
      await checkWonRaffles();
    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWonRaffles = async () => {
    if (!user?.email) return;
    
    try {
      const { data: wonRaffles, error } = await supabase
        .from('raffles')
        .select('id, title, winner_name, winner_email, winning_number, draw_completed_at')
        .eq('winner_email', user.email)
        .eq('status', 'finished')
        .not('winner_name', 'is', null);

      if (error) {
        console.error('Erro ao verificar rifas ganhas:', error);
        return;
      }

      if (wonRaffles && wonRaffles.length > 0) {
        setWonRaffles(wonRaffles);
        setShowWinnerAlert(true);
      }
    } catch (error) {
      console.error('Erro ao verificar rifas ganhas:', error);
    }
  };



  return (
    <div className="space-y-6">
      {/* Winner Alert */}
      {showWinnerAlert && wonRaffles.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300 rounded-xl p-6 animate-fade-in shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-yellow-800 flex items-center">
                  🎉 PARABÉNS! VOCÊ GANHOU! 🎉
                </h3>
                <div className="space-y-1">
                  <p className="text-yellow-700 font-semibold text-lg">
                    Rifa: <span className="text-yellow-900">{wonRaffles[0].title}</span>
                  </p>
                  <div className="flex items-center space-x-3">
                    <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm">
                      Número Sorteado: {wonRaffles[0].winning_number}
                    </span>
                    <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full font-bold text-sm">
                      Data: {new Date(wonRaffles[0].draw_completed_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-yellow-600 text-sm mt-2">
                    Entre em contato conosco para retirar seu prêmio! 🏆
                  </p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowWinnerAlert(false)}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 shrink-0"
            >
              ✕ Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded flex items-center justify-between">
          <span>
            Debug: showWinnerAlert={showWinnerAlert.toString()}, 
            wonRaffles.length={wonRaffles.length}, 
            user.email={user?.email}
          </span>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              console.log('🔄 Verificação manual de vitórias iniciada...');
              checkWonRaffles();
            }}
          >
            🔄 Verificar Vitórias
          </Button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-foreground-muted">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Total Investido
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            ) : (
              <div className="text-2xl font-bold text-foreground">
                R$ {stats.totalInvestido.toFixed(2)}
              </div>
            )}
            <p className="text-xs text-foreground-muted">
              Total investido em rifas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Rifas Ativas
            </CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {stats.rifasAtivas}
              </div>
            )}
            <p className="text-xs text-foreground-muted">
              Participações em andamento
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
            {isLoading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            ) : (
              <div className="text-2xl font-bold text-foreground">
                R$ {stats.premiosGanhos.toFixed(2).replace('.', ',')}
              </div>
            )}
            <p className="text-xs text-foreground-muted">
              Parabéns pelos prêmios!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Economia Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            ) : (
              <div className="text-2xl font-bold text-foreground">
                R$ {stats.economiaTotal.toFixed(2)}
              </div>
            )}
            <p className="text-xs text-foreground-muted">
              Valor economizado vs. preço original
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rifas Ativas */}
      <Card className="bg-gradient-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">
              <span>Minhas Rifas Ativas</span>
            </CardTitle>
            <p className="text-sm text-foreground-muted">
              Suas participações em andamento
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionChange?.('rifas')}
          >
            Ver Todas
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-muted rounded-lg">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              ))}
            </div>
          ) : activeRaffles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-foreground-muted">Nenhuma rifa ativa encontrada</p>
            </div>
          ) : (
            activeRaffles.map((raffle) => (
              <div key={raffle.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{raffle.title}</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground-muted">
                        Números: {raffle.numbers.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground-muted">
                        Sorteio: {new Date(raffle.drawDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">
                    {raffle.soldNumbers}/{raffle.totalNumbers}
                  </Badge>
                  <p className="text-xs text-foreground-muted mt-1">
                    {Math.round((raffle.soldNumbers / raffle.totalNumbers) * 100)}% vendido
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Atividade Recente */}
      <Card className="bg-gradient-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">
              <span>Atividade Recente</span>
            </CardTitle>
            <p className="text-sm text-foreground-muted">
              Suas últimas transações e atividades
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionChange?.('historico')}
          >
            Ver Histórico
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 bg-muted rounded-lg">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-foreground-muted">Nenhuma atividade recente</p>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'ativa' ? 'bg-blue-500' :
                    activity.status === 'ganho' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-foreground-muted">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(activity.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <p className={`font-medium ${
                     activity.type === 'premio' ? 'text-green-600' : 'text-foreground'
                   }`}>
                     {activity.type === 'premio' ? '+' : '-'}R$ {activity.value.toFixed(2)}
                   </p>
                   <Badge variant={
                     activity.status === 'ativa' ? 'default' :
                     activity.status === 'ganho' ? 'secondary' : 'outline'
                   }>
                     {activity.status}
                   </Badge>
                 </div>
               </div>
             ))
           )}
        </CardContent>
      </Card>
    </div>
  );
};