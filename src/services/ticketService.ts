import { supabase } from '../lib/supabase'

export interface Ticket {
  id: string
  raffleId: string
  userId?: string
  number: number
  status: 'available' | 'reserved' | 'sold' | 'winner'
  purchaseDate?: Date
  reservedUntil?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Purchase {
  id: string
  userId: string
  raffleId: string
  ticketNumbers: number[]
  totalAmount: number
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: 'pix' | 'credit_card' | 'debit_card'
  paymentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ReserveTicketsData {
  raffleId: string
  userId: string
  ticketNumbers: number[]
  reservationMinutes?: number
}

export interface PurchaseTicketsData {
  raffleId: string
  userId: string
  ticketNumbers: number[]
  paymentMethod: 'pix' | 'credit_card' | 'debit_card'
  paymentId?: string
}

export class TicketService {
  static async getTicketsByRaffle(raffleId: string): Promise<{ tickets: Ticket[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('raffle_id', raffleId)
        .order('number', { ascending: true })

      if (error) {
        return { tickets: [], error: error.message }
      }

      const tickets: Ticket[] = data.map(item => ({
        id: item.id,
        raffleId: item.raffle_id,
        userId: item.user_id,
        number: item.number,
        status: item.status,
        purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
        reservedUntil: item.reserved_until ? new Date(item.reserved_until) : undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }))

      return { tickets, error: null }
    } catch (error) {
      console.error('Erro ao buscar tickets:', error)
      return { tickets: [], error: 'Erro interno do servidor' }
    }
  }

  static async getAvailableTickets(raffleId: string): Promise<{ tickets: Ticket[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('raffle_id', raffleId)
        .eq('status', 'available')
        .order('number', { ascending: true })

      if (error) {
        return { tickets: [], error: error.message }
      }

      const tickets: Ticket[] = data.map(item => ({
        id: item.id,
        raffleId: item.raffle_id,
        userId: item.user_id,
        number: item.number,
        status: item.status,
        purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
        reservedUntil: item.reserved_until ? new Date(item.reserved_until) : undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }))

      return { tickets, error: null }
    } catch (error) {
      console.error('Erro ao buscar tickets disponíveis:', error)
      return { tickets: [], error: 'Erro interno do servidor' }
    }
  }

  static async reserveTickets(data: ReserveTicketsData): Promise<{ success: boolean; error: string | null }> {
    try {
      const reservationMinutes = data.reservationMinutes || 5
      const reservedUntil = new Date()
      reservedUntil.setMinutes(reservedUntil.getMinutes() + reservationMinutes)

      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'reserved',
          user_id: data.userId,
          reserved_until: reservedUntil.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('raffle_id', data.raffleId)
        .in('number', data.ticketNumbers)
        .eq('status', 'available')

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erro ao reservar tickets:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  static async purchaseTickets(data: PurchaseTicketsData): Promise<{ purchase: Purchase | null; error: string | null }> {
    try {
      // Buscar informações da rifa para calcular o valor total
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles')
        .select('ticket_price')
        .eq('id', data.raffleId)
        .single()

      if (raffleError) {
        return { purchase: null, error: 'Rifa não encontrada' }
      }

      const totalAmount = raffleData.ticket_price * data.ticketNumbers.length

      // Criar registro de compra
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: data.userId,
          raffle_id: data.raffleId,
          ticket_numbers: data.ticketNumbers,
          total_amount: totalAmount,
          payment_method: data.paymentMethod,
          payment_id: data.paymentId,
          payment_status: 'pending',
        })
        .select()
        .single()

      if (purchaseError) {
        return { purchase: null, error: purchaseError.message }
      }

      // Atualizar status dos tickets para vendidos
      const { error: ticketsError } = await supabase
        .from('tickets')
        .update({
          status: 'sold',
          user_id: data.userId,
          purchase_date: new Date().toISOString(),
          reserved_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq('raffle_id', data.raffleId)
        .in('number', data.ticketNumbers)

      if (ticketsError) {
        // Se falhar ao atualizar tickets, deletar a compra
        await supabase.from('purchases').delete().eq('id', purchaseData.id)
        return { purchase: null, error: 'Erro ao processar tickets' }
      }

      // Atualizar estatísticas da rifa
      const { error: raffleUpdateError } = await supabase
        .from('raffles')
        .update({
          sold_tickets: supabase.raw('sold_tickets + ?', [data.ticketNumbers.length]),
          revenue: supabase.raw('revenue + ?', [totalAmount]),
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.raffleId)

      if (raffleUpdateError) {
        console.error('Erro ao atualizar estatísticas da rifa:', raffleUpdateError)
      }

      const purchase: Purchase = {
        id: purchaseData.id,
        userId: purchaseData.user_id,
        raffleId: purchaseData.raffle_id,
        ticketNumbers: purchaseData.ticket_numbers,
        totalAmount: purchaseData.total_amount,
        paymentStatus: purchaseData.payment_status,
        paymentMethod: purchaseData.payment_method,
        paymentId: purchaseData.payment_id,
        createdAt: new Date(purchaseData.created_at),
        updatedAt: new Date(purchaseData.updated_at),
      }

      return { purchase, error: null }
    } catch (error) {
      console.error('Erro ao comprar tickets:', error)
      return { purchase: null, error: 'Erro interno do servidor' }
    }
  }

  static async updatePaymentStatus(
    purchaseId: string, 
    status: 'pending' | 'paid' | 'failed' | 'refunded'
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('purchases')
        .update({
          payment_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', purchaseId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  static async releaseExpiredReservations(): Promise<{ success: boolean; error: string | null }> {
    try {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'available',
          user_id: null,
          reserved_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq('status', 'reserved')
        .lt('reserved_until', now)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erro ao liberar reservas expiradas:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  static async getUserTickets(userId: string): Promise<{ tickets: Ticket[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          raffles (
            title,
            prize,
            draw_date,
            status
          )
        `)
        .eq('user_id', userId)
        .in('status', ['sold', 'winner'])
        .order('created_at', { ascending: false })

      if (error) {
        return { tickets: [], error: error.message }
      }

      const tickets: Ticket[] = data.map(item => ({
        id: item.id,
        raffleId: item.raffle_id,
        userId: item.user_id,
        number: item.number,
        status: item.status,
        purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
        reservedUntil: item.reserved_until ? new Date(item.reserved_until) : undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }))

      return { tickets, error: null }
    } catch (error) {
      console.error('Erro ao buscar tickets do usuário:', error)
      return { tickets: [], error: 'Erro interno do servidor' }
    }
  }

  static async getUserPurchases(userId: string): Promise<{ purchases: Purchase[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          raffles (
            title,
            prize,
            draw_date,
            status
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { purchases: [], error: error.message }
      }

      const purchases: Purchase[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        raffleId: item.raffle_id,
        ticketNumbers: item.ticket_numbers,
        totalAmount: item.total_amount,
        paymentStatus: item.payment_status,
        paymentMethod: item.payment_method,
        paymentId: item.payment_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }))

      return { purchases, error: null }
    } catch (error) {
      console.error('Erro ao buscar compras do usuário:', error)
      return { purchases: [], error: 'Erro interno do servidor' }
    }
  }
}