import { supabase } from '../lib/supabase'
import type { User } from '../contexts/AuthContext'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  city?: string
  state?: string
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      // Autenticar com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Usuário não encontrado' }
      }

      // Buscar dados do usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError) {
        return { user: null, error: 'Erro ao carregar dados do usuário' }
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
      }

      return { user, error: null }
    } catch (error) {
      console.error('Erro no login:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  static async register(data: RegisterData): Promise<{ user: User | null; error: string | null }> {
    try {
      // Registrar com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Erro ao criar usuário' }
      }

      // Criar registro na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: 'client',
          city: data.city,
          state: data.state,
          status: 'active',
        })
        .select()
        .single()

      if (userError) {
        // Se falhar ao criar o usuário, deletar da auth
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { user: null, error: 'Erro ao criar perfil do usuário' }
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
      }

      return { user, error: null }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  static async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error) {
      console.error('Erro no logout:', error)
      return { error: 'Erro interno do servidor' }
    }
  }

  static async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError || !authData.user) {
        return { user: null, error: null }
      }

      // Buscar dados do usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError) {
        return { user: null, error: 'Erro ao carregar dados do usuário' }
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
      }

      return { user, error: null }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  static async updateProfile(userId: string, updates: Partial<RegisterData>): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update({
          name: updates.name,
          phone: updates.phone,
          city: updates.city,
          state: updates.state,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (userError) {
        return { user: null, error: 'Erro ao atualizar perfil' }
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
      }

      return { user, error: null }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  static async changePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      return { error: error?.message || null }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      return { error: 'Erro interno do servidor' }
    }
  }
}