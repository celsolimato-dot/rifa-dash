import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AbacatePayWebhook {
  event: string;
  data: {
    payment: {
      amount: number;
      fee: number;
      method: string;
    };
    pixQrCode: {
      amount: number;
      id: string;
      kind: string;
      status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
    };
    metadata?: {
      externalId: string;
    };
    customer?: {
      name: string;
      email: string;
      cellphone: string;
      taxId: string;
    };
  };
  devMode: boolean;
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
    console.log('Webhook recebido:', JSON.stringify(webhook, null, 2));

    // Verificar se é um evento de pagamento
    if (webhook.event !== 'billing.paid') {
      console.log('Evento ignorado:', webhook.event);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const { data: webhookData } = webhook;
    const pixId = webhookData.pixQrCode?.id;
    
    // Corrigir: o externalId está dentro de pixQrCode.metadata
    const externalId = webhookData.pixQrCode?.metadata?.externalId;

    console.log('Dados extraídos:', { pixId, externalId });

    if (!pixId) {
      console.error('PIX ID não encontrado no webhook');
      return new Response('PIX ID required', { status: 400, headers: corsHeaders });
    }

    if (!externalId) {
      console.error('External ID não encontrado no webhook. Tentando buscar por PIX ID.');
      
      // Buscar tickets pelo pix_id se não tiver external ID
      const { data: ticketsByPixId, error: pixError } = await supabase
        .from('tickets')
        .select('*')
        .eq('pix_id', pixId)
        .eq('payment_status', 'pending');

      if (pixError) {
        console.error('Erro ao buscar tickets por PIX ID:', pixError);
        return new Response('Error finding tickets', { status: 500, headers: corsHeaders });
      }

      if (ticketsByPixId && ticketsByPixId.length > 0) {
        console.log(`Encontrados ${ticketsByPixId.length} tickets pelo PIX ID`);
        
        // Atualizar tickets encontrados
        const { error: updateError } = await supabase
          .from('tickets')
          .update({
            status: 'sold',
            payment_status: 'paid',
            payment_method: 'pix',
            payment_id: pixId,
            purchase_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('pix_id', pixId)
          .eq('payment_status', 'pending');

        if (updateError) {
          console.error('Erro ao atualizar tickets por PIX ID:', updateError);
          return new Response('Error updating tickets', { status: 500, headers: corsHeaders });
        }

        console.log(`Tickets atualizados com sucesso para PIX ${pixId}`);
        return new Response('OK', { status: 200, headers: corsHeaders });
      }
      
      return new Response('No tickets found', { status: 404, headers: corsHeaders });
    }

    // Extrair informações do external ID (formato: rifa_raffleId_timestamp)
    const parts = externalId.split('_');
    if (parts.length < 2) {
      console.error('Formato inválido do external ID:', externalId);
      return new Response('Invalid external ID format', { status: 400, headers: corsHeaders });
    }
    
    const raffleId = parts[1];

    console.log(`Processando pagamento para rifa ${raffleId}, PIX: ${pixId}, status: ${webhookData.pixQrCode?.status}`);

    if (webhookData.pixQrCode?.status === 'PAID') {
      // Pagamento confirmado - atualizar tickets pelo pix_id
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('pix_id', pixId)
        .eq('payment_status', 'pending');

      if (ticketsError) {
        console.error('Erro ao buscar tickets:', ticketsError);
        return new Response('Error fetching tickets', { status: 500, headers: corsHeaders });
      }

      if (!tickets || tickets.length === 0) {
        console.log('Nenhum ticket pendente encontrado para PIX:', pixId);
        return new Response('No pending tickets found', { status: 404, headers: corsHeaders });
      }

      console.log(`Atualizando ${tickets.length} tickets para o PIX ${pixId}`);

      // Atualizar status dos tickets para vendido e pago
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          status: 'sold',
          payment_status: 'paid',
          payment_method: 'pix',
          payment_id: pixId,
          purchase_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('pix_id', pixId)
        .eq('payment_status', 'pending');

      if (updateError) {
        console.error('Erro ao atualizar tickets:', updateError);
        return new Response('Error updating tickets', { status: 500, headers: corsHeaders });
      }

      console.log(`${tickets.length} tickets atualizados com sucesso para pagamento ${pixId}`);

    } else {
      console.log(`Status ${webhookData.pixQrCode?.status} não processado`);
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response('Internal server error', { status: 500, headers: corsHeaders });
  }
});