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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const abacatePayToken = Deno.env.get('ABACATEPAY_TOKEN');

    console.log('Environment check:', {
      hasToken: !!abacatePayToken,
      tokenLength: abacatePayToken?.length || 0
    });

    if (!abacatePayToken) {
      throw new Error('Token da API AbacatePay não configurado no servidor');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      amount, 
      description, 
      customer, 
      metadata,
      raffleId,
      selectedNumbers,
      userEmail 
    } = await req.json();

    // Criar o PIX QR Code via AbacatePay
    const pixResponse = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${abacatePayToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Converter para centavos
        expiresIn: 300, // 5 minutos
        description,
        customer,
        metadata
      })
    });

    if (!pixResponse.ok) {
      const errorData = await pixResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro da API: ${pixResponse.status}`);
    }

    const pixData = await pixResponse.json();

    if (pixData.data && pixData.data.brCode && pixData.data.brCodeBase64) {
      // Salvar os tickets como pendentes no banco
      const ticketsToInsert = selectedNumbers.map((number: string) => ({
        raffle_id: raffleId,
        number: number,
        user_email: userEmail,
        status: 'reserved',
        payment_status: 'pending',
        pix_id: pixData.data.id,
        reserved_until: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutos
      }));

      const { error: insertError } = await supabase
        .from('tickets')
        .insert(ticketsToInsert);

      if (insertError) {
        console.error('Erro ao salvar tickets:', insertError);
        throw new Error('Erro ao reservar números');
      }

      return new Response(JSON.stringify({
        success: true,
        pixData: pixData.data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Resposta inválida da API AbacatePay');
    }

  } catch (error) {
    console.error('Erro na function generate-pix:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});