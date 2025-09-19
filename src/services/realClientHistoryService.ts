import { supabase } from '@/integrations/supabase/client';

export interface RealClientTransaction {
  id: string;
  raffleTitle: string;
  ticketNumbers: string[];
  amount: number;
  date: string;
  status: string;
  type: string;
  raffleId: string;
}

export interface RealClientParticipation {
  id: string;
  raffleTitle: string;
  numbers: number[];
  amount: number;
  participationDate: string;
  drawDate: string;
  status: string;
  result?: string;
  winnerNumber?: number;
  raffleId: string;
}

export interface ClientStats {
  totalInvested: number;
  totalWon: number;
  netBalance: number;
  totalParticipations: number;
  totalWins: number;
}

export class RealClientHistoryService {
  
  static async getClientTransactions(userEmail: string): Promise<RealClientTransaction[]> {
    try {
      console.log('🔄 Buscando transações do cliente para:', userEmail);
      
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          number,
          purchase_date,
          status,
          payment_status,
          raffles!inner(
            id,
            title,
            ticket_price,
            status
          )
        `)
        .eq('buyer_email', userEmail)
        .eq('status', 'sold')
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar transações:', error);
        throw error;
      }

      console.log('✅ Transações encontradas:', tickets?.length || 0);

      // Group tickets by raffle to create transactions
      const transactionMap = new Map<string, RealClientTransaction>();

      tickets?.forEach(ticket => {
        const raffleId = ticket.raffles.id;
        
        if (!transactionMap.has(raffleId)) {
          transactionMap.set(raffleId, {
            id: `transaction_${raffleId}`,
            raffleTitle: ticket.raffles.title,
            ticketNumbers: [],
            amount: 0,
            date: ticket.purchase_date,
            status: ticket.payment_status === 'paid' ? 'approved' : 'pending',
            type: 'compra',
            raffleId: raffleId
          });
        }

        const transaction = transactionMap.get(raffleId)!;
        transaction.ticketNumbers.push(ticket.number.toString().padStart(2, '0'));
        transaction.amount += ticket.raffles.ticket_price;
      });

      return Array.from(transactionMap.values());
    } catch (error) {
      console.error('❌ Erro ao buscar transações do cliente:', error);
      return [];
    }
  }

  static async getClientParticipations(userEmail: string): Promise<RealClientParticipation[]> {
    try {
      console.log('🔄 Buscando participações do cliente para:', userEmail);
      
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          number,
          purchase_date,
          status,
          payment_status,
          raffles!inner(
            id,
            title,
            ticket_price,
            draw_date,
            status,
            winner_email,
            winning_number,
            draw_completed_at
          )
        `)
        .eq('buyer_email', userEmail)
        .eq('status', 'sold')
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar participações:', error);
        throw error;
      }

      console.log('✅ Participações encontradas:', tickets?.length || 0);

      // Group tickets by raffle to create participations
      const participationMap = new Map<string, RealClientParticipation>();

      tickets?.forEach(ticket => {
        const raffleId = ticket.raffles.id;
        
        if (!participationMap.has(raffleId)) {
          // Determinar resultado da participação
          let result = 'pendente';
          if (ticket.raffles.status === 'finished') {
            if (ticket.raffles.winner_email === userEmail) {
              result = 'ganhou';
            } else {
              result = 'perdeu';
            }
          } else if (ticket.raffles.status === 'active') {
            result = 'pendente';
          }

          participationMap.set(raffleId, {
            id: `participation_${raffleId}`,
            raffleTitle: ticket.raffles.title,
            numbers: [],
            amount: 0,
            participationDate: ticket.purchase_date,
            drawDate: ticket.raffles.draw_date,
            status: ticket.raffles.status,
            result: result,
            winnerNumber: ticket.raffles.winning_number ? parseInt(ticket.raffles.winning_number) : undefined,
            raffleId: raffleId
          });
        }

        const participation = participationMap.get(raffleId)!;
        participation.numbers.push(ticket.number);
        participation.amount += ticket.raffles.ticket_price;
      });

      return Array.from(participationMap.values());
    } catch (error) {
      console.error('❌ Erro ao buscar participações do cliente:', error);
      return [];
    }
  }

  static async getClientStats(userEmail: string): Promise<ClientStats> {
    try {
      console.log('🔄 Buscando estatísticas do cliente para:', userEmail);
      
      // Buscar bilhetes do usuário
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          raffles!inner(
            ticket_price,
            status
          )
        `)
        .eq('buyer_email', userEmail)
        .eq('status', 'sold');

      if (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        throw error;
      }

      // Buscar rifas que o usuário ganhou
      const { data: wonRaffles, error: wonRafflesError } = await supabase
        .from('raffles')
        .select('id, title, prize_value, winner_email, winning_number, draw_completed_at')
        .eq('winner_email', userEmail)
        .eq('status', 'finished');

      if (wonRafflesError) {
        console.error('❌ Erro ao buscar rifas ganhas:', wonRafflesError);
      }

      console.log('✅ Bilhetes para estatísticas encontrados:', tickets?.length || 0);
      console.log('🏆 Rifas ganhas encontradas:', wonRaffles?.length || 0);

      let totalInvested = 0;
      let totalParticipations = 0;

      tickets?.forEach(ticket => {
        totalInvested += ticket.raffles.ticket_price;
        totalParticipations++;
      });

      // Calcular total ganho e número de vitórias
      const totalWon = wonRaffles?.reduce((sum, raffle) => sum + (raffle.prize_value || 0), 0) || 0;
      const totalWins = wonRaffles?.length || 0;
      const netBalance = totalWon - totalInvested;

      console.log('📊 Estatísticas calculadas:', { totalInvested, totalWon, netBalance, totalParticipations, totalWins });

      return {
        totalInvested,
        totalWon,
        netBalance,
        totalParticipations,
        totalWins
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas do cliente:', error);
      return {
        totalInvested: 0,
        totalWon: 0,
        netBalance: 0,
        totalParticipations: 0,
        totalWins: 0
      };
    }
  }
}