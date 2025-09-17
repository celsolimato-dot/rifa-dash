import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TestimonialService, Testimonial } from '../services/testimonialService';

export type { Testimonial };

interface TestimonialsContextType {
  testimonials: Testimonial[];
  isLoading: boolean;
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  getTestimonial: (id: string) => Testimonial | undefined;
  loadTestimonials: () => Promise<void>;
  approveTestimonial: (id: string) => Promise<void>;
  rejectTestimonial: (id: string) => Promise<void>;
}

const TestimonialsContext = createContext<TestimonialsContextType | undefined>(undefined);

const testimonialService = new TestimonialService();

export const TestimonialsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setIsLoading(true);
      const data = await testimonialService.getAllTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await testimonialService.createTestimonial(testimonial);
      await loadTestimonials(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao adicionar depoimento:', error);
      throw error;
    }
  };

  const updateTestimonial = async (id: string, updatedTestimonial: Partial<Testimonial>) => {
    try {
      await testimonialService.updateTestimonial(id, updatedTestimonial);
      await loadTestimonials(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao atualizar depoimento:', error);
      throw error;
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      await testimonialService.deleteTestimonial(id);
      await loadTestimonials(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar depoimento:', error);
      throw error;
    }
  };

  const getTestimonial = (id: string) => {
    return testimonials.find(t => t.id === id);
  };

  const approveTestimonial = async (id: string) => {
    try {
      await testimonialService.approveTestimonial(id);
      await loadTestimonials(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao aprovar depoimento:', error);
      throw error;
    }
  };

  const rejectTestimonial = async (id: string) => {
    try {
      await testimonialService.rejectTestimonial(id);
      await loadTestimonials(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao rejeitar depoimento:', error);
      throw error;
    }
  };

  return (
    <TestimonialsContext.Provider value={{
      testimonials,
      isLoading,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,
      getTestimonial,
      loadTestimonials,
      approveTestimonial,
      rejectTestimonial
    }}>
      {children}
    </TestimonialsContext.Provider>
  );
};

export const useTestimonials = () => {
  const context = useContext(TestimonialsContext);
  if (context === undefined) {
    throw new Error('useTestimonials must be used within a TestimonialsProvider');
  }
  return context;
};