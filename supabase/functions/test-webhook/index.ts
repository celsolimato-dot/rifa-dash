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
    console.log('🧪 Iniciando teste do webhook...');

    // Simular dados do AbacatePay
    const testWebhookData = {
      event: "billing.paid",
      data: {
        payment: {
          amount: 1000, // R$ 10,00 em centavos
          fee: 80,
          method: "PIX"
        },
        pixQrCode: {
          amount: 1000,
          id: "pix_test_123456789",
          kind: "PIX",
          status: "PAID"
        }
      },
      devMode: false
    };

    console.log('📤 Enviando webhook de teste:', testWebhookData);

    // Chamar nosso webhook
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify(testWebhookData)
    });

    const responseText = await response.text();
    
    console.log('📥 Resposta do webhook:', {
      status: response.status,
      body: responseText
    });

    if (response.ok) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Webhook testado com sucesso!',
        webhookResponse: {
          status: response.status,
          body: responseText
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Erro no teste do webhook',
        error: responseText,
        status: response.status
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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