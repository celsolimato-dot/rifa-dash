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
      // Get tickets count and total spent from tickets table
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, payment_status')
        .eq('buyer_email', userId);

      if (ticketsError) throw ticketsError;

      const totalTickets = tickets?.filter(t => t.payment_status === 'paid').length || 0;
      const totalSpent = 0; // Calculate from ticket prices if needed
      
      // Get unique raffles participated
      const { data: raffles, error: rafflesError } = await supabase
        .from('raffles')
        .select('id')
        .in('id', tickets?.map(t => t.raffle_id) || []);

      if (rafflesError) throw rafflesError;

      const totalRaffles = raffles?.length || 0;
      const totalWins = 0; // Calculate wins from testimonials or other source

      return {
        totalTickets,
        totalSpent,
        totalRaffles,
        totalWins
      };
    } catch (error) {
      console.error('Error getting client stats:', error);
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
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          number,
          payment_status,
          created_at,
          raffles (
            id,
            title,
            ticket_price
          )
        `)
        .eq('buyer_email', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return tickets?.map(ticket => ({
        id: ticket.id,
        raffleTitle: ticket.raffles?.title || '',
        ticketNumbers: [ticket.number.toString()],
        amount: ticket.raffles?.ticket_price || 0,
        date: ticket.created_at,
        status: ticket.payment_status === 'paid' ? 'approved' : 'pending'
      })) || [];
    } catch (error) {
      console.error('Error getting client transactions:', error);
      return [];
    }
  }

  static async getClientPrizes(userId: string, page: number = 1, limit: number = 10): Promise<ClientPrize[]> {
    try {
      // Get winning testimonials for this user
      const { data: testimonials, error } = await supabase
        .from('testimonials')
        .select(`
          id,
          content,
          winning_number,
          created_at,
          raffle_id
        `)
        .eq('user_id', userId)
        .eq('type', 'winner')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Get raffle details for each testimonial
      const raffleIds = testimonials?.map(t => t.raffle_id) || [];
      const { data: raffles } = await supabase
        .from('raffles')
        .select('id, title, prize, prize_value')
        .in('id', raffleIds);

      return testimonials?.map(testimonial => {
        const raffle = raffles?.find(r => r.id === testimonial.raffle_id);
        return {
          id: testimonial.id,
          raffleTitle: raffle?.title || '',
          prizeDescription: raffle?.prize || '',
          prizeValue: raffle?.prize_value || 0,
          winningNumber: testimonial.winning_number || '',
          dateWon: testimonial.created_at,
          status: 'pending' as const
        };
      }) || [];
    } catch (error) {
      console.error('Error getting client prizes:', error);
      return [];
    }
  }

  static async getMonthlyStats(userId: string, year: number): Promise<any[]> {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('created_at, payment_status')
        .eq('buyer_email', userId)
        .gte('created_at', `${year}-01-01`)
        .lt('created_at', `${year + 1}-01-01`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        tickets: 0,
        amount: 0
      }));

      tickets?.forEach(ticket => {
        if (ticket.payment_status === 'paid') {
          const month = new Date(ticket.created_at).getMonth();
          monthlyData[month].tickets += 1;
        }
      });

      return monthlyData;
    } catch (error) {
      console.error('Error getting monthly stats:', error);
      return [];
    }
  }
}