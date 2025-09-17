import { supabase } from '@/integrations/supabase/client';

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
      // Buscar participações do usuário através dos tickets
      const { data: participations, error: participationsError } = await supabase
        .from('tickets')
        .select(`
          number,
          purchase_date,
          status,
          raffle_id,
          raffles (
            id,
            title,
            status,
            prize_value,
            ticket_price
          )
        `)
        .eq('buyer_email', (await supabase.auth.getUser()).data.user?.email);

      if (participationsError) throw participationsError;

      // Calcular estatísticas
      const totalInvestido = participations?.reduce((sum, p) => sum + (p.raffles?.ticket_price || 0), 0) || 0;
      const rifasAtivas = [...new Set(participations?.filter(p => p.raffles?.status === 'active').map(p => p.raffle_id))].length || 0;
      
      // Buscar prêmios ganhos (simulado - seria uma tabela de winners)
      const premiosGanhos = 0; // TODO: implementar quando houver tabela de ganhadores
      
      // Calcular economia total (valor dos prêmios que poderia ter comprado)
      const economiaTotal = participations?.reduce((sum, p) => {
        if (p.raffles?.prize_value && p.raffles?.ticket_price) {
          return sum + (p.raffles.prize_value - p.raffles.ticket_price);
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
        .from('tickets')
        .select(`
          id,
          purchase_date,
          status,
          raffles (
            title,
            status,
            ticket_price
          )
        `)
        .eq('buyer_email', (await supabase.auth.getUser()).data.user?.email)
        .order('purchase_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return participations?.map(p => ({
        id: p.id,
        type: 'participacao' as const,
        title: `Participação em ${p.raffles?.title || 'Rifa'}`,
        date: p.purchase_date || new Date().toISOString(),
        value: p.raffles?.ticket_price || 0,
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
        .from('tickets')
        .select(`
          number,
          raffles!inner (
            id,
            title,
            draw_date,
            total_tickets,
            sold_tickets,
            status
          )
        `)
        .eq('buyer_email', (await supabase.auth.getUser()).data.user?.email)
        .eq('raffles.status', 'active');

      if (error) throw error;

      // Group tickets by raffle
      const raffleMap = new Map();
      participations?.forEach(p => {
        if (p.raffles) {
          const raffleId = p.raffles.id;
          if (!raffleMap.has(raffleId)) {
            raffleMap.set(raffleId, {
              id: raffleId,
              title: p.raffles.title,
              numbers: [],
              drawDate: p.raffles.draw_date,
              totalNumbers: p.raffles.total_tickets,
              soldNumbers: p.raffles.sold_tickets
            });
          }
          raffleMap.get(raffleId).numbers.push(p.number);
        }
      });
      
      return Array.from(raffleMap.values());
    } catch (error) {
      console.error('Erro ao buscar rifas ativas:', error);
      return [];
    }
  }
}