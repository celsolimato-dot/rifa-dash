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

    // Limpar dados de teste anteriores
    const testRaffleId = '4df8ceb6-aaae-4e2b-8ebc-09d05373bb36'; // iPhone raffle
    const testEmail = 'test@example.com';
    const testPixId = `pix_test_${Date.now()}`; // ID único para cada teste
    const testTicketNumber = Math.floor(Math.random() * 900) + 100; // Número aleatório entre 100-999

    console.log(`📝 Dados do teste:
    - Rifa ID: ${testRaffleId}
    - Email: ${testEmail}
    - PIX ID: ${testPixId}
    - Número do bilhete: ${testTicketNumber}`);

    // Limpar tickets de teste anteriores
    console.log('🧹 Limpando dados de teste anteriores...');
    const { error: cleanupError } = await supabase
      .from('tickets')
      .delete()
      .eq('buyer_email', testEmail)
      .eq('buyer_name', 'Teste Webhook');
    
    if (cleanupError) {
      console.log('⚠️ Aviso na limpeza (não é um erro crítico):', cleanupError.message);
    }

    // Verificar se a rifa existe e está ativa
    const { data: raffleData, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', testRaffleId)
      .single();

    if (raffleError || !raffleData) {
      console.error('❌ Rifa não encontrada:', raffleError);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Rifa de teste não encontrada',
        error: raffleError?.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Rifa encontrada:', {
      title: raffleData.title,
      status: raffleData.status,
      ticket_price: raffleData.ticket_price
    });

    // Inserir ticket de teste
    console.log('🎫 Criando ticket de teste...');
    const { data: insertData, error: insertError } = await supabase
      .from('tickets')
      .insert({
        raffle_id: testRaffleId,
        number: testTicketNumber,
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
        error: insertError.message,
        details: `Tentou criar ticket ${testTicketNumber} para rifa ${testRaffleId}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Ticket de teste criado com sucesso:', {
      id: insertData[0]?.id,
      number: insertData[0]?.number,
      raffle_id: insertData[0]?.raffle_id,
      payment_id: insertData[0]?.payment_id
    });

    // Simular webhook do AbacatePay
    console.log('🔄 Simulando webhook do AbacatePay...');
    const webhookData = {
      event: "billing.paid",
      data: {
        payment: {
          amount: Math.round(raffleData.ticket_price * 100), // Usar o preço real da rifa em centavos
          fee: 80,
          method: "PIX"
        },
        pixQrCode: {
          amount: Math.round(raffleData.ticket_price * 100),
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

    console.log('📦 Dados do webhook simulado:', {
      event: webhookData.event,
      pixId: webhookData.data.pixQrCode.id,
      amount: webhookData.data.payment.amount,
      externalId: webhookData.data.metadata.externalId
    });

    // Processar o webhook diretamente (simular o que o AbacatePay faria)
    console.log('💰 Processando simulação de pagamento...');
    const externalId = webhookData.data.metadata?.externalId;
    const [, raffleId] = externalId.split('_');

    if (webhookData.event === 'billing.paid' && webhookData.data.pixQrCode?.status === 'PAID') {
      console.log('✅ Condições do webhook atendidas, atualizando ticket...');
      
      // Atualizar ticket para pago
      const { data: updateData, error: updateError } = await supabase
        .from('tickets')
        .update({
          status: 'sold',
          payment_status: 'paid',
          payment_method: 'pix',
          updated_at: new Date().toISOString()
        })
        .eq('raffle_id', raffleId)
        .eq('payment_id', testPixId)
        .select();

      if (updateError) {
        console.error('❌ Erro ao atualizar ticket:', updateError);
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Erro ao processar pagamento',
          error: updateError.message,
          details: `Tentou atualizar ticket com PIX ID: ${testPixId}`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('✅ Ticket atualizado para PAGO:', updateData);

      // Verificar o estado final da rifa
      const { data: finalRaffleData } = await supabase
        .from('raffles')
        .select('sold_tickets, revenue')
        .eq('id', testRaffleId)
        .single();

      // Verificar o ticket final
      const { data: finalTicketData } = await supabase
        .from('tickets')
        .select('*')
        .eq('payment_id', testPixId)
        .single();

      console.log('🏁 Estado final:', {
        ticket: {
          id: finalTicketData?.id,
          number: finalTicketData?.number,
          status: finalTicketData?.status,
          payment_status: finalTicketData?.payment_status
        },
        raffle: {
          sold_tickets: finalRaffleData?.sold_tickets,
          revenue: finalRaffleData?.revenue
        }
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: '🎉 Webhook testado com sucesso! Ticket atualizado para PAGO e triggers funcionando corretamente.',
        testResults: {
          ticket: finalTicketData,
          raffleStats: finalRaffleData,
          testInfo: {
            pixId: testPixId,
            ticketNumber: testTicketNumber,
            raffleId: testRaffleId
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('❌ Condições do webhook NÃO atendidas');
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Condições do webhook não atendidas',
      details: {
        event: webhookData.event,
        pixStatus: webhookData.data.pixQrCode?.status,
        expected: { event: 'billing.paid', status: 'PAID' }
      }
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