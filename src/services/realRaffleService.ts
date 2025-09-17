import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Raffle = Tables<'raffles'>;
export type RaffleInsert = TablesInsert<'raffles'>;
export type RaffleUpdate = TablesUpdate<'raffles'>;

export class RealRaffleService {
  // Static instance for direct method calls
  static async getAllRaffles(): Promise<Raffle[]> {
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

  static async getRaffles(filters?: { status?: string; category?: string }): Promise<Raffle[]> {
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

  static async getActiveRaffles(): Promise<Raffle[]> {
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

  static async getRaffleById(id: string): Promise<Raffle | null> {
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

  static async createRaffle(raffle: RaffleInsert): Promise<Raffle> {
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

  static async updateRaffle(id: string, updates: RaffleUpdate): Promise<Raffle> {
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

  static async deleteRaffle(id: string): Promise<void> {
    const { error } = await supabase
      .from('raffles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar rifa:', error);
      throw new Error(error.message);
    }
  }

  static async getRafflesByCategory(category: string): Promise<Raffle[]> {
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

  static async getRevenueMetrics() {
    try {
      const { data: raffles, error } = await supabase
        .from('raffles')
        .select('revenue, created_at');
      
      if (error) throw error;
      
      const total = raffles?.reduce((sum, raffle) => sum + (raffle.revenue || 0), 0) || 0;
      const thisMonth = raffles?.filter(r => {
        const created = new Date(r.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).reduce((sum, raffle) => sum + (raffle.revenue || 0), 0) || 0;
      
      return { total, thisMonth, lastMonth: 0, growth: 0 };
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      return { error: true };
    }
  }

  static async getSalesData() {
    try {
      const { data: raffles, error } = await supabase
        .from('raffles')
        .select('sold_tickets, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      const data = raffles?.map(raffle => ({
        date: raffle.created_at,
        sales: raffle.sold_tickets || 0
      })) || [];
      
      return { data };
    } catch (error) {
      console.error('Error getting sales data:', error);
      return { error: true };
    }
  }
}