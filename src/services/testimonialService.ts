import { supabase } from '../lib/supabase';
import { config } from '../lib/config';
import { mockTestimonials, simulateNetworkDelay } from '../lib/mockData';

export interface Testimonial {
  id: string;
  name: string;
  prize: string;
  prizeValue: string;
  date: string;
  image: string;
  raffleTitle: string;
  winningNumber: string;
  type: string;
  testimonial?: string;
  userId?: string;
  raffleId?: string;
  rating?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export class TestimonialService {
  async getAllTestimonials(): Promise<Testimonial[]> {
    // Modo de desenvolvimento - usar dados mock
    if (config.isDevelopment) {
      await simulateNetworkDelay(300);
      return mockTestimonials.filter(testimonial => testimonial.status === 'approved');
    }

    // Modo de produção - usar Supabase
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        *,
        users!testimonials_user_id_fkey(name, email),
        raffles!testimonials_raffle_id_fkey(title, prize, prize_value)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar depoimentos: ${error.message}`);
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.users?.name || 'Usuário',
      prize: item.raffles?.prize || 'Prêmio',
      prizeValue: `R$ ${item.raffles?.prize_value?.toLocaleString('pt-BR') || '0'}`,
      date: new Date(item.created_at).toLocaleDateString('pt-BR'),
      image: '/placeholder.svg',
      raffleTitle: item.raffles?.title || 'Rifa',
      winningNumber: '0000', // Pode ser adicionado ao banco depois
      type: item.type || 'general',
      testimonial: item.content,
      userId: item.user_id,
      raffleId: item.raffle_id,
      rating: item.rating,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  async getTestimonialById(id: string): Promise<Testimonial | null> {
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        *,
        users!testimonials_user_id_fkey(name, email),
        raffles!testimonials_raffle_id_fkey(title, prize, prize_value)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar depoimento: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.users?.name || 'Usuário',
      prize: data.raffles?.prize || 'Prêmio',
      prizeValue: `R$ ${data.raffles?.prize_value?.toLocaleString('pt-BR') || '0'}`,
      date: new Date(data.created_at).toLocaleDateString('pt-BR'),
      image: '/placeholder.svg',
      raffleTitle: data.raffles?.title || 'Rifa',
      winningNumber: '0000',
      type: data.type || 'general',
      testimonial: data.content,
      userId: data.user_id,
      raffleId: data.raffle_id,
      rating: data.rating,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial> {
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        user_id: testimonial.userId,
        raffle_id: testimonial.raffleId,
        content: testimonial.testimonial || '',
        rating: testimonial.rating || 5,
        type: testimonial.type || 'general',
        status: testimonial.status || 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar depoimento: ${error.message}`);
    }

    return this.getTestimonialById(data.id) as Promise<Testimonial>;
  }

  async updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
    const updateData: any = {};
    
    if (updates.testimonial !== undefined) updateData.content = updates.testimonial;
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar depoimento: ${error.message}`);
    }

    return this.getTestimonialById(id) as Promise<Testimonial>;
  }

  async deleteTestimonial(id: string): Promise<void> {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar depoimento: ${error.message}`);
    }
  }

  async approveTestimonial(id: string): Promise<Testimonial> {
    return this.updateTestimonial(id, { status: 'approved' });
  }

  async rejectTestimonial(id: string): Promise<Testimonial> {
    return this.updateTestimonial(id, { status: 'rejected' });
  }

  async getWinnerTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        *,
        users!testimonials_user_id_fkey(name, email),
        raffles!testimonials_raffle_id_fkey(title, prize, prize_value)
      `)
      .eq('type', 'winner')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar depoimentos de ganhadores: ${error.message}`);
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.users?.name || 'Usuário',
      prize: item.raffles?.prize || 'Prêmio',
      prizeValue: `R$ ${item.raffles?.prize_value?.toLocaleString('pt-BR') || '0'}`,
      date: new Date(item.created_at).toLocaleDateString('pt-BR'),
      image: '/placeholder.svg',
      raffleTitle: item.raffles?.title || 'Rifa',
      winningNumber: '0000',
      type: item.type || 'general',
      testimonial: item.content,
      userId: item.user_id,
      raffleId: item.raffle_id,
      rating: item.rating,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }
}