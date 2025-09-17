import { mockSupabase } from './supabaseService';

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

export class ClientProfileService {
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Buscar participações do usuário
      const { data: participations, error: participationsError } = await mockSupabase
        .from('raffle_participants')
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
        .eq('user_id', userId);

      if (participationsError) throw participationsError;

      // Buscar dados do usuário
      const { data: userData, error: userError } = await mockSupabase
        .from('profiles')
        .select('created_at, last_login')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Calcular estatísticas
      const totalParticipacoes = participations?.length || 0;
      const totalInvestido = participations?.reduce((sum, p) => {
        return sum + (p.raffle?.ticket_price || 0);
      }, 0) || 0;

      // Para prêmios ganhos, vamos simular baseado em rifas finalizadas
      const finishedRaffles = participations?.filter(p => 
        p.raffle?.status === 'finished' && 
        new Date(p.raffle.draw_date) < new Date()
      ) || [];
      
      // Simular 15% de chance de ganho para rifas finalizadas
      const premiosGanhos = Math.floor(finishedRaffles.length * 0.15);
      
      // Economia simulada (diferença entre preço original e preço da rifa)
      const economiaTotal = totalInvestido * 0.3; // 30% de economia média

      return {
        totalParticipacoes,
        premiosGanhos,
        totalInvestido,
        economiaTotal,
        dataRegistro: userData?.created_at || new Date().toISOString(),
        ultimoLogin: userData?.last_login || new Date().toISOString()
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