import { supabase } from '@/integrations/supabase/client';

export interface UserStats {
  totalParticipacoes: number;
  premiosGanhos: number;
  totalInvestido: number;
  economiaTotal: number;
  dataRegistro: string;
  ultimoLogin: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  earned: boolean;
  date: string | null;
  icon: string;
}

export class RealClientProfileService {
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Buscar tickets do usuário para calcular participações
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id,
          created_at,
          raffle:raffles(
            id,
            ticket_price,
            status,
            draw_date
          )
        `)
        .eq('buyer_email', (await supabase.auth.getUser()).data.user?.email);

      if (ticketsError) throw ticketsError;

      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', userId)
        .single();

      if (userError) console.warn('Usuário não encontrado na tabela users');

      // Calcular estatísticas
      const totalParticipacoes = tickets?.length || 0;
      const totalInvestido = tickets?.reduce((sum, ticket) => {
        return sum + (ticket.raffle?.ticket_price || 0);
      }, 0) || 0;

      // Simular prêmios ganhos (15% dos tickets)
      const premiosGanhos = Math.floor(totalParticipacoes * 0.15);
      
      // Economia simulada (30% de economia média)
      const economiaTotal = totalInvestido * 0.3;

      return {
        totalParticipacoes,
        premiosGanhos,
        totalInvestido,
        economiaTotal,
        dataRegistro: userData?.created_at || new Date().toISOString(),
        ultimoLogin: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      return {
        totalParticipacoes: 0,
        premiosGanhos: 0,
        totalInvestido: 0,
        economiaTotal: 0,
        dataRegistro: new Date().toISOString(),
        ultimoLogin: new Date().toISOString()
      };
    }
  }

  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const stats = await this.getUserStats(userId);
      
      const achievements: Achievement[] = [
        {
          id: 1,
          title: 'Primeiro Prêmio',
          description: 'Ganhou seu primeiro prêmio',
          earned: stats.premiosGanhos > 0,
          date: stats.premiosGanhos > 0 ? new Date().toISOString() : null,
          icon: '🏆'
        },
        {
          id: 2,
          title: 'Participante Ativo',
          description: 'Participou de 10+ rifas',
          earned: stats.totalParticipacoes >= 10,
          date: stats.totalParticipacoes >= 10 ? new Date().toISOString() : null,
          icon: '🎯'
        },
        {
          id: 3,
          title: 'Investidor',
          description: 'Investiu mais de R$ 500',
          earned: stats.totalInvestido >= 500,
          date: stats.totalInvestido >= 500 ? new Date().toISOString() : null,
          icon: '💰'
        },
        {
          id: 4,
          title: 'Sortudo',
          description: 'Ganhe 5 prêmios',
          earned: stats.premiosGanhos >= 5,
          date: stats.premiosGanhos >= 5 ? new Date().toISOString() : null,
          icon: '🍀'
        }
      ];

      return achievements;
    } catch (error) {
      console.error('Erro ao buscar conquistas do usuário:', error);
      return [];
    }
  }
}