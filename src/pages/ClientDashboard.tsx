import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Trophy, 
  Ticket, 
  History, 
  MessageCircle, 
  Star,
  Calendar,
  DollarSign,
  Clock,
  Gift,
  LogOut,
  User,
  Phone,
  Mail
} from "lucide-react";
import prizeCarImage from "@/assets/prize-car.jpg";
import prizeMoneyImage from "@/assets/prize-money.jpg";

const ClientDashboard = () => {
  const { user, logout } = useAuth();

  // Mock data - em uma aplicação real viria da API
  const userRaffles = [
    {
      id: 1,
      title: "Carro dos Sonhos - Civic Sport 2024",
      image: prizeCarImage,
      numbers: [1234, 5678, 9012],
      drawDate: "25/12/2024",
      status: "active",
      totalInvested: 47.97
    },
    {
      id: 2,
      title: "R$ 50.000 em Dinheiro + Moto",
      image: prizeMoneyImage,
      numbers: [3456, 7890],
      drawDate: "30/12/2024", 
      status: "active",
      totalInvested: 19.98
    }
  ];

  const recentWinners = [
    { name: "Maria Silva", prize: "iPhone 15 Pro", date: "15/12/2024" },
    { name: "João Santos", prize: "R$ 10.000", date: "12/12/2024" },
    { name: "Ana Costa", prize: "Notebook Dell", date: "10/12/2024" }
  ];

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <header className="bg-background-secondary border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Minha Conta</h1>
              <p className="text-foreground-muted">Bem-vindo, {user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild>
              <a href="/">Voltar ao Site</a>
            </Button>
            <Button variant="ghost" onClick={logout} className="text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">
                Rifas Ativas
              </CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">2</div>
              <p className="text-xs text-foreground-muted">
                5 números da sorte
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">
                Total Investido
              </CardTitle>
              <DollarSign className="h-4 w-4 text-accent-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ 67,95</div>
              <p className="text-xs text-accent-success">
                Em rifas ativas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">
                Próximo Sorteio
              </CardTitle>
              <Clock className="h-4 w-4 text-accent-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">15</div>
              <p className="text-xs text-foreground-muted">
                dias restantes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* My Raffles */}
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  <span>Minhas Rifas</span>
                </CardTitle>
                <CardDescription>
                  Acompanhe suas participações e números da sorte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userRaffles.map((raffle) => (
                  <div key={raffle.id} className="p-4 bg-background-secondary rounded-lg border border-border">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={raffle.image} 
                        alt={raffle.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-foreground line-clamp-2">{raffle.title}</h3>
                          <Badge variant="success">Ativa</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-foreground-muted">Seus números:</span>
                          {raffle.numbers.map((number) => (
                            <Badge key={number} variant="outline" className="font-mono">
                              {number.toString().padStart(4, '0')}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-foreground-muted">
                            <Calendar className="w-4 h-4 mr-1" />
                            Sorteio: {raffle.drawDate}
                          </span>
                          <span className="font-medium text-accent-gold">
                            Investido: R$ {raffle.totalInvested.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  Ver Histórico Completo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Profile Card */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <User className="w-5 h-5 text-primary" />
                  <span>Meu Perfil</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user?.name}</p>
                    <p className="text-sm text-foreground-muted">Cliente Premium</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2 text-sm">
                  <div className="flex items-center space-x-2 text-foreground-muted">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-foreground-muted">
                    <Phone className="w-4 h-4" />
                    <span>{user?.phone}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Recent Winners */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Star className="w-5 h-5 text-accent-gold" />
                  <span>Ganhadores Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentWinners.map((winner, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{winner.name}</p>
                      <p className="text-xs text-foreground-muted">{winner.date}</p>
                    </div>
                    <Badge variant="gold" className="text-xs">
                      {winner.prize}
                    </Badge>
                  </div>
                ))}
                
                <Button variant="ghost" className="w-full text-primary">
                  Ver Todos os Ganhadores
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <MessageCircle className="w-5 h-5 text-accent-success" />
                  <span>Suporte</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground-muted">
                  Precisa de ajuda? Entre em contato conosco!
                </p>
                
                <div className="space-y-2">
                  <Button variant="success" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Abrir Chat
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    Central de Ajuda
                  </Button>
                </div>
                
                <div className="text-xs text-foreground-muted text-center pt-2">
                  Atendimento 24/7<br />
                  Resposta em até 2 horas
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;