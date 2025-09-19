import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Shuffle,
  Plus,
  BarChart3
} from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { stats } = useAdminStats();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Ativa</Badge>;
      case 'finished':
        return <Badge variant="outline">Finalizada</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (stats.isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gradient-card border-border">
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
        <p className="text-foreground-muted">
          Gerencie rifas, participantes e monitore o desempenho da plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <Card className="bg-gradient-card border-border hover:border-border-hover transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-accent-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-accent-success">
              Total arrecadado
            </p>
          </CardContent>
        </Card>

        {/* Active Raffles */}
        <Card className="bg-gradient-card border-border hover:border-border-hover transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Rifas Ativas
            </CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.activeRaffles}</div>
            <p className="text-xs text-foreground-muted">
              rifas em andamento
            </p>
          </CardContent>
        </Card>

        {/* Total Participants */}
        <Card className="bg-gradient-card border-border hover:border-border-hover transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Participantes
            </CardTitle>
            <Users className="h-4 w-4 text-accent-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalParticipants}</div>
            <p className="text-xs text-accent-success">
              usuários cadastrados
            </p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-gradient-card border-border hover:border-border-hover transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-accent-success">
              rifas finalizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button 
          variant="hero" 
          size="lg" 
          className="h-auto p-4 justify-start"
          onClick={() => navigate('/admin/rifas/nova')}
        >
          <Plus className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-semibold">Nova Rifa</div>
            <div className="text-sm opacity-80">Criar uma nova rifa</div>
          </div>
        </Button>
        
        <Button 
          variant="gold" 
          size="lg" 
          className="h-auto p-4 justify-start"
          onClick={() => navigate('/admin/sorteador')}
        >
          <Shuffle className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-semibold">Realizar Sorteio</div>
            <div className="text-sm opacity-80">Sortear ganhador</div>
          </div>
        </Button>
        
        <Button 
          variant="premium" 
          size="lg" 
          className="h-auto p-4 justify-start"
          onClick={() => navigate('/admin/relatorios')}
        >
          <BarChart3 className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-semibold">Ver Relatórios</div>
            <div className="text-sm opacity-80">Análise detalhada</div>
          </div>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Raffles */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-accent-gold" />
              <span>Rifas Recentes</span>
            </CardTitle>
            <CardDescription>
              Status das rifas mais recentes criadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {stats.recentRaffles.length === 0 ? (
              <div className="text-center py-8 text-foreground-muted">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma rifa encontrada</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/admin/rifas/nova')}
                >
                  Criar primeira rifa
                </Button>
              </div>
            ) : (
              <>
                {stats.recentRaffles.map((raffle) => (
                  <div key={raffle.id} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg border border-border">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{raffle.title}</p>
                      <p className="text-sm text-foreground-muted">
                        {raffle.soldTickets} / {raffle.totalTickets} cotas vendidas • {formatCurrency(raffle.revenue)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(raffle.status)}
                      <p className="text-xs text-foreground-muted">
                        {raffle.drawDate ? `Sorteio: ${formatDate(raffle.drawDate)}` : 'Sem data definida'}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-4"
                  onClick={() => navigate('/admin/rifas')}
                >
                  Ver todas as rifas
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Atividades de Hoje</span>
            </CardTitle>
            <CardDescription>
              Resumo das atividades e tarefas do dia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Activity Items */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent-success rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {stats.totalRevenue > 0 
                      ? `Sistema arrecadou ${formatCurrency(stats.totalRevenue)} total`
                      : 'Sistema inicializado com sucesso'
                    }
                  </p>
                  <p className="text-xs text-foreground-muted">Dados atualizados agora</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {stats.totalParticipants} usuários cadastrados na plataforma
                  </p>
                  <p className="text-xs text-foreground-muted">Total de usuários</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent-gold rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {stats.activeRaffles} rifas ativas no sistema
                  </p>
                  <p className="text-xs text-foreground-muted">Rifas em andamento</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-border rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Sistema funcionando normalmente</p>
                  <p className="text-xs text-foreground-muted">Status do sistema</p>
                </div>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-accent-gold" />
                Tarefas Pendentes
              </h4>
              <div className="space-y-2">
                {stats.activeRaffles === 0 ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">Criar primeira rifa do sistema</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/admin/rifas/nova')}
                    >
                      Criar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">Gerenciar rifas ativas</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/admin/rifas')}
                    >
                      Ver rifas
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">Visualizar relatórios de desempenho</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/admin/relatorios')}
                  >
                    Relatórios
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-accent-gold" />
            <span>Alertas e Notificações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 bg-accent-success/10 border border-accent-success/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-accent-success" />
                <span className="text-sm font-medium text-accent-success">Sistema Funcionando</span>
              </div>
              <p className="text-xs text-foreground-muted">
                Todos os sistemas operacionais. Uptime: 99.9%
              </p>
            </div>
            
            <div className="p-4 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-accent-gold" />
                <span className="text-sm font-medium text-accent-gold">
                  {stats.activeRaffles} Rifas Ativas
                </span>
              </div>
              <p className="text-xs text-foreground-muted">
                {stats.activeRaffles > 0 ? 'Rifas em andamento no sistema' : 'Nenhuma rifa ativa no momento'}
              </p>
            </div>
            
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {stats.totalParticipants} Usuários
                </span>
              </div>
              <p className="text-xs text-foreground-muted">
                Total de usuários cadastrados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;