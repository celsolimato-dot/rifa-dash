import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RaffleService, Raffle } from "../services/raffleService";
import { 
  Trophy, 
  Users, 
  Calendar,
  Search,
  Eye,
  DollarSign,
  Clock,
  ArrowLeft
} from "lucide-react";
import { NumberSelectionModal } from "@/components/NumberSelectionModal";

const PublicRaffles = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    try {
      setIsLoading(true);
      // Buscar rifas ativas e completadas
      const [activeRaffles, completedRaffles] = await Promise.all([
        RaffleService.getRaffles({ status: 'active' }),
        RaffleService.getRaffles({ status: 'completed' })
      ]);
      
      // Combinar e ordenar: rifas ativas primeiro, depois completadas
      const allRaffles = [
        ...(activeRaffles || []),
        ...(completedRaffles || [])
      ].sort((a, b) => {
        // Rifas ativas primeiro
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (b.status === 'active' && a.status !== 'active') return 1;
        
        // Dentro do mesmo status, ordenar por data
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setRaffles(allRaffles);
    } catch (error) {
      console.error('Erro ao carregar rifas:', error);
      setRaffles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRaffles = raffles.filter(raffle =>
    raffle.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (raffle: Raffle) => {
    if (raffle.status === "completed" && raffle.winner_name) {
      return <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Sorteada</Badge>;
    }
    
    switch (raffle.status) {
      case "active":
        return <Badge variant="default" className="bg-accent-success text-white">Ativa</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-accent-gold text-white">Finalizada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const handleParticipate = (raffle: any) => {
    setSelectedRaffle(raffle);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Todas as Rifas</h1>
            <p className="text-foreground-muted text-lg">
              Explore todas as rifas disponíveis e participe das suas favoritas
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
            <Input
              placeholder="Buscar rifas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Rifas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaffles.map((raffle) => (
            <Card key={raffle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={raffle.image_url}
                  alt={raffle.title}
                  className="w-full h-48 object-contain bg-background-secondary"
                />
                <div className="absolute top-4 right-4">
                  {getStatusBadge(raffle)}
                </div>
              </div>
              
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl">{raffle.title}</CardTitle>
                <CardDescription>{raffle.description}</CardDescription>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-accent-success" />
                    <span className="text-2xl font-bold text-accent-success">
                      R$ {raffle.ticket_price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-foreground-muted">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Disponível</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Progresso</span>
                    <span className="font-medium">
                      {raffle.sold_tickets}/{raffle.total_tickets}
                    </span>
                  </div>
                  <Progress 
                    value={(raffle.sold_tickets / raffle.total_tickets) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{raffle.sold_tickets} participantes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(raffle.draw_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Action Button or Winner Info */}
                {raffle.status === "completed" && raffle.winner_name ? (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-lg font-bold text-yellow-800">Rifa Sorteada!</span>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Vencedor:</span> {raffle.winner_name}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Número:</span> {raffle.winning_number}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => handleParticipate(raffle)}
                    disabled={raffle.status !== "active"}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    {raffle.status === "active" ? "Participar Agora" : "Finalizada"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRaffles.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma rifa encontrada
            </h3>
            <p className="text-foreground-muted">
              {searchTerm ? "Tente buscar por outro termo" : "Não há rifas ativas no momento"}
            </p>
          </div>
        )}
      </main>

      <Footer />

      {/* Number Selection Modal */}
      {selectedRaffle && (
        <NumberSelectionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRaffle(null);
          }}
          raffle={selectedRaffle as any}
        />
      )}
    </div>
  );
};

export default PublicRaffles;