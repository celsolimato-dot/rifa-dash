import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type User = Tables<'users'>;

// Interface for participants based on ticket data
export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'blocked';
  created_at: string;
  avatar_url?: string;
  total_tickets: number;
  total_spent: number;
  raffles_participated: number;
  wins: number;
}

export interface ParticipantStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  totalRevenue: number;
  averageSpent: number;
}

export interface ParticipantRaffle {
  id: string;
  raffle_name: string;
  ticket_numbers: string[];
  purchase_date: string;
  amount: number;
  status: "active" | "winner" | "loser";
}

export class RealParticipantService {
  async getAllParticipants(): Promise<Participant[]> {
    // Get unique participants from tickets table with raffle price info
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        buyer_email,
        buyer_name,
        buyer_phone,
        created_at,
        raffle_id,
        status,
        raffles (
          ticket_price
        )
      `)
      .not('buyer_email', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar participantes:', error);
      throw new Error(error.message);
    }

    // Group tickets by buyer to create participant records
    const participantMap = new Map<string, Participant>();
    
    data?.forEach(ticket => {
      const email = ticket.buyer_email!;
      
      if (!participantMap.has(email)) {
        participantMap.set(email, {
          id: email, // Using email as ID since we don't have user IDs
          name: ticket.buyer_name || 'Nome não informado',
          email: email,
          phone: ticket.buyer_phone || 'Telefone não informado',
          status: 'active',
          created_at: ticket.created_at || new Date().toISOString(),
          avatar_url: undefined,
          total_tickets: 0,
          total_spent: 0,
          raffles_participated: 0,
          wins: 0
        });
      }
      
      const participant = participantMap.get(email)!;
      
      // Count only sold tickets
      if (ticket.status === 'sold') {
        participant.total_tickets += 1;
        participant.total_spent += ticket.raffles?.ticket_price || 0;
      }
    });

    // Calculate unique raffles participated for each participant
    data?.forEach(ticket => {
      const email = ticket.buyer_email!;
      const participant = participantMap.get(email);
      if (participant) {
        const raffleIds = new Set();
        data?.filter(t => t.buyer_email === email && t.status === 'sold')
          .forEach(t => raffleIds.add(t.raffle_id));
        participant.raffles_participated = raffleIds.size;
      }
    });

    return Array.from(participantMap.values());
  }

  async getParticipantById(id: string): Promise<Participant | null> {
    const participants = await this.getAllParticipants();
    return participants.find(p => p.id === id) || null;
  }

  async getParticipantRaffles(participantId: string): Promise<ParticipantRaffle[]> {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        id,
        raffle_id,
        number,
        status,
        created_at,
        purchase_date,
        raffles (
          title,
          ticket_price
        )
      `)
      .eq('buyer_email', participantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar rifas do participante:', error);
      throw new Error(error.message);
    }

    // Group tickets by raffle
    const raffleMap = new Map<string, ParticipantRaffle>();
    
    tickets?.forEach(ticket => {
      if (!raffleMap.has(ticket.raffle_id)) {
        raffleMap.set(ticket.raffle_id, {
          id: ticket.raffle_id,
          raffle_name: ticket.raffles?.title || 'Rifa não encontrada',
          ticket_numbers: [],
          purchase_date: ticket.purchase_date || ticket.created_at || new Date().toISOString(),
          amount: 0,
          status: ticket.status === 'sold' ? 'active' : 'loser'
        });
      }
      
      const raffle = raffleMap.get(ticket.raffle_id)!;
      raffle.ticket_numbers.push(ticket.number.toString());
      raffle.amount += ticket.raffles?.ticket_price || 0;
    });

    return Array.from(raffleMap.values());
  }

  async updateParticipantStatus(id: string, status: 'active' | 'inactive' | 'blocked'): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      throw new Error(error.message);
    }
  }

  async getParticipantStats(): Promise<ParticipantStats> {
    const participants = await this.getAllParticipants();
    
    // Calculate revenue from sold tickets
    const { data: soldTickets, error } = await supabase
      .from('tickets')
      .select(`
        raffle_id,
        raffles (
          ticket_price
        )
      `)
      .eq('status', 'sold');

    if (error) {
      console.error('Erro ao buscar tickets vendidos:', error);
    }

    const totalRevenue = soldTickets?.reduce((sum, ticket) => {
      return sum + (ticket.raffles?.ticket_price || 0);
    }, 0) || 0;

    const stats = {
      total: participants.length,
      active: participants.filter(p => p.status === 'active').length,
      inactive: participants.filter(p => p.status === 'inactive').length,
      blocked: participants.filter(p => p.status === 'blocked').length,
      totalRevenue,
      averageSpent: participants.length > 0 ? totalRevenue / participants.length : 0
    };

    return stats;
  }
}