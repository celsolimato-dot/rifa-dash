import { Raffle } from '../services/raffleService';
import { Testimonial } from '../services/testimonialService';

// Dados mock para rifas
export const mockRaffles: Raffle[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max',
    prize: 'iPhone 15 Pro Max 256GB',
    prizeValue: 8999,
    ticketPrice: 10,
    totalTickets: 1000,
    soldTickets: 750,
    status: 'active',
    drawDate: new Date('2024-12-31'),
    category: 'Eletrônicos',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    revenue: 7500,
    institutionName: 'Rifa Demo',
    description: 'Concorra a um iPhone 15 Pro Max novinho em folha!',
    imageUrl: '/placeholder.svg',
    createdBy: 'admin'
  },
  {
    id: '2',
    title: 'Notebook Gamer',
    prize: 'Notebook Gamer RTX 4060',
    prizeValue: 4500,
    ticketPrice: 15,
    totalTickets: 500,
    soldTickets: 320,
    status: 'active',
    drawDate: new Date('2024-12-25'),
    category: 'Eletrônicos',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20'),
    revenue: 4800,
    institutionName: 'Rifa Demo',
    description: 'Notebook gamer para você jogar seus games favoritos!',
    imageUrl: '/placeholder.svg',
    createdBy: 'admin'
  },
  {
    id: '3',
    title: 'Vale Compras R$ 1.000',
    prize: 'Vale Compras Shopping',
    prizeValue: 1000,
    ticketPrice: 5,
    totalTickets: 300,
    soldTickets: 280,
    status: 'active',
    drawDate: new Date('2024-12-20'),
    category: 'Vale Compras',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    revenue: 1400,
    institutionName: 'Rifa Demo',
    description: 'Vale compras para você usar onde quiser!',
    imageUrl: '/placeholder.svg',
    createdBy: 'admin'
  }
];

// Dados mock para depoimentos
export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Maria Silva',
    prize: 'iPhone 14 Pro',
    prizeValue: 'R$ 7.999',
    date: '15/01/2024',
    image: '/placeholder.svg',
    raffleTitle: 'Rifa do iPhone',
    winningNumber: '0157',
    type: 'winner',
    testimonial: 'Não acreditei quando vi meu número! Muito obrigada pela organização impecável!',
    userId: 'user1',
    raffleId: 'raffle1',
    rating: 5,
    status: 'approved',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'João Santos',
    prize: 'Notebook Gamer',
    prizeValue: 'R$ 4.500',
    date: '10/01/2024',
    image: '/placeholder.svg',
    raffleTitle: 'Rifa do Notebook',
    winningNumber: '0089',
    type: 'winner',
    testimonial: 'Sempre participei de rifas mas nunca ganhei nada. Dessa vez deu certo! Recomendo!',
    userId: 'user2',
    raffleId: 'raffle2',
    rating: 5,
    status: 'approved',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    name: 'Ana Costa',
    prize: 'Vale Compras R$ 1.000',
    prizeValue: 'R$ 1.000',
    date: '05/01/2024',
    image: '/placeholder.svg',
    raffleTitle: 'Rifa Vale Compras',
    winningNumber: '0234',
    type: 'winner',
    testimonial: 'Que alegria! Já usei o vale para comprar presentes para a família. Muito obrigada!',
    userId: 'user3',
    raffleId: 'raffle3',
    rating: 5,
    status: 'approved',
    createdAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-01-05T16:45:00Z'
  }
];

// Função para simular delay de rede
export const simulateNetworkDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};