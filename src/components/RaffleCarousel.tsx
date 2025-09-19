import { RaffleCard } from "./RaffleCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RaffleService, Raffle } from "../services/raffleService";
import prizeCarImage from "@/assets/prize-car.jpg";
import prizeMoneyImage from "@/assets/prize-money.jpg";
import prizeTechImage from "@/assets/prize-tech.jpg";

const RaffleCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
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
  
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === raffles.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? raffles.length - 1 : prevIndex - 1
    );
  };

  return (
    <section id="rifas" className="py-16 bg-background-secondary">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-accent-gold" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Rifas <span className="bg-gradient-primary bg-clip-text text-transparent">Disponíveis</span>
            </h2>
            <Sparkles className="w-6 h-6 text-accent-gold" />
          </div>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Explore rifas ativas e veja os resultados dos sorteios realizados. 
            Sorteios transparentes e prêmios incríveis te aguardam!
          </p>
        </div>
        
        {/* Carousel Controls - Desktop */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <Button 
            variant="premium" 
            size="icon" 
            onClick={prevSlide}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex space-x-2">
            {raffles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary shadow-glow' 
                    : 'bg-border hover:bg-border-hover'
                }`}
              />
            ))}
          </div>
          
          <Button 
            variant="premium" 
            size="icon" 
            onClick={nextSlide}
            className="rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Carousel Grid */}
        <div className="relative">
          {/* Desktop Grid - Show all cards */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {raffles.map((raffle, index) => (
              <div 
                key={raffle.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <RaffleCard 
                  id={raffle.id}
                  title={raffle.title}
                  prize={raffle.prize}
                  prizeValue={raffle.prize_value}
                  ticketPrice={raffle.ticket_price}
                  totalTickets={raffle.total_tickets}
                  soldTickets={raffle.sold_tickets}
                  drawDate={raffle.draw_date}
                  status={raffle.status}
                  description={raffle.description}
                  images={[
                    (raffle as any).image_url,
                    (raffle as any).image_url_2,
                    (raffle as any).image_url_3
                  ].filter(Boolean)}
                  image={raffle.image_url || prizeCarImage}
                  winner_name={raffle.winner_name}
                  winner_email={raffle.winner_email}
                  winning_number={raffle.winning_number}
                  draw_completed_at={raffle.draw_completed_at}
                />
              </div>
            ))}
          </div>
          
          {/* Mobile Carousel - Show one card at a time */}
          <div className="md:hidden">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {raffles.map((raffle) => (
                  <div key={raffle.id} className="w-full flex-shrink-0 px-2">
                    <RaffleCard 
                      id={raffle.id}
                      title={raffle.title}
                      prize={raffle.prize}
                      prizeValue={raffle.prize_value}
                      ticketPrice={raffle.ticket_price}
                      totalTickets={raffle.total_tickets}
                      soldTickets={raffle.sold_tickets}
                      drawDate={raffle.draw_date}
                      status={raffle.status}
                      description={raffle.description}
                      images={[
                        (raffle as any).image_url,
                        (raffle as any).image_url_2,
                        (raffle as any).image_url_3
                      ].filter(Boolean)}
                      image={raffle.image_url || prizeCarImage}
                      winner_name={raffle.winner_name}
                      winner_email={raffle.winner_email}
                      winning_number={raffle.winning_number}
                      draw_completed_at={raffle.draw_completed_at}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-center items-center space-x-4 mt-8">
          <Button 
            variant="premium" 
            size="sm" 
            onClick={prevSlide}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          <div className="flex space-x-2">
            {raffles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary' 
                    : 'bg-border'
                }`}
              />
            ))}
          </div>
          
          <Button 
            variant="premium" 
            size="sm" 
            onClick={nextSlide}
          >
            Próxima
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        {/* View All CTA */}
        <div className="text-center mt-12">
          <Button 
            variant="hero" 
            size="lg" 
            className="px-8"
            onClick={() => navigate('/rifas')}
          >
            Ver Todas as Rifas
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RaffleCarousel;