import { supabase } from '@/lib/supabase';

export interface Transaction {
  id: number;
  type: 'participacao' | 'premio' | 'reembolso';
  title: string;
  description: string;
  date: string;
  amount: number;
  status: 'concluida' | 'pendente' | 'recebido' | 'cancelada';
  raffleId: number;
}

export interface Participation {
  id: number;
  raffleTitle: string;
  numbers: number[];
  purchaseDate: string;
  drawDate: string;
  amount: number;
  status: 'ativa' | 'finalizada' | 'cancelada';
  result?: 'ganhou' | 'perdeu';
  winnerNumber?: number;
}

export interface Prize {
  id: number;
  raffleTitle: string;
  prizeDescription: string;
  winDate: string;
  amount: number;
  status: 'pendente' | 'recebido';
  winnerNumber: number;
  userNumbers: number[];
}

export class ClientHistoryService {
  static async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      // Buscar participações (transações de compra)
      const { data: participations, error: participationsError } = await supabase
        .from('participacoes')
        .select(`
          id,
          numeros_escolhidos,
          created_at,
          rifas (
            id,
            titulo,
            preco_numero
          )
        `)
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false });

      if (participationsError) throw participationsError;

      // Buscar prêmios ganhos
      const { data: prizes, error: prizesError } = await supabase
        .from('participacoes')
        .select(`
          id,
          numeros_escolhidos,
          rifas (
            id,
            titulo,
            data_sorteio,
            numero_vencedor,
            premio_valor
          )
        `)
        .eq('usuario_id', userId)
        .not('rifas.numero_vencedor', 'is', null);

      if (prizesError) throw prizesError;

      const transactions: Transaction[] = [];

      // Processar participações
      participations?.forEach(participation => {
        const raffle = participation.rifas;
        const numbersCount = participation.numeros_escolhidos?.length || 0;
        const amount = numbersCount * raffle.preco_numero;

        transactions.push({
          id: participation.id,
          type: 'participacao',
          title: `Participação - ${raffle.titulo}`,
          description: `Compra de ${numbersCount} número${numbersCount > 1 ? 's' : ''} (${participation.numeros_escolhidos?.join(', ')})`,
          date: participation.created_at,
          amount: -amount,
          status: 'concluida',
          raffleId: raffle.id
        });
      });

      // Processar prêmios
      prizes?.forEach(prize => {
        const raffle = prize.rifas;
        const userNumbers = prize.numeros_escolhidos || [];
        const won = raffle.numero_vencedor && userNumbers.includes(raffle.numero_vencedor);

        if (won) {
          transactions.push({
            id: prize.id + 10000, // Offset para evitar conflito de IDs
            type: 'premio',
            title: `Prêmio Ganho - ${raffle.titulo}`,
            description: `Número sorteado: ${raffle.numero_vencedor}`,
            date: raffle.data_sorteio,
            amount: raffle.premio_valor || 0,
            status: 'recebido',
            raffleId: raffle.id
          });
        }
      });

      // Ordenar por data (mais recente primeiro)
      return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
  }

  static async getParticipations(userId: string): Promise<Participation[]> {
    try {
      const { data: participations, error } = await supabase
        .from('participacoes')
        .select(`
          id,
          numeros_escolhidos,
          created_at,
          rifas (
            id,
            titulo,
            data_sorteio,
            preco_numero,
            status,
            numero_vencedor
          )
        `)
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return participations?.map(participation => {
        const raffle = participation.rifas;
        const userNumbers = participation.numeros_escolhidos || [];
        const amount = userNumbers.length * raffle.preco_numero;
        
        let result: 'ganhou' | 'perdeu' | undefined;
        if (raffle.status === 'finalizada' && raffle.numero_vencedor) {
          result = userNumbers.includes(raffle.numero_vencedor) ? 'ganhou' : 'perdeu';
        }

        return {
          id: participation.id,
          raffleTitle: raffle.titulo,
          numbers: userNumbers,
          purchaseDate: participation.created_at,
          drawDate: raffle.data_sorteio,
          amount,
          status: raffle.status as 'ativa' | 'finalizada' | 'cancelada',
          result,
          winnerNumber: raffle.numero_vencedor
        };
      }) || [];
    } catch (error) {
      console.error('Erro ao buscar participações:', error);
      return [];
    }
  }

  static async getPrizes(userId: string): Promise<Prize[]> {
    try {
      const { data: prizes, error } = await supabase
        .from('participacoes')
        .select(`
          id,
          numeros_escolhidos,
          rifas (
            id,
            titulo,
            descricao,
            data_sorteio,
            numero_vencedor,
            premio_valor
          )
        `)
        .eq('usuario_id', userId)
        .not('rifas.numero_vencedor', 'is', null);

      if (error) throw error;

      const wonPrizes: Prize[] = [];

      prizes?.forEach(prize => {
        const raffle = prize.rifas;
        const userNumbers = prize.numeros_escolhidos || [];
        const won = raffle.numero_vencedor && userNumbers.includes(raffle.numero_vencedor);

        if (won) {
          wonPrizes.push({
            id: prize.id,
            raffleTitle: raffle.titulo,
            prizeDescription: raffle.descricao,
            winDate: raffle.data_sorteio,
            amount: raffle.premio_valor || 0,
            status: 'recebido', // Por simplicidade, assumindo que todos foram recebidos
            winnerNumber: raffle.numero_vencedor,
            userNumbers
          });
        }
      });

      return wonPrizes.sort((a, b) => new Date(b.winDate).getTime() - new Date(a.winDate).getTime());
    } catch (error) {
      console.error('Erro ao buscar prêmios:', error);
      return [];
    }
  }
}