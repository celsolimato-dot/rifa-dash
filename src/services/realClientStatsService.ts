import { supabase } from '@/integrations/supabase/client';

export interface RealClientStats {
  totalInvestido: number;
  rifasAtivas: number;
  premiosGanhos: number;
  economiaTotal: number;
}

export interface RealRecentActivity {
  id: string;
  type: 'participacao' | 'premio';
  title: string;
  date: string;
  value: number;
  status: string;
}

export interface RealActiveRaffle {
  id: string;
  title: string;
  numbers: number[];
  drawDate: string;
  totalNumbers: number;
  soldNumbers: number;
}

export class RealClientStatsService {
  static async getClientStats(userEmail: string): Promise<RealClientStats> {
    try {
      console.log('🔄 Buscando estatísticas do cliente para:', userEmail);
      
      // Buscar bilhetes vendidos do usuário
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id,
          number,
          purchase_date,
          status,
          payment_status,
          raffles!inner (
            id,
            title,
            status,
            prize_value,
            ticket_price,
            total_tickets,
            sold_tickets
          )
        `)
        .eq('buyer_email', userEmail)
        .eq('status', 'sold');

      if (ticketsError) {
        console.error('❌ Erro ao buscar bilhetes:', ticketsError);
        throw ticketsError;
      }

      console.log('✅ Bilhetes encontrados:', tickets?.length || 0);

      // Calcular estatísticas
      const totalInvestido = tickets?.reduce((sum, ticket) => sum + (ticket.raffles?.ticket_price || 0), 0) || 0;
      
      // Contar rifas ativas únicas
      const rifasAtivasIds = new Set(
        tickets?.filter(ticket => ticket.raffles?.status === 'active').map(ticket => ticket.raffles?.id)
      );
      const rifasAtivas = rifasAtivasIds.size;
      
      // Buscar rifas que o usuário ganhou
      const { data: wonRaffles, error: wonRafflesError } = await supabase
        .from('raffles')
        .select('id, title, prize_value, winner_email, winning_number, draw_completed_at')
        .eq('winner_email', userEmail)
        .eq('status', 'finished');

      if (wonRafflesError) {
        console.error('❌ Erro ao buscar rifas ganhas:', wonRafflesError);
      }

      console.log('🏆 Rifas ganhas encontradas:', wonRaffles?.length || 0);

      // Calcular prêmios ganhos baseado nas rifas vencidas
      const premiosGanhos = wonRaffles?.reduce((sum, raffle) => sum + (raffle.prize_value || 0), 0) || 0;
      
      // Economia total (diferença entre valor do prêmio e valor investido)
      const economiaTotal = Math.max(0, tickets?.reduce((sum, ticket) => {
        if (ticket.raffles?.prize_value && ticket.raffles?.ticket_price) {
          return sum + (ticket.raffles.prize_value - ticket.raffles.ticket_price);
        }
        return sum;
      }, 0) || 0);

      console.log('📊 Estatísticas calculadas:', { totalInvestido, rifasAtivas, premiosGanhos, economiaTotal });

      return {
        totalInvestido,
        rifasAtivas,
        premiosGanhos,
        economiaTotal
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas do cliente:', error);
      return {
        totalInvestido: 0,
        rifasAtivas: 0,
        premiosGanhos: 0,
        economiaTotal: 0
      };
    }
  }

  static async getRecentActivity(userEmail: string, limit: number = 5): Promise<RealRecentActivity[]> {
    try {
      console.log('🔄 Buscando atividade recente para:', userEmail);
      
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          purchase_date,
          status,
          payment_status,
          raffles!inner (
            title,
            status,
            ticket_price
          )
        `)
        .eq('buyer_email', userEmail)
        .eq('status', 'sold')
        .order('purchase_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Erro ao buscar atividade recente:', error);
        throw error;
      }

      // Buscar rifas ganhas pelo usuário
      const { data: wonRaffles, error: wonError } = await supabase
        .from('raffles')
        .select('id, title, prize_value, winner_email, winning_number, draw_completed_at')
        .eq('winner_email', userEmail)
        .eq('status', 'finished')
        .order('draw_completed_at', { ascending: false })
        .limit(3);

      if (wonError) {
        console.error('❌ Erro ao buscar rifas ganhas:', wonError);
      }

      console.log('✅ Atividades encontradas:', tickets?.length || 0);
      console.log('🏆 Vitórias encontradas:', wonRaffles?.length || 0);

      const activities: RealRecentActivity[] = [];

      // Adicionar participações
      tickets?.forEach(ticket => {
        activities.push({
          id: ticket.id,
          type: 'participacao' as const,
          title: `Participação em ${ticket.raffles?.title || 'Rifa'}`,
          date: ticket.purchase_date || new Date().toISOString(),
          value: ticket.raffles?.ticket_price || 0,
          status: ticket.raffles?.status || 'unknown'
        });
      });

      // Adicionar vitórias
      wonRaffles?.forEach(raffle => {
        activities.push({
          id: `win_${raffle.id}`,
          type: 'premio' as const,
          title: `🏆 Prêmio ganho em ${raffle.title}`,
          date: raffle.draw_completed_at || new Date().toISOString(),
          value: raffle.prize_value || 0,
          status: 'ganho'
        });
      });

      // Ordenar por data e limitar
      return activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Erro ao buscar atividade recente:', error);
      return [];
    }
  }

  static async getActiveRaffles(userEmail: string): Promise<RealActiveRaffle[]> {
    try {
      console.log('🔄 Buscando rifas ativas para:', userEmail);
      
      const { data: tickets, error } = await supabase
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
        .eq('buyer_email', userEmail)
        .eq('status', 'sold')
        .eq('raffles.status', 'active');

      if (error) {
        console.error('❌ Erro ao buscar rifas ativas:', error);
        throw error;
      }

      console.log('✅ Rifas ativas encontradas:', tickets?.length || 0);

      // Agrupar bilhetes por rifa
      const raffleMap = new Map();
      tickets?.forEach(ticket => {
        if (ticket.raffles) {
          const raffleId = ticket.raffles.id;
          if (!raffleMap.has(raffleId)) {
            raffleMap.set(raffleId, {
              id: raffleId,
              title: ticket.raffles.title,
              numbers: [],
              drawDate: ticket.raffles.draw_date,
              totalNumbers: ticket.raffles.total_tickets,
              soldNumbers: ticket.raffles.sold_tickets
            });
          }
          raffleMap.get(raffleId).numbers.push(ticket.number);
        }
      });
      
      return Array.from(raffleMap.values());
    } catch (error) {
      console.error('❌ Erro ao buscar rifas ativas:', error);
      return [];
    }
  }
}