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
      
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      
      const total = raffles?.reduce((sum, raffle) => sum + (raffle.revenue || 0), 0) || 0;
      
      const thisMonthRevenue = raffles?.filter(r => {
        const created = new Date(r.created_at);
        return created >= thisMonth;
      }).reduce((sum, raffle) => sum + (raffle.revenue || 0), 0) || 0;
      
      const lastMonthRevenue = raffles?.filter(r => {
        const created = new Date(r.created_at);
        return created >= lastMonth && created < thisMonth;
      }).reduce((sum, raffle) => sum + (raffle.revenue || 0), 0) || 0;
      
      const growth = lastMonthRevenue > 0 ? 
        ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
      
      return { 
        total, 
        thisMonth: thisMonthRevenue, 
        lastMonth: lastMonthRevenue, 
        growth 
      };
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      return { error: true };
    }
  }

  static async getSalesData() {
    try {
      const { data: raffles, error } = await supabase
        .from('raffles')
        .select('sold_tickets, created_at, revenue')
        .order('created_at', { ascending: false })
        .limit(12);
      
      if (error) throw error;
      
      // Agrupar por mês
      const monthlyData = new Map();
      
      raffles?.forEach(raffle => {
        const date = new Date(raffle.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthName,
            revenue: 0,
            tickets: 0,
            raffles: 0
          });
        }
        
        const existing = monthlyData.get(monthKey);
        existing.revenue += raffle.revenue || 0;
        existing.tickets += raffle.sold_tickets || 0;
        existing.raffles += 1;
      });
      
      const data = Array.from(monthlyData.values()).reverse();
      
      return { data };
    } catch (error) {
      console.error('Error getting sales data:', error);
      return { error: true };
    }
  }

  static async getTicketsMetrics() {
    try {
      const { data: raffles, error } = await supabase
        .from('raffles')
        .select('sold_tickets, total_tickets, created_at');
      
      if (error) throw error;
      
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const totalTicketsSold = raffles?.reduce((sum, raffle) => sum + (raffle.sold_tickets || 0), 0) || 0;
      
      const thisMonthTickets = raffles?.filter(r => {
        const created = new Date(r.created_at);
        return created >= thisMonth;
      }).reduce((sum, raffle) => sum + (raffle.sold_tickets || 0), 0) || 0;
      
      const lastMonthTickets = raffles?.filter(r => {
        const created = new Date(r.created_at);
        return created >= lastMonth && created < thisMonth;
      }).reduce((sum, raffle) => sum + (raffle.sold_tickets || 0), 0) || 0;
      
      const growth = lastMonthTickets > 0 ? 
        ((thisMonthTickets - lastMonthTickets) / lastMonthTickets) * 100 : 0;
      
      return { 
        total: totalTicketsSold, 
        thisMonth: thisMonthTickets, 
        lastMonth: lastMonthTickets, 
        growth 
      };
    } catch (error) {
      console.error('Error getting tickets metrics:', error);
      return { error: true };
    }
  }

  static async getParticipantsMetrics() {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('buyer_email, created_at')
        .eq('status', 'sold');
      
      if (error) throw error;
      
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const uniqueParticipants = new Set(tickets?.map(t => t.buyer_email)).size || 0;
      
      const thisMonthParticipants = new Set(
        tickets?.filter(t => {
          const created = new Date(t.created_at);
          return created >= thisMonth;
        }).map(t => t.buyer_email)
      ).size || 0;
      
      const lastMonthParticipants = new Set(
        tickets?.filter(t => {
          const created = new Date(t.created_at);
          return created >= lastMonth && created < thisMonth;
        }).map(t => t.buyer_email)
      ).size || 0;
      
      const growth = lastMonthParticipants > 0 ? 
        ((thisMonthParticipants - lastMonthParticipants) / lastMonthParticipants) * 100 : 0;
      
      return { 
        total: uniqueParticipants, 
        thisMonth: thisMonthParticipants, 
        lastMonth: lastMonthParticipants, 
        growth 
      };
    } catch (error) {
      console.error('Error getting participants metrics:', error);
      return { error: true };
    }
  }

  static async getConversionRate() {
    try {
      const { data: raffles, error } = await supabase
        .from('raffles')
        .select('sold_tickets, total_tickets');
      
      if (error) throw error;
      
      const totalTickets = raffles?.reduce((sum, raffle) => sum + (raffle.total_tickets || 0), 0) || 0;
      const soldTickets = raffles?.reduce((sum, raffle) => sum + (raffle.sold_tickets || 0), 0) || 0;
      
      const conversionRate = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;
      
      return { conversionRate };
    } catch (error) {
      console.error('Error getting conversion rate:', error);
      return { error: true };
    }
  }

  static async getTopRaffles() {
    try {
      const { data: raffles, error } = await supabase
        .from('raffles')
        .select('*')
        .order('revenue', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Buscar número de participantes únicos para cada rifa
      const raffleIds = raffles?.map(r => r.id) || [];
      const { data: participantsData, error: participantsError } = await supabase
        .from('tickets')
        .select('raffle_id, buyer_email')
        .in('raffle_id', raffleIds)
        .eq('status', 'sold');
      
      if (participantsError) {
        console.error('Error getting participants data:', participantsError);
      }
      
      // Contar participantes únicos por rifa
      const participantsByRaffle = new Map();
      participantsData?.forEach(ticket => {
        if (!participantsByRaffle.has(ticket.raffle_id)) {
          participantsByRaffle.set(ticket.raffle_id, new Set());
        }
        participantsByRaffle.get(ticket.raffle_id).add(ticket.buyer_email);
      });
      
      return raffles?.map(raffle => ({
        id: raffle.id,
        title: raffle.title,
        revenue: raffle.revenue || 0,
        ticketsSold: raffle.sold_tickets || 0,
        totalTickets: raffle.total_tickets || 0,
        participants: participantsByRaffle.get(raffle.id)?.size || 0,
        status: raffle.status
      })) || [];
    } catch (error) {
      console.error('Error getting top raffles:', error);
      return [];
    }
  }

  static async getRecentActivity() {
    try {
      // Buscar rifas recentes
      const { data: raffles, error: rafflesError } = await supabase
        .from('raffles')
        .select('title, status, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (rafflesError) throw rafflesError;
      
      // Buscar tickets recentes
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('buyer_name, created_at, raffle_id')
        .eq('status', 'sold')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (ticketsError) throw ticketsError;
      
      const activities = [];
      
      // Adicionar atividades de rifas
      raffles?.forEach(raffle => {
        if (raffle.status === 'active') {
          activities.push({
            action: "Nova rifa criada",
            item: raffle.title,
            time: this.getTimeAgo(raffle.created_at),
            date: raffle.created_at,
            type: "create"
          });
        } else if (raffle.status === 'completed') {
          activities.push({
            action: "Sorteio realizado",
            item: raffle.title,
            time: this.getTimeAgo(raffle.updated_at || raffle.created_at),
            date: raffle.updated_at || raffle.created_at,
            type: "draw"
          });
        }
      });
      
      // Adicionar atividades de participantes
      tickets?.slice(0, 5).forEach(ticket => {
        activities.push({
          action: "Novo participante",
          item: ticket.buyer_name || "Participante",
          time: this.getTimeAgo(ticket.created_at),
          date: ticket.created_at,
          type: "user"
        });
      });
      
      // Ordenar por data mais recente e limitar
      return activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
        
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  static async getRevenueDistribution() {
    try {
      const { data: raffles, error } = await supabase
        .from('raffles')
        .select('category, revenue');
      
      if (error) throw error;
      
      // Agrupar receita por categoria
      const categoryRevenue = new Map();
      let totalRevenue = 0;
      
      raffles?.forEach(raffle => {
        const category = raffle.category || 'Outros';
        const revenue = raffle.revenue || 0;
        
        if (!categoryRevenue.has(category)) {
          categoryRevenue.set(category, 0);
        }
        
        categoryRevenue.set(category, categoryRevenue.get(category) + revenue);
        totalRevenue += revenue;
      });
      
      // Converter para array e calcular percentuais
      const distribution = Array.from(categoryRevenue.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);
      
      return distribution;
    } catch (error) {
      console.error('Error getting revenue distribution:', error);
      return [];
    }
  }

  private static getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays > 0) {
      return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`;
    } else if (diffInHours > 0) {
      return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'} atrás`;
    } else {
      return 'Agora mesmo';
    }
  }
}