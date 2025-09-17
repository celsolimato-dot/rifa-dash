import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type User = Tables<'users'>;

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
  async getAllParticipants(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar participantes:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async getParticipantById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'client')
      .single();

    if (error) {
      console.error('Erro ao buscar participante:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async getParticipantRaffles(participantId: string): Promise<ParticipantRaffle[]> {
    // Mock implementation for now since we don't have a purchases table
    return [];
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
    const { data: participants, error } = await supabase
      .from('users')
      .select('status')
      .eq('role', 'client');

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error(error.message);
    }

    const stats = participants?.reduce((acc, participant) => {
      acc.total++;
      if (participant.status === 'active') acc.active++;
      else if (participant.status === 'inactive') acc.inactive++;
      else if (participant.status === 'blocked') acc.blocked++;
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

    return stats;
  }
}