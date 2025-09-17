import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Gift, Star, Crown, Medal, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTestimonials } from "@/contexts/TestimonialsContext";

const getTypeIcon = (type: string) => {
  switch (type) {
    case "car":
    case "motorcycle":
      return <Crown className="w-5 h-5 text-accent-gold" />;
    case "money":
    case "combo":
      return <Trophy className="w-5 h-5 text-accent-success" />;
    default:
      return <Medal className="w-5 h-5 text-primary" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "car":
    case "motorcycle":
      return "gold";
    case "money":
    case "combo":
      return "success";
    default:
      return "default";
  }
};

const Winners = () => {
  const { testimonials } = useTestimonials();
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 3; // Número de cards por slide
  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

  const handleSmoothScroll = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getVisibleWinners = () => {
    const start = currentSlide * itemsPerSlide;
    const end = start + itemsPerSlide;
    return testimonials.slice(start, end);
  };

  return (
    <section id="ganhadores" className="py-20 bg-background-secondary">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="w-8 h-8 text-accent-gold" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Nossos <span className="bg-gradient-gold bg-clip-text text-transparent">Ganhadores</span>
            </h2>
            <Star className="w-8 h-8 text-accent-gold" />
          </div>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Conheça as pessoas que realizaram seus sonhos conosco. Todos os sorteios são 100% transparentes e verificáveis!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-gradient-card border-border text-center">
            <CardContent className="p-6">
              <Trophy className="w-12 h-12 text-accent-gold mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground mb-2">50.000+</div>
              <div className="text-foreground-muted">Ganhadores Felizes</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border text-center">
            <CardContent className="p-6">
              <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground mb-2">R$ 2M+</div>
              <div className="text-foreground-muted">Em Prêmios Pagos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border text-center">
            <CardContent className="p-6">
              <Calendar className="w-12 h-12 text-accent-success mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground mb-2">365</div>
              <div className="text-foreground-muted">Dias por Ano</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Winners Slider */}
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground">
              Ganhadores Recentes
            </h3>
            
            {/* Navigation Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                className="p-2 h-10 w-10"
                disabled={totalSlides <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                className="p-2 h-10 w-10"
                disabled={totalSlides <= 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Slider Container */}
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials
                      .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                      .map((testimonial) => (
                        <Card key={testimonial.id} className="bg-gradient-card border-border hover:border-border-hover transition-all duration-300 hover:shadow-card-hover">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(testimonial.type)}
                                <Badge variant={getTypeColor(testimonial.type) as any} className="text-xs">
                                  {testimonial.raffleTitle}
                                </Badge>
                              </div>
                              <div className="text-xs text-foreground-muted flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {testimonial.date}
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {/* Winner Info */}
                            <div className="text-center space-y-2">
                              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                                <span className="text-white font-bold text-xl">
                                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                              <p className="text-sm text-foreground-muted">Número sorteado: {testimonial.winningNumber}</p>
                            </div>
                            
                            {/* Prize Info */}
                            <div className="bg-background-secondary rounded-lg p-4 text-center space-y-2">
                              <p className="font-medium text-foreground">{testimonial.prize}</p>
                              <p className="text-lg font-bold text-accent-gold">{testimonial.prizeValue}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Slide Indicators */}
          {totalSlides > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-primary scale-110' 
                      : 'bg-border hover:bg-border-hover'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-card border-border max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Trophy className="w-16 h-16 text-accent-gold mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Você pode ser o próximo!
              </h3>
              <p className="text-foreground-muted mb-6">
                Participe das nossas rifas e tenha a chance de ganhar prêmios incríveis. 
                Todos os sorteios são transparentes e verificáveis.
              </p>
              <Button 
                variant="gold" 
                size="lg" 
                className="w-full sm:w-auto cursor-pointer"
                onClick={() => handleSmoothScroll('rifas')}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Ver Rifas Ativas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Winners;