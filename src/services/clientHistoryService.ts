import { supabase } from '@/integrations/supabase/client';

export interface ClientHistoryStats {
  totalTickets: number;
  totalSpent: number;
  totalRaffles: number;
  totalWins: number;
}

export interface ClientTransaction {
  id: string;
  raffleTitle: string;
  ticketNumbers: string[];
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'cancelled';
}

export interface ClientPrize {
  id: string;
  raffleTitle: string;
  prizeDescription: string;
  prizeValue: number;
  winningNumber: string;
  dateWon: string;
  status: 'pending' | 'claimed' | 'delivered';
}

export class ClientHistoryService {
  
  static async getClientStats(userId: string): Promise<ClientHistoryStats> {
    try {
      // Get current user email
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email;
      
      if (!userEmail) {
        return { totalTickets: 0, totalSpent: 0, totalRaffles: 0, totalWins: 0 };
      }

      // Get tickets count and total spent from tickets table
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id, 
          payment_status,
          raffle_id,
          raffles!inner (
            id,
            ticket_price
          )
        `)
        .eq('buyer_email', userEmail);

      if (ticketsError) throw ticketsError;

      const totalTickets = tickets?.filter(t => t.payment_status === 'paid').length || 0;
      const totalSpent = tickets?.reduce((sum, t) => {
        if (t.payment_status === 'paid' && t.raffles?.ticket_price) {
          return sum + t.raffles.ticket_price;
        }
        return sum;
      }, 0) || 0;
      
      // Get unique raffles participated
      const uniqueRaffleIds = [...new Set(tickets?.map(t => t.raffle_id) || [])];
      const totalRaffles = uniqueRaffleIds.length;

      // Get wins (from testimonials table for now)
      const { data: wins, error: winsError } = await supabase
        .from('testimonials')
        .select('id')
        .eq('user_id', userData.user?.id)
        .eq('status', 'approved');

      if (winsError) throw winsError;
      
      const totalWins = wins?.length || 0;

      return {
        totalTickets,
        totalSpent,
        totalRaffles,
        totalWins
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do cliente:', error);
      return {
        totalTickets: 0,
        totalSpent: 0,
        totalRaffles: 0,
        totalWins: 0
      };
    }
  }

  static async getClientTransactions(userId: string, page: number = 1, limit: number = 10): Promise<ClientTransaction[]> {
    try {
      // Get current user email
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email;
      
      if (!userEmail) {
        return [];
      }

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          number,
          purchase_date,
          payment_status,
          raffles!inner (
            title,
            ticket_price
          )
        `)
        .eq('buyer_email', userEmail)
        .order('purchase_date', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Group tickets by raffle to create transactions
      const transactionMap = new Map<string, ClientTransaction>();
      
      tickets?.forEach(ticket => {
        const raffleTitle = ticket.raffles?.title || 'Rifa';
        const key = `${raffleTitle}-${ticket.purchase_date}`;
        
        if (!transactionMap.has(key)) {
          transactionMap.set(key, {
            id: ticket.id,
            raffleTitle,
            ticketNumbers: [],
            amount: ticket.raffles?.ticket_price || 0,
            date: ticket.purchase_date || new Date().toISOString(),
            status: ticket.payment_status === 'paid' ? 'approved' : 'pending'
          });
        }
        
        const transaction = transactionMap.get(key)!;
        transaction.ticketNumbers.push(ticket.number.toString().padStart(2, '0'));
        transaction.amount = ticket.raffles?.ticket_price || 0;
      });

      return Array.from(transactionMap.values());
    } catch (error) {
      console.error('Erro ao buscar transações do cliente:', error);
      return [];
    }
  }

  static async getClientPrizes(userId: string, page: number = 1, limit: number = 10): Promise<ClientPrize[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        return [];
      }

      const { data: testimonials, error } = await supabase
        .from('testimonials')
        .select(`
          id,
          content,
          winning_number,
          created_at,
          status,
          raffle_id,
          raffles!inner (
            title,
            prize,
            prize_value
          )
        `)
        .eq('user_id', userData.user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return testimonials?.map(testimonial => ({
        id: testimonial.id,
        raffleTitle: testimonial.raffles?.title || 'Rifa',
        prizeDescription: testimonial.raffles?.prize || 'Prêmio',
        prizeValue: testimonial.raffles?.prize_value || 0,
        winningNumber: testimonial.winning_number || '',
        dateWon: testimonial.created_at,
        status: 'claimed' as const
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar prêmios do cliente:', error);
      return [];
    }
  }

  static async getMonthlyStats(userId: string, year: number): Promise<any[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email;
      
      if (!userEmail) {
        return Array.from({ length: 12 }, (_, i) => ({ month: i + 1, tickets: 0 }));
      }

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('purchase_date, payment_status')
        .eq('buyer_email', userEmail)
        .gte('purchase_date', `${year}-01-01`)
        .lt('purchase_date', `${year + 1}-01-01`);

      if (error) throw error;

      const monthlyStats = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, tickets: 0 }));
      
      tickets?.forEach(ticket => {
        if (ticket.payment_status === 'paid' && ticket.purchase_date) {
          const month = new Date(ticket.purchase_date).getMonth();
          monthlyStats[month].tickets++;
        }
      });

      return monthlyStats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas mensais:', error);
      return Array.from({ length: 12 }, (_, i) => ({ month: i + 1, tickets: 0 }));
    }
  }
}