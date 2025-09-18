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

      if (error) throw error;

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
            status: ticket.payment_status === 'approved' ? 'approved' : 'pending',
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
      console.error('Error getting client transactions:', error);
      return [];
    }
  }

  static async getClientParticipations(userEmail: string): Promise<RealClientParticipation[]> {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          number,
          purchase_date,
          status,
          raffles!inner(
            id,
            title,
            ticket_price,
            draw_date,
            status
          )
        `)
        .eq('buyer_email', userEmail)
        .eq('status', 'sold')
        .order('purchase_date', { ascending: false });

      if (error) throw error;

      // Group tickets by raffle to create participations
      const participationMap = new Map<string, RealClientParticipation>();

      tickets?.forEach(ticket => {
        const raffleId = ticket.raffles.id;
        
        if (!participationMap.has(raffleId)) {
          participationMap.set(raffleId, {
            id: `participation_${raffleId}`,
            raffleTitle: ticket.raffles.title,
            numbers: [],
            amount: 0,
            participationDate: ticket.purchase_date,
            drawDate: ticket.raffles.draw_date,
            status: ticket.raffles.status,
            raffleId: raffleId
          });
        }

        const participation = participationMap.get(raffleId)!;
        participation.numbers.push(ticket.number);
        participation.amount += ticket.raffles.ticket_price;
      });

      return Array.from(participationMap.values());
    } catch (error) {
      console.error('Error getting client participations:', error);
      return [];
    }
  }

  static async getClientStats(userEmail: string): Promise<ClientStats> {
    try {
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

      if (error) throw error;

      let totalInvested = 0;
      let totalParticipations = 0;

      tickets?.forEach(ticket => {
        totalInvested += ticket.raffles.ticket_price;
        totalParticipations++;
      });

      // For now, set wins to 0 since we don't have winner tracking implemented
      const totalWon = 0;
      const totalWins = 0;
      const netBalance = totalWon - totalInvested;

      return {
        totalInvested,
        totalWon,
        netBalance,
        totalParticipations,
        totalWins
      };
    } catch (error) {
      console.error('Error getting client stats:', error);
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