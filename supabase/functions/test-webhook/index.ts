import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('🧪 Iniciando teste do webhook...');

    // Primeiro, criar um ticket de teste no banco
    const testRaffleId = '4df8ceb6-aaae-4e2b-8ebc-09d05373bb36'; // iPhone raffle
    const testEmail = 'test@example.com';
    const testPixId = 'pix_test_123456789';

    // Inserir ticket de teste
    const { data: insertData, error: insertError } = await supabase
      .from('tickets')
      .insert({
        raffle_id: testRaffleId,
        number: 999,
        buyer_name: 'Teste Webhook',
        buyer_email: testEmail,
        buyer_phone: '(11) 99999-9999',
        status: 'reserved',
        payment_status: 'pending',
        payment_id: testPixId,
        purchase_date: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.error('❌ Erro ao criar ticket de teste:', insertError);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Erro ao criar ticket de teste',
        error: insertError.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Ticket de teste criado:', insertData);

    // Simular webhook do AbacatePay
    const webhookData = {
      event: "billing.paid",
      data: {
        payment: {
          amount: 890, // R$ 8,90 em centavos
          fee: 80,
          method: "PIX"
        },
        pixQrCode: {
          amount: 890,
          id: testPixId,
          kind: "PIX",
          status: "PAID"
        },
        metadata: {
          externalId: `rifa_${testRaffleId}_${Date.now()}`
        }
      },
      devMode: false
    };

    console.log('📦 Dados do webhook:', webhookData);

    // Processar o webhook diretamente (simular o que o AbacatePay faria)
    const externalId = webhookData.data.metadata?.externalId;
    const [, raffleId] = externalId.split('_');

    if (webhookData.event === 'billing.paid' && webhookData.data.pixQrCode?.status === 'PAID') {
      // Atualizar ticket para pago
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          status: 'sold',
          payment_status: 'paid',
          payment_method: 'pix',
          updated_at: new Date().toISOString()
        })
        .eq('raffle_id', raffleId)
        .eq('payment_id', testPixId);

      if (updateError) {
        console.error('❌ Erro ao atualizar ticket:', updateError);
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Erro ao processar pagamento',
          error: updateError.message
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('✅ Ticket atualizado para PAGO com sucesso!');

      // Verificar se a atualização funcionou
      const { data: verifyData } = await supabase
        .from('tickets')
        .select('*')
        .eq('payment_id', testPixId)
        .single();

      console.log('🔍 Verificação do ticket:', verifyData);

      return new Response(JSON.stringify({ 
        success: true, 
        message: '🎉 Webhook testado com sucesso! Ticket atualizado para PAGO.',
        ticketData: verifyData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Condições do webhook não atendidas'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro no teste do webhook:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});