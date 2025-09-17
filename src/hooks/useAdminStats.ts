import { useState, useEffect } from 'react';
import { RealRaffleService } from '@/services/realRaffleService';
import { RealParticipantService } from '@/services/realParticipantService';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalRevenue: number;
  activeRaffles: number;
  totalParticipants: number;
  conversionRate: number;
  recentRaffles: any[];
  isLoading: boolean;
  error: string | null;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    activeRaffles: 0,
    totalParticipants: 0,
    conversionRate: 0,
    recentRaffles: [],
    isLoading: true,
    error: null
  });

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, isLoading: true, error: null }));

      // Buscar rifas ativas
      const activeRaffles = await RealRaffleService.getActiveRaffles();
      
      // Buscar todas as rifas para calcular receita total
      const allRaffles = await RealRaffleService.getAllRaffles();
      const totalRevenue = allRaffles.reduce((sum, raffle) => sum + (raffle.revenue || 0), 0);

      // Buscar participantes
      const participantService = new RealParticipantService();
      const participantStats = await participantService.getParticipantStats();

      // Buscar rifas recentes (últimas 5)
      const recentRaffles = allRaffles.slice(0, 5).map(raffle => ({
        id: raffle.id,
        title: raffle.title,
        soldTickets: raffle.sold_tickets,
        totalTickets: raffle.total_tickets,
        status: raffle.status,
        drawDate: raffle.draw_date,
        revenue: raffle.revenue
      }));

      // Calcular taxa de conversão (simplificada)
      const conversionRate = allRaffles.length > 0 
        ? (allRaffles.filter(r => r.status === 'completed').length / allRaffles.length) * 100 
        : 0;

      setStats({
        totalRevenue,
        activeRaffles: activeRaffles.length,
        totalParticipants: participantStats.total,
        conversionRate,
        recentRaffles,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas do admin:', error);
      setStats(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao carregar estatísticas'
      }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, refetch: fetchStats };
};