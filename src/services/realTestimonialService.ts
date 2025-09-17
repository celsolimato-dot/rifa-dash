import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Testimonial = Tables<'testimonials'>;
export type TestimonialInsert = TablesInsert<'testimonials'>;
export type TestimonialUpdate = TablesUpdate<'testimonials'>;

export class RealTestimonialService {
  async getAllTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar depoimentos:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar depoimentos aprovados:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async createTestimonial(testimonial: Omit<TestimonialInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Testimonial> {
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonial)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar depoimento:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async updateTestimonial(id: string, updates: TestimonialUpdate): Promise<Testimonial> {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar depoimento:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async deleteTestimonial(id: string): Promise<void> {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar depoimento:', error);
      throw new Error(error.message);
    }
  }

  async approveTestimonial(id: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await supabase.rpc('approve_testimonial', {
      testimonial_id: id,
      approver_id: userData.user.id
    });

    if (error) {
      console.error('Erro ao aprovar depoimento:', error);
      throw new Error(error.message);
    }
  }

  async rejectTestimonial(id: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await supabase.rpc('reject_testimonial', {
      testimonial_id: id,
      approver_id: userData.user.id
    });

    if (error) {
      console.error('Erro ao rejeitar depoimento:', error);
      throw new Error(error.message);
    }
  }
}