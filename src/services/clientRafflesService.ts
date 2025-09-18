import { supabase } from '@/integrations/supabase/client';

export interface ClientRaffle {
  id: string;
  title: string;
  description: string;
  prize: string;
  prizeValue: number;
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  drawDate: string;
  status: string;
  category: string;
  imageUrl?: string;
  userTickets?: string[];
  userTicketCount: number;
}

export class ClientRafflesService {
  
  static async getActiveRaffles(userEmail: string): Promise<ClientRaffle[]> {
    try {
      // Get active raffles
      const { data: raffles, error: rafflesError } = await supabase
        .from('raffles')
        .select('*')
        .eq('status', 'active')
        .order('draw_date', { ascending: true });

      if (rafflesError) throw rafflesError;

      // Get user tickets for each raffle
      const { data: userTickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('raffle_id, number')
        .eq('buyer_email', userEmail)
        .eq('status', 'sold');

      if (ticketsError) throw ticketsError;

      return raffles?.map(raffle => {
        const tickets = userTickets?.filter(t => t.raffle_id === raffle.id) || [];
        return {
          id: raffle.id,
          title: raffle.title,
          description: raffle.description || '',
          prize: raffle.prize,
          prizeValue: raffle.prize_value,
          ticketPrice: raffle.ticket_price,
          totalTickets: raffle.total_tickets,
          soldTickets: raffle.sold_tickets,
          drawDate: raffle.draw_date,
          status: raffle.status,
          category: raffle.category,
          imageUrl: raffle.image_url,
          userTickets: tickets.map(t => t.number.toString()),
          userTicketCount: tickets.length
        };
      }) || [];
    } catch (error) {
      console.error('Error getting active raffles:', error);
      return [];
    }
  }

  static async getCompletedRaffles(userEmail: string): Promise<ClientRaffle[]> {
    try {
      // Get completed raffles where user participated
      const { data: userTickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('raffle_id, number')
        .eq('buyer_email', userEmail)
        .eq('status', 'sold');

      if (ticketsError) throw ticketsError;

      const raffleIds = [...new Set(userTickets?.map(t => t.raffle_id) || [])];

      const { data: raffles, error: rafflesError } = await supabase
        .from('raffles')
        .select('*')
        .in('id', raffleIds)
        .eq('status', 'completed')
        .order('draw_date', { ascending: false });

      if (rafflesError) throw rafflesError;

      return raffles?.map(raffle => {
        const tickets = userTickets?.filter(t => t.raffle_id === raffle.id) || [];
        return {
          id: raffle.id,
          title: raffle.title,
          description: raffle.description || '',
          prize: raffle.prize,
          prizeValue: raffle.prize_value,
          ticketPrice: raffle.ticket_price,
          totalTickets: raffle.total_tickets,
          soldTickets: raffle.sold_tickets,
          drawDate: raffle.draw_date,
          status: raffle.status,
          category: raffle.category,
          imageUrl: raffle.image_url,
          userTickets: tickets.map(t => t.number.toString()),
          userTicketCount: tickets.length
        };
      }) || [];
    } catch (error) {
      console.error('Error getting completed raffles:', error);
      return [];
    }
  }

  static async getFavoriteRaffles(userEmail: string): Promise<ClientRaffle[]> {
    try {
      // For now, return raffles where user has most tickets
      const { data: userTickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('raffle_id, number')
        .eq('buyer_email', userEmail)
        .eq('status', 'sold');

      if (ticketsError) throw ticketsError;

      // Count tickets per raffle
      const ticketCounts = userTickets?.reduce((acc, ticket) => {
        acc[ticket.raffle_id] = (acc[ticket.raffle_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get raffles with most tickets (favorites)
      const favoriteRaffleIds = Object.entries(ticketCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id);

      if (favoriteRaffleIds.length === 0) return [];

      const { data: raffles, error: rafflesError } = await supabase
        .from('raffles')
        .select('*')
        .in('id', favoriteRaffleIds);

      if (rafflesError) throw rafflesError;

      return raffles?.map(raffle => {
        const tickets = userTickets?.filter(t => t.raffle_id === raffle.id) || [];
        return {
          id: raffle.id,
          title: raffle.title,
          description: raffle.description || '',
          prize: raffle.prize,
          prizeValue: raffle.prize_value,
          ticketPrice: raffle.ticket_price,
          totalTickets: raffle.total_tickets,
          soldTickets: raffle.sold_tickets,
          drawDate: raffle.draw_date,
          status: raffle.status,
          category: raffle.category,
          imageUrl: raffle.image_url,
          userTickets: tickets.map(t => t.number.toString()),
          userTicketCount: tickets.length
        };
      }) || [];
    } catch (error) {
      console.error('Error getting favorite raffles:', error);
      return [];
    }
  }

  static async purchaseTickets(raffleId: string, ticketNumbers: number[], userInfo: any): Promise<boolean> {
    try {
      // Insert tickets
      const tickets = ticketNumbers.map(number => ({
        raffle_id: raffleId,
        number: number,
        buyer_name: userInfo.name,
        buyer_email: userInfo.email,
        buyer_phone: userInfo.phone,
        status: 'sold',
        payment_status: 'pending',
        purchase_date: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('tickets')
        .insert(tickets);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      return false;
    }
  }
}