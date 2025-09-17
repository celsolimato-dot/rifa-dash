import { supabase } from '../lib/supabase'
import { config } from '../lib/config'
import { mockRaffles, simulateNetworkDelay } from '../lib/mockData'

export interface Raffle {
  id: string
  title: string
  prize: string
  prizeValue: number
  ticketPrice: number
  totalTickets: number
  soldTickets: number
  status: 'active' | 'paused' | 'finished' | 'draft'
  drawDate: Date
  category: string
  createdAt: Date
  updatedAt: Date
  revenue: number
  institutionName?: string
  institutionLogo?: string
  description?: string
  imageUrl?: string
  createdBy: string
}

export interface CreateRaffleData {
  title: string
  prize: string
  prizeValue: number
  ticketPrice: number
  totalTickets: number
  drawDate: Date
  category: string
  institutionName?: string
  institutionLogo?: string
  description?: string
  imageUrl?: string
}

export interface UpdateRaffleData extends Partial<CreateRaffleData> {
  status?: 'active' | 'paused' | 'finished' | 'draft'
  soldTickets?: number
  revenue?: number
}

export class RaffleService {
  static async createRaffle(data: CreateRaffleData, createdBy: string): Promise<{ raffle: Raffle | null; error: string | null }> {
    try {
      const { data: raffleData, error } = await supabase
        .from('raffles')
        .insert({
          title: data.title,
          prize: data.prize,
          prize_value: data.prizeValue,
          ticket_price: data.ticketPrice,
          total_tickets: data.totalTickets,
          draw_date: data.drawDate.toISOString(),
          category: data.category,
          institution_name: data.institutionName,
          institution_logo: data.institutionLogo,
          description: data.description,
          image_url: data.imageUrl,
          created_by: createdBy,
          status: 'draft',
          sold_tickets: 0,
          revenue: 0,
        })
        .select()
        .single()

      if (error) {
        return { raffle: null, error: error.message }
      }

      // Criar tickets para a rifa
      const tickets = Array.from({ length: data.totalTickets }, (_, index) => ({
        raffle_id: raffleData.id,
        number: index + 1,
        status: 'available' as const,
      }))

      const { error: ticketsError } = await supabase
        .from('tickets')
        .insert(tickets)

      if (ticketsError) {
        // Se falhar ao criar tickets, deletar a rifa
        await supabase.from('raffles').delete().eq('id', raffleData.id)
        return { raffle: null, error: 'Erro ao criar tickets da rifa' }
      }

      const raffle: Raffle = {
        id: raffleData.id,
        title: raffleData.title,
        prize: raffleData.prize,
        prizeValue: raffleData.prize_value,
        ticketPrice: raffleData.ticket_price,
        totalTickets: raffleData.total_tickets,
        soldTickets: raffleData.sold_tickets,
        status: raffleData.status,
        drawDate: new Date(raffleData.draw_date),
        category: raffleData.category,
        createdAt: new Date(raffleData.created_at),
        updatedAt: new Date(raffleData.updated_at),
        revenue: raffleData.revenue,
        institutionName: raffleData.institution_name,
        institutionLogo: raffleData.institution_logo,
        description: raffleData.description,
        imageUrl: raffleData.image_url,
        createdBy: raffleData.created_by,
      }

      return { raffle, error: null }
    } catch (error) {
      console.error('Erro ao criar rifa:', error)
      return { raffle: null, error: 'Erro interno do servidor' }
    }
  }

