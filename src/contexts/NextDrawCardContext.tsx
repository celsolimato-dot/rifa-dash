import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RaffleService } from '../services/raffleService';

interface NextDrawCardData {
  time: string;
  prize: string;
  isActive: boolean;
}

interface NextDrawCardContextType {
  cardData: NextDrawCardData | null;
  isLoading: boolean;
  updateCardData: (data: Partial<NextDrawCardData>) => void;
  loadCardData: () => Promise<void>;
}

const NextDrawCardContext = createContext<NextDrawCardContextType | undefined>(undefined);

export const useNextDrawCard = () => {
  const context = useContext(NextDrawCardContext);
  if (context === undefined) {
    throw new Error('useNextDrawCard must be used within a NextDrawCardProvider');
  }
  return context;
};

interface NextDrawCardProviderProps {
  children: ReactNode;
}

export const NextDrawCardProvider: React.FC<NextDrawCardProviderProps> = ({ children }) => {
  const [cardData, setCardData] = useState<NextDrawCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCardData = async () => {
    try {
      setIsLoading(true);
      const activeRaffles = await RaffleService.getRaffles({ status: 'active' });
      
      if (activeRaffles && activeRaffles.length > 0) {
        const nextRaffle = activeRaffles[0]; // Pega a primeira rifa ativa
        const drawDate = new Date(nextRaffle.draw_date);
        const now = new Date();
        
        // Formatar data do sorteio
        const timeString = drawDate.toLocaleDateString('pt-BR') + ' às ' + 
                          drawDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        setCardData({
          time: timeString,
          prize: nextRaffle.title,
          isActive: drawDate > now
        });
      } else {
        setCardData({
          time: "Nenhum sorteio agendado",
          prize: "Aguarde novos sorteios",
          isActive: false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do card:', error);
      setCardData({
        time: "Erro ao carregar",
        prize: "Tente novamente",
        isActive: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCardData();
  }, []);

  const updateCardData = (data: Partial<NextDrawCardData>) => {
    if (cardData) {
      setCardData(prev => prev ? { ...prev, ...data } : null);
    }
  };

  return (
    <NextDrawCardContext.Provider value={{ 
      cardData, 
      isLoading, 
      updateCardData, 
      loadCardData 
    }}>
      {children}
    </NextDrawCardContext.Provider>
  );
};