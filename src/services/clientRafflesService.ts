import { supabase } from '@/lib/supabase';

export interface ClientRaffle {
  id: number;
  title: string;
  description: string;
  image: string;
  numbers: number[];
  drawDate: string;
  totalNumbers: number;
  soldNumbers: number;
  ticketPrice: number;
  status: 'ativa' | 'finalizada' | 'cancelada';
  category: string;
  winnerNumber?: number;
  result?: 'ganhou' | 'perdeu';
}

export class ClientRafflesService {
  static async getActiveRaffles(userId: string): Promise<ClientRaffle[]> {
    try {
      // Buscar rifas ativas onde o usuário tem participação
      const { data: participations, error: participationsError } = await supabase
        .from('participacoes')
        .select(`
          numeros_escolhidos,
          rifas (
            id,
            titulo,
            descricao,
            imagem_url,
            data_sorteio,
            total_numeros,
            preco_numero,
            status,
            categoria
          )
        `)
        .eq('usuario_id', userId)
        .eq('rifas.status', 'ativa');

      if (participationsError) throw participationsError;

      // Buscar números vendidos para cada rifa
      const raffleIds = participations?.map(p => p.rifas.id) || [];
      const { data: soldNumbers, error: soldError } = await supabase
        .from('participacoes')
        .select('rifa_id, numeros_escolhidos')
        .in('rifa_id', raffleIds);

      if (soldError) throw soldError;

      // Processar dados
      const activeRaffles: ClientRaffle[] = participations?.map(participation => {
        const raffle = participation.rifas;
        const soldCount = soldNumbers
          ?.filter(s => s.rifa_id === raffle.id)
          .reduce((acc, s) => acc + (s.numeros_escolhidos?.length || 0), 0) || 0;

        return {
          id: raffle.id,
          title: raffle.titulo,
          description: raffle.descricao,
          image: raffle.imagem_url || '/api/placeholder/300/200',
          numbers: participation.numeros_escolhidos || [],
          drawDate: raffle.data_sorteio,
          totalNumbers: raffle.total_numeros,
          soldNumbers: soldCount,
          ticketPrice: raffle.preco_numero,
          status: 'ativa',
          category: raffle.categoria || 'Geral'
        };
      }) || [];

      return activeRaffles;
    } catch (error) {
      console.error('Erro ao buscar rifas ativas:', error);
      return [];
    }
  }

  static async getFinishedRaffles(userId: string): Promise<ClientRaffle[]> {
    try {
      // Buscar rifas finalizadas onde o usuário participou
      const { data: participations, error: participationsError } = await supabase
        .from('participacoes')
        .select(`
          numeros_escolhidos,
          rifas (
            id,
            titulo,
            descricao,
            imagem_url,
            data_sorteio,
            total_numeros,
            preco_numero,
            status,
            categoria,
            numero_vencedor
          )
        `)
        .eq('usuario_id', userId)
        .in('rifas.status', ['finalizada', 'cancelada']);

      if (participationsError) throw participationsError;

      // Buscar números vendidos para cada rifa
      const raffleIds = participations?.map(p => p.rifas.id) || [];
      const { data: soldNumbers, error: soldError } = await supabase
        .from('participacoes')
        .select('rifa_id, numeros_escolhidos')
        .in('rifa_id', raffleIds);

      if (soldError) throw soldError;

      // Processar dados
      const finishedRaffles: ClientRaffle[] = participations?.map(participation => {
        const raffle = participation.rifas;
        const userNumbers = participation.numeros_escolhidos || [];
        const soldCount = soldNumbers
          ?.filter(s => s.rifa_id === raffle.id)
          .reduce((acc, s) => acc + (s.numeros_escolhidos?.length || 0), 0) || 0;

        // Verificar se ganhou
        const won = raffle.numero_vencedor && userNumbers.includes(raffle.numero_vencedor);

        return {
          id: raffle.id,
          title: raffle.titulo,
          description: raffle.descricao,
          image: raffle.imagem_url || '/api/placeholder/300/200',
          numbers: userNumbers,
          drawDate: raffle.data_sorteio,
          totalNumbers: raffle.total_numeros,
          soldNumbers: soldCount,
          ticketPrice: raffle.preco_numero,
          status: raffle.status as 'finalizada' | 'cancelada',
          category: raffle.categoria || 'Geral',
          winnerNumber: raffle.numero_vencedor,
          result: won ? 'ganhou' : 'perdeu'
        };
      }) || [];

      return finishedRaffles;
    } catch (error) {
      console.error('Erro ao buscar rifas finalizadas:', error);
      return [];
    }
  }

  static async getAllAvailableRaffles(): Promise<ClientRaffle[]> {
    try {
      // Buscar todas as rifas ativas disponíveis
      const { data: raffles, error: rafflesError } = await supabase
        .from('rifas')
        .select('*')
        .eq('status', 'ativa')
        .order('data_sorteio', { ascending: true });

      if (rafflesError) throw rafflesError;

      // Buscar números vendidos para cada rifa
      const raffleIds = raffles?.map(r => r.id) || [];
      const { data: soldNumbers, error: soldError } = await supabase
        .from('participacoes')
        .select('rifa_id, numeros_escolhidos')
        .in('rifa_id', raffleIds);

      if (soldError) throw soldError;

      // Processar dados
      const availableRaffles: ClientRaffle[] = raffles?.map(raffle => {
        const soldCount = soldNumbers
          ?.filter(s => s.rifa_id === raffle.id)
          .reduce((acc, s) => acc + (s.numeros_escolhidos?.length || 0), 0) || 0;

        return {
          id: raffle.id,
          title: raffle.titulo,
          description: raffle.descricao,
          image: raffle.imagem_url || '/api/placeholder/300/200',
          numbers: [], // Usuário ainda não participou
          drawDate: raffle.data_sorteio,
          totalNumbers: raffle.total_numeros,
          soldNumbers: soldCount,
          ticketPrice: raffle.preco_numero,
          status: 'ativa',
          category: raffle.categoria || 'Geral'
        };
      }) || [];

      return availableRaffles;
    } catch (error) {
      console.error('Erro ao buscar rifas disponíveis:', error);
      return [];
    }
  }
}