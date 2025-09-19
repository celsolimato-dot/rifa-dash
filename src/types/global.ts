export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  phone?: string;
  avatar_url?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Raffle {
  id: string;
  title: string;
  prize: string;
  prize_value: number;
  ticket_price: number;
  total_tickets: number;
  sold_tickets: number;
  status: string;
  draw_date: string;
  category: string;
  created_at: string;
  updated_at: string;
  revenue: number;
  institution_name?: string;
  institution_logo?: string;
  description?: string;
  image_url?: string;
  created_by: string;
  // Winner fields for completed raffles
  winner_name?: string;
  winner_email?: string;
  winning_number?: string;
  draw_completed_at?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  registration_date: string;
  total_tickets: number;
  total_spent: number;
  raffles_participated: number;
  wins: number;
  status: "active" | "inactive" | "blocked";
  avatar?: string;
  last_activity: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  earned: boolean;
  date: string | null;
  icon: string;
}