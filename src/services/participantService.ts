import { supabase } from '../lib/supabase';

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  registration_date: string;
  total_tickets: number;
  total_spent: number;
  raffles_participated: number;
  wins: number;
  status: "active" | "inactive" | "blocked";
  avatar?: string;
  last_activity: string;
}

export interface ParticipantRaffle {
  id: string;
  raffle_name: string;
  ticket_numbers: string[];
  purchase_date: string;
  amount: number;
  status: "active" | "winner" | "loser";
}

export class ParticipantService {
  async getAllParticipants(): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar participantes: ${error.message}`);
    }

    return data || [];
  }

  async getParticipantById(id: string): Promise<Participant | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'client')
      .single();

    if (error) {
      throw new Error(`Erro ao buscar participante: ${error.message}`);
    }

    return data;
  }

  async getParticipantRaffles(participantId: string): Promise<ParticipantRaffle[]> {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        raffle:raffles(title),
        tickets(number)
      `)
      .eq('user_id', participantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar rifas do participante: ${error.message}`);
    }

    return data?.map(purchase => ({
      id: purchase.id,
      raffle_name: purchase.raffle.title,
      ticket_numbers: purchase.tickets.map((t: any) => t.number),
      purchase_date: purchase.created_at,
      amount: purchase.amount,
      status: purchase.status
    })) || [];
  }

  async updateParticipantStatus(id: string, status: "active" | "inactive" | "blocked"): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar status do participante: ${error.message}`);
    }
  }

  async getParticipantStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    blocked: number;
    totalRevenue: number;
    averageSpent: number;
  }> {
    // Buscar estatísticas dos participantes
    const { data: participants, error: participantsError } = await supabase
      .from('users')
      .select('status, total_spent')
      .eq('role', 'client');

    if (participantsError) {
      throw new Error(`Erro ao buscar estatísticas: ${participantsError.message}`);
    }

    const stats = participants?.reduce((acc, participant) => {
      acc.total++;
      acc[participant.status as keyof typeof acc]++;
      acc.totalRevenue += participant.total_spent || 0;
      return acc;
    }, {
      total: 0,
      active: 0,
      inactive: 0,
      blocked: 0,
      totalRevenue: 0,
      averageSpent: 0
    }) || {
      total: 0,
      active: 0,
      inactive: 0,
      blocked: 0,
      totalRevenue: 0,
      averageSpent: 0
    };

    stats.averageSpent = stats.total > 0 ? stats.totalRevenue / stats.total : 0;

    return stats;
  }
}