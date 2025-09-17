import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RaffleService, Raffle } from '../services/raffleService';

export interface NextDraw {
  id: string;
  title: string;
  description: string;
  prize: string;
  prizeValue: string;
  drawDate: string;
  daysRemaining: number;
  totalTickets: number;
  soldTickets: number;
  ticketPrice: number;
  status: 'active' | 'paused' | 'completed';
  image: string;
  category: string;
}

interface NextDrawContextType {
  nextDraw: NextDraw | null;
  isLoading: boolean;
  updateNextDraw: (data: Partial<NextDraw>) => void;
  calculateDaysRemaining: () => number;
  loadNextDraw: () => Promise<void>;
}

const NextDrawContext = createContext<NextDrawContextType | undefined>(undefined);

export const NextDrawProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nextDraw, setNextDraw] = useState<NextDraw | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNextDraw();
  }, []);

  const loadNextDraw = async () => {
    try {
      setIsLoading(true);
      const raffles = await RaffleService.getRaffles({ status: 'active' });
      
      // Pegar a próxima rifa ativa (primeira da lista)
      if (raffles && raffles.length > 0) {
        const raffle = raffles[0];
        const nextDrawData: NextDraw = {
          id: raffle.id,
          title: raffle.title,
          description: raffle.description,
          prize: raffle.prize,
          prizeValue: `R$ ${raffle.prizeValue.toLocaleString('pt-BR')}`,
          drawDate: raffle.drawDate,
          daysRemaining: calculateDaysRemainingFromDate(raffle.drawDate),
          totalTickets: raffle.totalTickets,
          soldTickets: raffle.soldTickets,
          ticketPrice: raffle.ticketPrice,
          status: raffle.status,
          image: raffle.image,
          category: raffle.category
        };
        setNextDraw(nextDrawData);
      }
    } catch (error) {
      console.error('Erro ao carregar próximo sorteio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDaysRemainingFromDate = (drawDate: string): number => {
    const today = new Date();
    const draw = new Date(drawDate);
    const timeDiff = draw.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysDiff);
  };

  const calculateDaysRemaining = (): number => {
    if (!nextDraw) return 0;
    return calculateDaysRemainingFromDate(nextDraw.drawDate);
  };

  const updateNextDraw = (data: Partial<NextDraw>) => {
    setNextDraw(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      // Recalcular dias restantes se a data mudou
      if (data.drawDate) {
        updated.daysRemaining = calculateDaysRemainingFromDate(data.drawDate);
      }
      return updated;
    });
  };

  return (
    <NextDrawContext.Provider value={{
      nextDraw,
      isLoading,
      updateNextDraw,
      calculateDaysRemaining,
      loadNextDraw
    }}>
      {children}
    </NextDrawContext.Provider>
  );
};

export const useNextDraw = (): NextDrawContextType => {
  const context = useContext(NextDrawContext);
  if (!context) {
    throw new Error('useNextDraw must be used within a NextDrawProvider');
  }
  return context;
};