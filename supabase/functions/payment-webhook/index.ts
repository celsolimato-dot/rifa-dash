import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AbacatePayWebhook {
  event: string;
  data: {
    id: string;
    status: 'pending' | 'paid' | 'expired' | 'cancelled';
    amount: number;
    metadata: {
      externalId: string;
    };
    customer: {
      name: string;
      email: string;
      cellphone: string;
      taxId: string;
    };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const webhook: AbacatePayWebhook = await req.json();
    console.log('Webhook recebido:', webhook);

    // Verificar se é um evento de pagamento
    if (webhook.event !== 'pix.paid' && webhook.event !== 'pix.expired') {
      console.log('Evento ignorado:', webhook.event);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const { data: webhookData } = webhook;
    const externalId = webhookData.metadata?.externalId;

    if (!externalId) {
      console.error('External ID não encontrado no webhook');
      return new Response('External ID required', { status: 400, headers: corsHeaders });
    }

    // Extrair informações do external ID (formato: rifa_raffleId_timestamp)
    const [, raffleId, timestamp] = externalId.split('_');

    if (!raffleId) {
      console.error('Raffle ID não encontrado no external ID:', externalId);
      return new Response('Invalid external ID', { status: 400, headers: corsHeaders });
    }

    console.log(`Processando pagamento para rifa ${raffleId}, status: ${webhookData.status}`);

    if (webhook.event === 'pix.paid' && webhookData.status === 'paid') {
      // Pagamento confirmado - atualizar tickets pendentes
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('raffle_id', raffleId)
        .eq('buyer_email', webhookData.customer.email)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });

      if (ticketsError) {
        console.error('Erro ao buscar tickets:', ticketsError);
        return new Response('Error fetching tickets', { status: 500, headers: corsHeaders });
      }

      if (!tickets || tickets.length === 0) {
        console.log('Nenhum ticket pendente encontrado para:', {
          raffleId,
          email: webhookData.customer.email
        });
        return new Response('No pending tickets found', { status: 404, headers: corsHeaders });
      }

      // Atualizar status dos tickets para vendido e pago
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          status: 'sold',
          payment_status: 'paid',
          payment_method: 'pix',
          payment_id: webhookData.id,
          updated_at: new Date().toISOString()
        })
        .eq('raffle_id', raffleId)
        .eq('buyer_email', webhookData.customer.email)
        .eq('payment_status', 'pending');

      if (updateError) {
        console.error('Erro ao atualizar tickets:', updateError);
        return new Response('Error updating tickets', { status: 500, headers: corsHeaders });
      }

      console.log(`Tickets atualizados com sucesso para pagamento ${webhookData.id}`);

    } else if (webhook.event === 'pix.expired' || webhookData.status === 'expired') {
      // PIX expirado - remover tickets pendentes
      const { error: deleteError } = await supabase
        .from('tickets')
        .delete()
        .eq('raffle_id', raffleId)
        .eq('buyer_email', webhookData.customer.email)
        .eq('payment_status', 'pending');

      if (deleteError) {
        console.error('Erro ao remover tickets expirados:', deleteError);
        return new Response('Error removing expired tickets', { status: 500, headers: corsHeaders });
      }

      console.log(`Tickets expirados removidos para rifa ${raffleId}`);
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response('Internal server error', { status: 500, headers: corsHeaders });
  }
});