import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          role: 'admin' | 'client'
          created_at: string
          updated_at: string
          avatar_url?: string
          city?: string
          state?: string
          status: 'active' | 'inactive' | 'blocked'
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          role?: 'admin' | 'client'
          created_at?: string
          updated_at?: string
          avatar_url?: string
          city?: string
          state?: string
          status?: 'active' | 'inactive' | 'blocked'
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          role?: 'admin' | 'client'
          created_at?: string
          updated_at?: string
          avatar_url?: string
          city?: string
          state?: string
          status?: 'active' | 'inactive' | 'blocked'
        }
      }
      raffles: {
        Row: {
          id: string
          title: string
          prize: string
          prize_value: number
          ticket_price: number
          total_tickets: number
          sold_tickets: number
          status: 'active' | 'paused' | 'finished' | 'draft'
          draw_date: string
          category: string
          created_at: string
          updated_at: string
          revenue: number
          institution_name?: string
          institution_logo?: string
          description?: string
          image_url?: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          prize: string
          prize_value: number
          ticket_price: number
          total_tickets: number
          sold_tickets?: number
          status?: 'active' | 'paused' | 'finished' | 'draft'
          draw_date: string
          category: string
          created_at?: string
          updated_at?: string
          revenue?: number
          institution_name?: string
          institution_logo?: string
          description?: string
          image_url?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          prize?: string
          prize_value?: number
          ticket_price?: number
          total_tickets?: number
          sold_tickets?: number
          status?: 'active' | 'paused' | 'finished' | 'draft'
          draw_date?: string
          category?: string
          created_at?: string
          updated_at?: string
          revenue?: number
          institution_name?: string
          institution_logo?: string
          description?: string
          image_url?: string
          created_by?: string
        }
      }
      tickets: {
        Row: {
          id: string
          raffle_id: string
          user_id: string
          number: number
          status: 'available' | 'reserved' | 'sold' | 'winner'
          purchase_date?: string
          reserved_until?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          raffle_id: string
          user_id?: string
          number: number
          status?: 'available' | 'reserved' | 'sold' | 'winner'
          purchase_date?: string
          reserved_until?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          raffle_id?: string
          user_id?: string
          number?: number
          status?: 'available' | 'reserved' | 'sold' | 'winner'
          purchase_date?: string
          reserved_until?: string
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          raffle_id: string
          ticket_numbers: number[]
          total_amount: number
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: 'pix' | 'credit_card' | 'debit_card'
          payment_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          raffle_id: string
          ticket_numbers: number[]
          total_amount: number
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: 'pix' | 'credit_card' | 'debit_card'
          payment_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          raffle_id?: string
          ticket_numbers?: number[]
          total_amount?: number
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: 'pix' | 'credit_card' | 'debit_card'
          payment_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id?: string
          raffle_id?: string
          subject: string
          content: string
          message_type: 'individual' | 'broadcast' | 'raffle_participants'
          status: 'draft' | 'sent' | 'delivered' | 'read'
          scheduled_for?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id?: string
          raffle_id?: string
          subject: string
          content: string
          message_type: 'individual' | 'broadcast' | 'raffle_participants'
          status?: 'draft' | 'sent' | 'delivered' | 'read'
          scheduled_for?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          raffle_id?: string
          subject?: string
          content?: string
          message_type?: 'individual' | 'broadcast' | 'raffle_participants'
          status?: 'draft' | 'sent' | 'delivered' | 'read'
          scheduled_for?: string
          created_at?: string
          updated_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          description: string
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          description: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          description?: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          user_id: string
          raffle_id?: string
          content: string
          rating: number
          type: 'winner' | 'participant' | 'general'
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          raffle_id?: string
          content: string
          rating: number
          type: 'winner' | 'participant' | 'general'
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          raffle_id?: string
          content?: string
          rating?: number
          type?: 'winner' | 'participant' | 'general'
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}