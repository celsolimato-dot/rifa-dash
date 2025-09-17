import { supabase } from '../lib/supabase';

export interface ClientStats {
  totalInvestido: number;
  rifasAtivas: number;
  premiosGanhos: number;
  economiaTotal: number;
}

export interface RecentActivity {
  id: string;
  type: 'participacao' | 'premio';
  title: string;
  date: string;
  value: number;
  status: string;
}

export interface ActiveRaffle {
  id: string;
  title: string;
  numbers: number[];
  drawDate: string;
  totalNumbers: number;
  soldNumbers: number;
}

export class ClientStatsService {
  async getClientStats(userId: string): Promise<ClientStats> {
    try {
      // Buscar participações do usuário
      const { data: participations, error: participationsError } = await supabase
        .from('participant_raffles')
        .select(`
          ticket_numbers,
          purchase_date,
          total_amount,
          status,
          raffles (
            id,
            title,
            status,
            prize_value
          )
        `)
        .eq('participant_id', userId);

      if (participationsError) throw participationsError;

      // Calcular estatísticas
      const totalInvestido = participations?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
      const rifasAtivas = participations?.filter(p => p.raffles?.status === 'active').length || 0;
      
      // Buscar prêmios ganhos (simulado - seria uma tabela de winners)
      const premiosGanhos = 0; // TODO: implementar quando houver tabela de ganhadores
      
      // Calcular economia total (valor dos prêmios que poderia ter comprado)
      const economiaTotal = participations?.reduce((sum, p) => {
        if (p.raffles?.prize_value) {
          return sum + (p.raffles.prize_value - (p.total_amount || 0));
        }
        return sum;
      }, 0) || 0;

      return {
        totalInvestido,
        rifasAtivas,
        premiosGanhos,
        economiaTotal: Math.max(0, economiaTotal)
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do cliente:', error);
      return {
        totalInvestido: 0,
        rifasAtivas: 0,
        premiosGanhos: 0,
        economiaTotal: 0
      };
    }
  }

  async getRecentActivity(userId: string, limit: number = 5): Promise<RecentActivity[]> {
    try {
      const { data: participations, error } = await supabase
        .from('participant_raffles')
        .select(`
          id,
          purchase_date,
          total_amount,
          status,
          raffles (
            title,
            status
          )
        `)
        .eq('participant_id', userId)
        .order('purchase_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return participations?.map(p => ({
        id: p.id,
        type: 'participacao' as const,
        title: `Participação em ${p.raffles?.title || 'Rifa'}`,
        date: p.purchase_date,
        value: p.total_amount || 0,
        status: p.raffles?.status || 'unknown'
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar atividade recente:', error);
      return [];
    }
  }

  async getActiveRaffles(userId: string): Promise<ActiveRaffle[]> {
    try {
      const { data: participations, error } = await supabase
        .from('participant_raffles')
        .select(`
          ticket_numbers,
          raffles (
            id,
            title,
            draw_date,
            total_tickets,
            sold_tickets,
            status
          )
        `)
        .eq('participant_id', userId)
        .eq('raffles.status', 'active');

      if (error) throw error;

      return participations?.map(p => ({
        id: p.raffles?.id || '',
        title: p.raffles?.title || '',
        numbers: p.ticket_numbers || [],
        drawDate: p.raffles?.draw_date || '',
        totalNumbers: p.raffles?.total_tickets || 0,
        soldNumbers: p.raffles?.sold_tickets || 0
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar rifas ativas:', error);
      return [];
    }
  }
}