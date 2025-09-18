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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { pixId, userEmail, raffleId }: PaymentStatusRequest = await req.json();

    if (!pixId || !userEmail || !raffleId) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders });
    }

    console.log('Verificando status do pagamento:', { pixId, userEmail, raffleId });

    // Verificar no banco se já temos tickets pagos para este PIX
    const { data: paidTickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .eq('pix_id', pixId)
      .eq('user_email', userEmail)
      .eq('raffle_id', raffleId);

    if (ticketsError) {
      console.error('Erro ao verificar tickets:', ticketsError);
      return new Response('Error checking tickets', { status: 500, headers: corsHeaders });
    }

    console.log(`Encontrados ${paidTickets?.length || 0} tickets para PIX ${pixId}`);

    // Se encontrou tickets pagos, retornar sucesso
    const paidTicketsOnly = paidTickets?.filter(t => t.payment_status === 'paid') || [];
    if (paidTicketsOnly.length > 0) {
      console.log(`${paidTicketsOnly.length} tickets já pagos encontrados`);
      return new Response(JSON.stringify({
        status: 'paid',
        tickets: paidTicketsOnly.map(t => t.number),
        message: 'Pagamento confirmado!'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Se há tickets pendentes, aguardar o webhook
    const pendingTickets = paidTickets?.filter(t => t.payment_status === 'pending') || [];
    if (pendingTickets.length > 0) {
      console.log(`${pendingTickets.length} tickets pendentes encontrados`);
      return new Response(JSON.stringify({
        status: 'pending',
        tickets: pendingTickets.map(t => t.number),
        message: 'Aguardando confirmação do pagamento...'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Se não encontrou tickets, algo deu errado
    console.log('Nenhum ticket encontrado para este PIX');
    return new Response(JSON.stringify({
      status: 'not_found',
      message: 'Tickets não encontrados. Tente gerar um novo PIX.'
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return new Response('Internal server error', { status: 500, headers: corsHeaders });
  }
});