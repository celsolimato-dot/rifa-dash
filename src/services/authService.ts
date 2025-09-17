import { simulateNetworkDelay } from '../lib/mockData'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
}

interface MockUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'client'
}

// Mock users for development
const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@rifou.net',
    phone: '(11) 99999-9999',
    role: 'admin'
  },
  {
    id: '2', 
    name: 'Cliente Teste',
    email: 'cliente@teste.com',
    phone: '(11) 88888-8888',
    role: 'client'
  }
]

// Mock passwords (in real app, these would be hashed)
const mockPasswords: { [email: string]: string } = {
  'admin@rifou.net': 'admin123',
  'cliente@teste.com': 'cliente123'
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ user: any | null; error: string | null }> {
    try {
      await simulateNetworkDelay(1000)
      
      const user = mockUsers.find(u => u.email === credentials.email)
      const password = mockPasswords[credentials.email]
      
      if (!user || password !== credentials.password) {
        return { user: null, error: 'Email ou senha inválidos' }
      }
      
      // Save to localStorage
      localStorage.setItem('auth_user', JSON.stringify(user))
      localStorage.setItem('auth_token', 'mock-token-' + user.id)
      
      return { user, error: null }
    } catch (error) {
      console.error('Erro no login:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  static async register(data: RegisterData): Promise<{ user: any | null; error: string | null }> {
    try {
      await simulateNetworkDelay(1000)
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === data.email)
      if (existingUser) {
        return { user: null, error: 'Email já cadastrado' }
      }
      
      // Create new user
      const newUser: MockUser = {
        id: String(mockUsers.length + 1),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'client'
      }
      
      mockUsers.push(newUser)
      mockPasswords[data.email] = data.password
      
      // Save to localStorage
      localStorage.setItem('auth_user', JSON.stringify(newUser))
      localStorage.setItem('auth_token', 'mock-token-' + newUser.id)
      
      return { user: newUser, error: null }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  static async logout(): Promise<{ error: string | null }> {
    try {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
      return { error: null }
    } catch (error) {
      console.error('Erro no logout:', error)
      return { error: 'Erro interno do servidor' }
    }
  }

  static async getCurrentUser(): Promise<{ user: any | null; error: string | null }> {
    try {
      const userStr = localStorage.getItem('auth_user')
      const token = localStorage.getItem('auth_token')
      
      if (!userStr || !token) {
        return { user: null, error: null }
      }
      
      const user = JSON.parse(userStr)
      return { user, error: null }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  static async updateProfile(userId: string, updates: Partial<RegisterData>): Promise<{ user: any | null; error: string | null }> {
    try {
      const userStr = localStorage.getItem('auth_user')
      if (!userStr) {
        return { user: null, error: 'Usuário não encontrado' }
      }
      
      const user = JSON.parse(userStr)
      const updatedUser = { ...user, ...updates }
      
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))
      
      return { user: updatedUser, error: null }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  static async changePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const userStr = localStorage.getItem('auth_user')
      if (!userStr) {
        return { error: 'Usuário não encontrado' }
      }
      
      const user = JSON.parse(userStr)
      mockPasswords[user.email] = newPassword
      
      return { error: null }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      return { error: 'Erro interno do servidor' }
    }
  }
}