  static async getRaffles(filters?: {
    status?: string
    category?: string
    createdBy?: string
  }): Promise<{ raffles: Raffle[]; error: string | null }> {
    try {
      // Modo de desenvolvimento - usar dados mock
      if (config.isDevelopment) {
        await simulateNetworkDelay(300);
        
        let filteredRaffles = [...mockRaffles];
        
        if (filters?.status) {
          filteredRaffles = filteredRaffles.filter(raffle => raffle.status === filters.status);
        }
        if (filters?.category) {
          filteredRaffles = filteredRaffles.filter(raffle => raffle.category === filters.category);
        }
        if (filters?.createdBy) {
          filteredRaffles = filteredRaffles.filter(raffle => raffle.createdBy === filters.createdBy);
        }
        
        return { raffles: filteredRaffles, error: null };
      }

      // Modo de produção - usar Supabase
      let query = supabase.from('raffles').select('*')

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      if (filters?.createdBy) {
        query = query.eq('created_by', filters.createdBy)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        return { raffles: [], error: error.message }
      }

      const raffles: Raffle[] = data.map(item => ({
        id: item.id,
        title: item.title,
        prize: item.prize,
        prizeValue: item.prize_value,
        ticketPrice: item.ticket_price,
        totalTickets: item.total_tickets,
        soldTickets: item.sold_tickets,
        status: item.status,
        drawDate: new Date(item.draw_date),
        category: item.category,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        revenue: item.revenue,
        institutionName: item.institution_name,
        institutionLogo: item.institution_logo,
        description: item.description,
        imageUrl: item.image_url,
        createdBy: item.created_by,
      }))

      return { raffles, error: null }
    } catch (error) {
      console.error('Erro ao buscar rifas:', error)
      return { raffles: [], error: 'Erro interno do servidor' }
    }
  }

  static async getRaffleById(id: string): Promise<{ raffle: Raffle | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { raffle: null, error: error.message }
      }

      const raffle: Raffle = {
        id: data.id,
        title: data.title,
        prize: data.prize,
        prizeValue: data.prize_value,
        ticketPrice: data.ticket_price,
        totalTickets: data.total_tickets,
        soldTickets: data.sold_tickets,
        status: data.status,
        drawDate: new Date(data.draw_date),
        category: data.category,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        revenue: data.revenue,
        institutionName: data.institution_name,
        institutionLogo: data.institution_logo,
        description: data.description,
        imageUrl: data.image_url,
        createdBy: data.created_by,
      }

