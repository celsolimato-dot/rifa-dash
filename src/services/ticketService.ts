import { supabase } from '@/integrations/supabase/client'

export interface Ticket {
  id: string
  raffleId: string
  number: number
  status: 'available' | 'reserved' | 'sold' | 'winner'
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod?: string
  paymentId?: string
  purchaseDate?: Date
  createdAt: Date
  updatedAt: Date
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
        number: item.number,
        status: item.status as 'available' | 'reserved' | 'sold' | 'winner',
        buyerName: item.buyer_name,
        buyerEmail: item.buyer_email,
        buyerPhone: item.buyer_phone,
        paymentStatus: item.payment_status as 'pending' | 'paid' | 'failed' | 'refunded',
        paymentMethod: item.payment_method,
        paymentId: item.payment_id,
        purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
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
        number: item.number,
        status: item.status as 'available' | 'reserved' | 'sold' | 'winner',
        buyerName: item.buyer_name,
        buyerEmail: item.buyer_email,
        buyerPhone: item.buyer_phone,
        paymentStatus: item.payment_status as 'pending' | 'paid' | 'failed' | 'refunded',
        paymentMethod: item.payment_method,
        paymentId: item.payment_id,
        purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }))

      return { tickets, error: null }
    } catch (error) {
      console.error('Erro ao buscar tickets disponíveis:', error)
      return { tickets: [], error: 'Erro interno do servidor' }
    }
  }

  static async getUserTickets(userEmail: string): Promise<{ tickets: Ticket[]; error: string | null }> {
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
        .eq('buyer_email', userEmail)
        .order('created_at', { ascending: false })

      if (error) {
        return { tickets: [], error: error.message }
      }

      const tickets: Ticket[] = data.map(item => ({
        id: item.id,
        raffleId: item.raffle_id,
        number: item.number,
        status: item.status as 'available' | 'reserved' | 'sold' | 'winner',
        buyerName: item.buyer_name,
        buyerEmail: item.buyer_email,
        buyerPhone: item.buyer_phone,
        paymentStatus: item.payment_status as 'pending' | 'paid' | 'failed' | 'refunded',
        paymentMethod: item.payment_method,
        paymentId: item.payment_id,
        purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }))

      return { tickets, error: null }
    } catch (error) {
      console.error('Erro ao buscar tickets do usuário:', error)
      return { tickets: [], error: 'Erro interno do servidor' }
    }
  }

  static async updatePaymentStatus(
    ticketId: string, 
    status: 'pending' | 'paid' | 'failed' | 'refunded'
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          payment_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }
}