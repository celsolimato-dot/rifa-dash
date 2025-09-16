import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const AdminDashboard = () => {
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
            <div className="text-2xl font-bold text-foreground">R$ 125.430</div>
            <p className="text-xs text-accent-success">
              +12.5% em relação ao mês passado
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
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-xs text-foreground-muted">
              3 sorteios hoje
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
            <div className="text-2xl font-bold text-foreground">8.542</div>
            <p className="text-xs text-accent-success">
              +234 novos esta semana
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
            <div className="text-2xl font-bold text-foreground">68.4%</div>
            <p className="text-xs text-accent-success">
              +2.1% esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button variant="hero" size="lg" className="h-auto p-4 justify-start">
          <Plus className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-semibold">Nova Rifa</div>
            <div className="text-sm opacity-80">Criar uma nova rifa</div>
          </div>
        </Button>
        
        <Button variant="gold" size="lg" className="h-auto p-4 justify-start">
          <Shuffle className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-semibold">Realizar Sorteio</div>
            <div className="text-sm opacity-80">Sortear ganhador</div>
          </div>
        </Button>
        
        <Button variant="premium" size="lg" className="h-auto p-4 justify-start">
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
            
            {/* Raffle Item */}
            <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg border border-border">
              <div className="flex-1">
                <p className="font-medium text-foreground">Carro dos Sonhos - Civic Sport</p>
                <p className="text-sm text-foreground-muted">3.250 / 5.000 cotas vendidas</p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="success">Ativa</Badge>
                <p className="text-xs text-foreground-muted">Sorteio: 25/12</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg border border-border">
              <div className="flex-1">
                <p className="font-medium text-foreground">R$ 50K + Moto Honda</p>
                <p className="text-sm text-foreground-muted">6.800 / 8.000 cotas vendidas</p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="gold">Quase Esgotada</Badge>
                <p className="text-xs text-foreground-muted">Sorteio: 30/12</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg border border-border">
              <div className="flex-1">
                <p className="font-medium text-foreground">Kit Tech: iPhone + MacBook</p>
                <p className="text-sm text-foreground-muted">1.200 / 3.000 cotas vendidas</p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="outline">Ativa</Badge>
                <p className="text-xs text-foreground-muted">Sorteio: 28/12</p>
              </div>
            </div>
            
            <Button variant="ghost" className="w-full mt-4">
              Ver todas as rifas
            </Button>
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
                  <p className="text-sm font-medium text-foreground">Rifa "Civic Sport" atingiu 65% das vendas</p>
                  <p className="text-xs text-foreground-muted">Há 2 horas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">234 novos participantes se cadastraram</p>
                  <p className="text-xs text-foreground-muted">Há 4 horas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent-gold rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Sorteio "R$ 50K + Moto" às 20h</p>
                  <p className="text-xs text-foreground-muted">Hoje às 20:00</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-border rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Backup automático realizado</p>
                  <p className="text-xs text-foreground-muted">Há 6 horas</p>
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">Aprovar 5 novos participantes</span>
                  <Button variant="ghost" size="sm">Revisar</Button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">Configurar nova rifa "Casa dos Sonhos"</span>
                  <Button variant="ghost" size="sm">Configurar</Button>
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
                <span className="text-sm font-medium text-accent-gold">3 Sorteios Hoje</span>
              </div>
              <p className="text-xs text-foreground-muted">
                Verificar configurações antes dos sorteios
              </p>
            </div>
            
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Alto Engajamento</span>
              </div>
              <p className="text-xs text-foreground-muted">
                +40% de participações esta semana
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;