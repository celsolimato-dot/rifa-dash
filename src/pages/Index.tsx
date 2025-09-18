import Header from "@/components/Header";
import Hero from "@/components/Hero";
import RaffleCarousel from "@/components/RaffleCarousel";
import Winners from "@/components/Winners";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { TestWebhookButton } from "@/components/TestWebhookButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <RaffleCarousel />
      <Winners />
      <HowItWorks />
      
      {/* Componente temporário para teste */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4 text-center">🧪 Área de Testes (Temporária)</h2>
        <div className="max-w-md mx-auto">
          <TestWebhookButton />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