      return { raffle, error: null }
    } catch (error) {
      console.error('Erro ao buscar rifa:', error)
      return { raffle: null, error: 'Erro interno do servidor' }
    }
  }

  static async updateRaffle(id: string, updates: UpdateRaffleData): Promise<{ raffle: Raffle | null; error: string | null }> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (updates.title) updateData.title = updates.title
      if (updates.prize) updateData.prize = updates.prize
      if (updates.prizeValue) updateData.prize_value = updates.prizeValue
      if (updates.ticketPrice) updateData.ticket_price = updates.ticketPrice
      if (updates.totalTickets) updateData.total_tickets = updates.totalTickets
      if (updates.drawDate) updateData.draw_date = updates.drawDate.toISOString()
      if (updates.category) updateData.category = updates.category
      if (updates.status) updateData.status = updates.status
      if (updates.soldTickets !== undefined) updateData.sold_tickets = updates.soldTickets
      if (updates.revenue !== undefined) updateData.revenue = updates.revenue
      if (updates.institutionName) updateData.institution_name = updates.institutionName
      if (updates.institutionLogo) updateData.institution_logo = updates.institutionLogo
      if (updates.description) updateData.description = updates.description
      if (updates.imageUrl) updateData.image_url = updates.imageUrl

      const { data, error } = await supabase
        .from('raffles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { raffle: null, error: error.message }
      }

      const raffle: Raffle = {
        id: data.id,
        title: data.title,
        prize: data.prize,
        prizeValue: data.prize_value,
        ticketPrice: data.ticket_price,
        totalTickets: data.total_tickets,
        soldTickets: data.sold_tickets,
        status: data.status,
        drawDate: new Date(data.draw_date),
        category: data.category,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        revenue: data.revenue,
        institutionName: data.institution_name,
        institutionLogo: data.institution_logo,
        description: data.description,
        imageUrl: data.image_url,
        createdBy: data.created_by,
      }

      return { raffle, error: null }
    } catch (error) {
      console.error('Erro ao atualizar rifa:', error)
      return { raffle: null, error: 'Erro interno do servidor' }
    }
  }

  static async deleteRaffle(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Primeiro, deletar todos os tickets da rifa
      const { error: ticketsError } = await supabase
        .from('tickets')
        .delete()
        .eq('raffle_id', id)

      if (ticketsError) {
        return { success: false, error: ticketsError.message }
      }

      // Depois, deletar a rifa
      const { error } = await supabase
        .from('raffles')
        .delete()
        .eq('id', id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erro ao deletar rifa:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  // Métodos de relatórios
  static async getRevenueMetrics(): Promise<{
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    error: string | null;
  }> {
    try {
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      // Receita total
      const { data: totalData, error: totalError } = await supabase
        .from('raffles')
        .select('revenue')

      if (totalError) {
        return { total: 0, thisMonth: 0, lastMonth: 0, growth: 0, error: totalError.message }
      }

      const total = totalData.reduce((sum, raffle) => sum + (raffle.revenue || 0), 0)

      // Receita deste mês
      const { data: thisMonthData, error: thisMonthError } = await supabase
        .from('raffles')
        .select('revenue')
        .gte('created_at', thisMonthStart.toISOString())

      if (thisMonthError) {
        return { total, thisMonth: 0, lastMonth: 0, growth: 0, error: thisMonthError.message }
      }

      const thisMonth = thisMonthData.reduce((sum, raffle) => sum + (raffle.revenue || 0), 0)

      // Receita do mês passado
      const { data: lastMonthData, error: lastMonthError } = await supabase
        .from('raffles')
        .select('revenue')
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString())

      if (lastMonthError) {
        return { total, thisMonth, lastMonth: 0, growth: 0, error: lastMonthError.message }
      }

      const lastMonth = lastMonthData.reduce((sum, raffle) => sum + (raffle.revenue || 0), 0)
      const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

      return { total, thisMonth, lastMonth, growth, error: null }
    } catch (error) {
      console.error('Erro ao buscar métricas de receita:', error)
      return { total: 0, thisMonth: 0, lastMonth: 0, growth: 0, error: 'Erro interno do servidor' }
    }
  }

  static async getSalesData(): Promise<{
    data: Array<{ month: string; revenue: number; tickets: number; raffles: number }>;
    error: string | null;
  }> {
    try {
      const now = new Date()
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

      const { data: rafflesData, error } = await supabase
        .from('raffles')
        .select('revenue, sold_tickets, created_at')
        .gte('created_at', sixMonthsAgo.toISOString())

      if (error) {
        return { data: [], error: error.message }
      }

      // Agrupar por mês
      const monthlyData: { [key: string]: { revenue: number; tickets: number; raffles: number } } = {}
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

      rafflesData.forEach(raffle => {
        const date = new Date(raffle.created_at)
        const monthKey = months[date.getMonth()]
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, tickets: 0, raffles: 0 }
        }
        
        monthlyData[monthKey].revenue += raffle.revenue || 0
        monthlyData[monthKey].tickets += raffle.sold_tickets || 0
        monthlyData[monthKey].raffles += 1
      })

      // Converter para array
      const data = Object.entries(monthlyData).map(([month, stats]) => ({
        month,
        ...stats
      }))

      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar dados de vendas:', error)
      return { data: [], error: 'Erro interno do servidor' }
    }
  }

  static async getTopRaffles(): Promise<{
    raffles: Array<{
      id: string;
      title: string;
      revenue: number;
      ticketsSold: number;
      totalTickets: number;
      participants: number;
      status: string;
    }>;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('id, title, revenue, sold_tickets, total_tickets, status')
        .order('revenue', { ascending: false })
        .limit(10)

      if (error) {
        return { raffles: [], error: error.message }
      }

      // Para cada rifa, contar participantes únicos
      const rafflesWithParticipants = await Promise.all(
        data.map(async (raffle) => {
          const { data: purchasesData } = await supabase
            .from('purchases')
            .select('user_id')
            .eq('raffle_id', raffle.id)

          const uniqueParticipants = new Set(purchasesData?.map(p => p.user_id) || []).size

          return {
            id: raffle.id,
            title: raffle.title,
            revenue: raffle.revenue || 0,
            ticketsSold: raffle.sold_tickets || 0,
            totalTickets: raffle.total_tickets,
            participants: uniqueParticipants,
            status: raffle.status
          }
        })
      )

      return { raffles: rafflesWithParticipants, error: null }
    } catch (error) {
      console.error('Erro ao buscar top rifas:', error)
      return { raffles: [], error: 'Erro interno do servidor' }
    }
  }

  static async getPublicRaffles(): Promise<{ raffles: Raffle[]; error: string | null }> {
    return this.getRaffles({ status: 'active' })
  }
}