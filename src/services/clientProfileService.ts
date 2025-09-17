export interface UserStats {
  totalSpent: number;
  totalTickets: number;
  rafflesParticipated: number;
  wins: number;
  totalParticipacoes?: number;
  premiosGanhos?: number;
  totalInvestido?: number;
  economiaTotal?: number;
  dataRegistro?: string;
  ultimoLogin?: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  earned: boolean;
  date: string | null;
  icon: string;
}

// Re-export the real client profile service
export { RealClientProfileService as ClientProfileService } from './realClientProfileService';