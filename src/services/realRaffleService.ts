import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Raffle = Tables<'raffles'>;
export type RaffleInsert = TablesInsert<'raffles'>;
export type RaffleUpdate = TablesUpdate<'raffles'>;

export class RealRaffleService {
  async getAllRaffles(): Promise<Raffle[]> {
    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar rifas:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async getRaffles(filters?: { status?: string; category?: string }): Promise<Raffle[]> {
    let query = supabase
      .from('raffles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar rifas:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async getActiveRaffles(): Promise<Raffle[]> {
    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .eq('status', 'active')
      .order('draw_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar rifas ativas:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async getRaffleById(id: string): Promise<Raffle | null> {
    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar rifa:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async createRaffle(raffle: RaffleInsert): Promise<Raffle> {
    const { data, error } = await supabase
      .from('raffles')
      .insert(raffle)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar rifa:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async updateRaffle(id: string, updates: RaffleUpdate): Promise<Raffle> {
    const { data, error } = await supabase
      .from('raffles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar rifa:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async deleteRaffle(id: string): Promise<void> {
    const { error } = await supabase
      .from('raffles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar rifa:', error);
      throw new Error(error.message);
    }
  }

  async getRafflesByCategory(category: string): Promise<Raffle[]> {
    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('draw_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar rifas por categoria:', error);
      throw new Error(error.message);
    }

    return data || [];
  }
}