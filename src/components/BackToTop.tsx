import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTop = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      setScrollProgress(scrollPercent);
      setIsVisible(scrollTop > 300); // Mostra após 300px de scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const circumference = 2 * Math.PI * 20; // raio = 20
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 animate-in fade-in slide-in-from-bottom-4' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        className="relative w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-105 active:scale-95 backdrop-blur-sm"
        aria-label="Voltar ao topo"
      >
        {/* Círculo de progresso */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 44 44"
        >
          {/* Círculo de fundo */}
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
          />
          {/* Círculo de progresso */}
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-150 ease-out"
          />
        </svg>
        
        {/* Ícone */}
        <ChevronUp className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
};

export default BackToTop;