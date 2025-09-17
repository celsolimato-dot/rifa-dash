import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Ticket = Tables<'tickets'>;
export type TicketInsert = TablesInsert<'tickets'>;
export type TicketUpdate = TablesUpdate<'tickets'>;

export class RealTicketService {
  async getTicketsByRaffle(raffleId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('raffle_id', raffleId)
      .order('number', { ascending: true });

    if (error) {
      console.error('Erro ao buscar tickets:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async purchaseTickets(raffleId: string, ticketNumbers: number[], buyerInfo: {
    name: string;
    email: string;
    phone: string;
  }): Promise<Ticket[]> {
    const ticketsToInsert: TicketInsert[] = ticketNumbers.map(number => ({
      raffle_id: raffleId,
      number,
      buyer_name: buyerInfo.name,
      buyer_email: buyerInfo.email,
      buyer_phone: buyerInfo.phone,
      status: 'sold',
      payment_status: 'pending',
      purchase_date: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('tickets')
      .insert(ticketsToInsert)
      .select();

    if (error) {
      console.error('Erro ao comprar tickets:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async getUserTickets(userEmail: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        raffle:raffles(*)
      `)
      .eq('buyer_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar tickets do usuário:', error);
      throw new Error(error.message);
    }

    return data || [];
  }
}