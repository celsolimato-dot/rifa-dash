import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { RealAuthService, RegisterData } from '@/services/realAuthService';
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  phone?: string;
  avatar?: string;
  cpf?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const RealAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Transform Supabase user to AuthUser
  const transformUser = (supabaseUser: User): AuthUser => {
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email || '',
      role: supabaseUser.email === 'admin@rifou.net' ? 'admin' : 'client',
      phone: supabaseUser.user_metadata?.phone,
      avatar: supabaseUser.user_metadata?.avatar_url
    };
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ? transformUser(session.user) : null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? transformUser(session.user) : null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const { user: authUser, session: authSession, error } = await RealAuthService.signIn(email, password);
    
    if (error || !authUser) {
      throw new Error(error || 'Login falhou');
    }
  };

  const logout = async (): Promise<void> => {
    const { error } = await RealAuthService.signOut();
    
    if (error) {
      throw new Error(error);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    const { user: authUser, session: authSession, error } = await RealAuthService.signUp(userData);
    
    if (error || !authUser) {
      throw new Error(error || 'Cadastro falhou');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      login, 
      logout, 
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useRealAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useRealAuth must be used within a RealAuthProvider');
  }
  return context;
};