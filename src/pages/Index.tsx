import Header from "@/components/Header";
import Hero from "@/components/Hero";
import RaffleCarousel from "@/components/RaffleCarousel";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <RaffleCarousel />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
