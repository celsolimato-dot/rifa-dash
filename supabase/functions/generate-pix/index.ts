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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const abacatePayToken = Deno.env.get('ABACATEPAY_TOKEN');

    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasToken: !!abacatePayToken,
      tokenLength: abacatePayToken?.length || 0
    });

    if (!abacatePayToken) {
      throw new Error('Token da API AbacatePay não configurado no servidor');
    }

    if (!supabaseServiceKey) {
      throw new Error('Chave de serviço do Supabase não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      amount, 
      description, 
      customer, 
      metadata,
      raffleId,
      selectedNumbers,
      userEmail 
    } = await req.json();

    console.log('Dados recebidos:', {
      amount,
      description,
      customer,
      metadata,
      raffleId,
      selectedNumbersCount: selectedNumbers?.length,
      userEmail
    });

    // Preparar dados para AbacatePay conforme modelo fornecido
    const pixPayload = {
      amount: Math.round(amount * 100), // Converter para centavos
      expiresIn: 300, // 5 minutos
      description,
      customer: {
        name: customer.name,
        cellphone: customer.phone || customer.cellphone,
        email: customer.email,
        taxId: customer.cpf || customer.taxId
      },
      metadata: {
        externalId: metadata?.externalId || `raffle_${raffleId}`,
        ...metadata
      }
    };

    console.log('Payload para AbacatePay:', JSON.stringify(pixPayload, null, 2));

    // Criar o PIX QR Code via AbacatePay
    const pixResponse = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${abacatePayToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pixPayload)
    });

    console.log('Resposta da AbacatePay - Status:', pixResponse.status);
    
    if (!pixResponse.ok) {
      const errorText = await pixResponse.text();
      console.error('Erro da API AbacatePay:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error?.message || errorData.message || `Erro da API AbacatePay: ${pixResponse.status}`);
      } catch (parseError) {
        throw new Error(`Erro da API AbacatePay (${pixResponse.status}): ${errorText}`);
      }
    }

    const pixData = await pixResponse.json();
    console.log('Dados do PIX recebidos:', JSON.stringify(pixData, null, 2));

    if (pixData.data && pixData.data.brCode && pixData.data.brCodeBase64) {
      console.log('PIX QR Code gerado com sucesso. ID:', pixData.data.id);
      
      // Salvar os tickets como reservados no banco
      const ticketsToInsert = selectedNumbers.map((number: string) => ({
        raffle_id: raffleId,
        number: parseInt(number),
        user_email: userEmail,
        buyer_email: userEmail,
        buyer_name: customer.name,
        buyer_phone: customer.phone || customer.cellphone,
        status: 'reserved',
        payment_status: 'pending',
        pix_id: pixData.data.id,
        reserved_until: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutos
      }));

      console.log('Inserindo tickets:', {
        count: ticketsToInsert.length,
        raffleId,
        pixId: pixData.data.id,
        userEmail
      });

      const { data: insertedTickets, error: insertError } = await supabase
        .from('tickets')
        .insert(ticketsToInsert)
        .select();

      if (insertError) {
        console.error('Erro ao salvar tickets:', {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
          details: insertError.details
        });
        throw new Error(`Erro ao reservar números: ${insertError.message}`);
      }

      console.log('Tickets inseridos com sucesso:', insertedTickets?.length || 0);

      return new Response(JSON.stringify({
        success: true,
        pixData: pixData.data,
        ticketsReserved: insertedTickets?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('Resposta inválida da AbacatePay:', pixData);
      throw new Error('Resposta inválida da API AbacatePay - dados do PIX não encontrados');
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