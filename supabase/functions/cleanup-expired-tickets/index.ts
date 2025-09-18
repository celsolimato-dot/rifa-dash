import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Iniciando limpeza de tickets expirados...');

    const now = new Date().toISOString();

    // Buscar tickets reservados que expiraram
    const { data: expiredTickets, error: selectError } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'reserved')
      .lt('reserved_until', now);

    if (selectError) {
      console.error('Erro ao buscar tickets expirados:', selectError);
      throw selectError;
    }

    console.log(`Encontrados ${expiredTickets?.length || 0} tickets expirados`);

    if (expiredTickets && expiredTickets.length > 0) {
      // Deletar tickets expirados
      const { error: deleteError } = await supabase
        .from('tickets')
        .delete()
        .eq('status', 'reserved')
        .lt('reserved_until', now);

      if (deleteError) {
        console.error('Erro ao deletar tickets expirados:', deleteError);
        throw deleteError;
      }

      console.log(`${expiredTickets.length} tickets expirados removidos com sucesso`);

      // Log dos tickets removidos por rifa
      const ticketsByRaffle = expiredTickets.reduce((acc, ticket) => {
        if (!acc[ticket.raffle_id]) {
          acc[ticket.raffle_id] = [];
        }
        acc[ticket.raffle_id].push(ticket.number);
        return acc;
      }, {} as Record<string, number[]>);

      Object.entries(ticketsByRaffle).forEach(([raffleId, numbers]) => {
        console.log(`Rifa ${raffleId}: ${numbers.length} números liberados (${numbers.join(', ')})`);
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Limpeza concluída. ${expiredTickets?.length || 0} tickets expirados removidos.`,
      expiredTicketsCount: expiredTickets?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na limpeza de tickets expirados:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});