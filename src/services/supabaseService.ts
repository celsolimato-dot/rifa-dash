import { supabase } from '@/integrations/supabase/client';

// Mock Supabase service to replace broken service files temporarily
export class MockSupabaseService {
  from(table: string) {
    return {
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: (orderBy: string, options?: any) => Promise.resolve({ data: [], error: null }),
          limit: (count: number) => Promise.resolve({ data: [], error: null })
        }),
        order: (orderBy: string, options?: any) => Promise.resolve({ data: [], error: null }),
        limit: (count: number) => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        data: [],
        error: null
      }),
      insert: (data: any) => Promise.resolve({ data: null, error: null }),
      update: (data: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
      })
    };
  }
}

export const mockSupabase = new MockSupabaseService();