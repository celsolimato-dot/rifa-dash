import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentStatusRequest {
  pixId: string;
  userEmail: string;
  raffleId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { pixId, userEmail, raffleId }: PaymentStatusRequest = await req.json();

    if (!pixId || !userEmail || !raffleId) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders });
    }

    console.log('Verificando status do pagamento:', { pixId, userEmail, raffleId });

    // Primeiro, verificar no banco se já temos tickets pagos
    const { data: paidTickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .eq('raffle_id', raffleId)
      .eq('buyer_email', userEmail)
      .eq('payment_status', 'paid')
      .eq('payment_id', pixId);

    if (ticketsError) {
      console.error('Erro ao verificar tickets:', ticketsError);
      return new Response('Error checking tickets', { status: 500, headers: corsHeaders });
    }

    if (paidTickets && paidTickets.length > 0) {
      return new Response(JSON.stringify({
        status: 'paid',
        tickets: paidTickets.map(t => t.number),
        message: 'Pagamento confirmado!'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Se não encontrou no banco, consultar a API do AbacatePay
    const abacatePayToken = Deno.env.get('ABACATEPAY_TOKEN');
    if (!abacatePayToken) {
      console.error('Token do AbacatePay não configurado');
      return new Response('API configuration error', { status: 500, headers: corsHeaders });
    }

    const abacatePayResponse = await fetch(`https://api.abacatepay.com/v1/pixQrCode/${pixId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${abacatePayToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!abacatePayResponse.ok) {
      console.error('Erro ao consultar AbacatePay:', abacatePayResponse.status);
      return new Response('Error checking payment status', { status: 500, headers: corsHeaders });
    }

    const paymentData = await abacatePayResponse.json();
    console.log('Status do AbacatePay:', paymentData.data?.status);

    return new Response(JSON.stringify({
      status: paymentData.data?.status || 'pending',
      message: paymentData.data?.status === 'paid' ? 
        'Pagamento confirmado! Aguarde a atualização...' : 
        'Aguardando pagamento...'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return new Response('Internal server error', { status: 500, headers: corsHeaders });
  }
});