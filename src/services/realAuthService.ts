import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: string | null;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export class RealAuthService {
  static async signUp(data: RegisterData): Promise<AuthResponse> {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: data.name,
            phone: data.phone || ''
          }
        }
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      return { 
        user: authData.user, 
        session: authData.session, 
        error: null 
      };
    } catch (error: any) {
      return { 
        user: null, 
        session: null, 
        error: error.message || 'Erro no cadastro' 
      };
    }
  }

  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      return { 
        user: data.user, 
        session: data.session, 
        error: null 
      };
    } catch (error: any) {
      return { 
        user: null, 
        session: null, 
        error: error.message || 'Erro no login' 
      };
    }
  }

  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Erro no logout' };
    }
  }

  static async getCurrentSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return { user: null, session: null, error: error.message };
      }

      return { 
        user: data.session?.user || null, 
        session: data.session, 
        error: null 
      };
    } catch (error: any) {
      return { 
        user: null, 
        session: null, 
        error: error.message || 'Erro ao obter sessão' 
      };
    }
  }

  static async updateProfile(updates: { name?: string; phone?: string }): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Erro ao atualizar perfil' };
    }
  }
}