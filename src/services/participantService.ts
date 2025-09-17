// Re-export the real participant service
export { RealParticipantService as ParticipantService } from './realParticipantService';
export type { User as Participant } from './realParticipantService';

// Temporary interface for compatibility
export interface ParticipantRaffle {
  id: string;
  raffle_name: string;
  ticket_numbers: string[];
  purchase_date: string;
  amount: number;
  status: "active" | "winner" | "loser";
}