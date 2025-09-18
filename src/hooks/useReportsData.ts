import { useState, useEffect } from 'react';
import { RaffleService } from '@/services/raffleService';

interface ReportsData {
  revenueMetrics: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  salesData: {
    month: string;
    revenue: number;
    tickets: number;
    raffles: number;
  }[];
  topRaffles: {
    id: string;
    title: string;
    revenue: number;
    ticketsSold: number;
    totalTickets: number;
    participants: number;
    status: string;
  }[];
  ticketsMetrics: {
    total: number;
    growth: number;
  };
  participantsMetrics: {
    total: number;
    growth: number;
  };
  conversionRate: number;
  recentActivity: {
    action: string;
    item: string;
    time: string;
    type: string;
  }[];
  revenueDistribution: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  isLoading: boolean;
  error: string | null;
}

export const useReportsData = () => {
  const [data, setData] = useState<ReportsData>({
    revenueMetrics: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    salesData: [],
    topRaffles: [],
    ticketsMetrics: {
      total: 0,
      growth: 0
    },
    participantsMetrics: {
      total: 0,
      growth: 0
    },
    conversionRate: 0,
    recentActivity: [],
    revenueDistribution: [],
    isLoading: true,
    error: null
  });

  const loadData = async () => {
    console.log('🔄 Carregando dados dos relatórios...');
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('📊 Buscando métricas de receita...');
      const revenueMetrics = await RaffleService.getRevenueMetrics();
      console.log('✅ Métricas de receita:', revenueMetrics);

      console.log('📈 Buscando dados de vendas...');
      const salesResponse = await RaffleService.getSalesData();
      console.log('✅ Dados de vendas:', salesResponse);

      console.log('🏆 Buscando top rifas...');
      const topRaffles = await RaffleService.getTopRaffles();
      console.log('✅ Top rifas:', topRaffles);

      console.log('🎫 Buscando métricas de bilhetes...');
      const ticketsMetrics = await RaffleService.getTicketsMetrics();
      console.log('✅ Métricas de bilhetes:', ticketsMetrics);

      console.log('👥 Buscando métricas de participantes...');
      const participantsMetrics = await RaffleService.getParticipantsMetrics();
      console.log('✅ Métricas de participantes:', participantsMetrics);

      console.log('🎯 Buscando taxa de conversão...');
      const conversionData = await RaffleService.getConversionRate();
      console.log('✅ Taxa de conversão:', conversionData);

      console.log('⚡ Buscando atividades recentes...');
      const recentActivity = await RaffleService.getRecentActivity();
      console.log('✅ Atividades recentes:', recentActivity);

      console.log('💰 Buscando distribuição de receita...');
      const revenueDistribution = await RaffleService.getRevenueDistribution();
      console.log('✅ Distribuição de receita:', revenueDistribution);

      setData({
        revenueMetrics: !revenueMetrics || revenueMetrics.error ? { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 } : {
          total: revenueMetrics.total,
          thisMonth: revenueMetrics.thisMonth,
          lastMonth: revenueMetrics.lastMonth,
          growth: revenueMetrics.growth
        },
        salesData: !salesResponse || salesResponse.error ? [] : (salesResponse.data || []),
        topRaffles: topRaffles || [],
        ticketsMetrics: !ticketsMetrics || ticketsMetrics.error ? { total: 0, growth: 0 } : {
          total: ticketsMetrics.total,
          growth: ticketsMetrics.growth
        },
        participantsMetrics: !participantsMetrics || participantsMetrics.error ? { total: 0, growth: 0 } : {
          total: participantsMetrics.total,
          growth: participantsMetrics.growth
        },
        conversionRate: !conversionData || conversionData.error ? 0 : (conversionData.conversionRate || 0),
        recentActivity: recentActivity || [],
        revenueDistribution: revenueDistribution || [],
        isLoading: false,
        error: null
      });

      console.log('✅ Todos os dados carregados com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao carregar dados dos relatórios:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao carregar dados dos relatórios'
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, refetch: loadData };
};