-- Corrigir definitivamente o trigger para evitar valores NULL em revenue
CREATE OR REPLACE FUNCTION public.update_raffle_sold_tickets()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    target_raffle_id uuid;
    sold_count integer;
    ticket_price_value numeric;
    calculated_revenue numeric;
BEGIN
    -- Determinar o ID da rifa
    target_raffle_id := COALESCE(NEW.raffle_id, OLD.raffle_id);
    
    -- Contar bilhetes vendidos
    SELECT COUNT(*) INTO sold_count
    FROM tickets 
    WHERE raffle_id = target_raffle_id 
    AND status = 'sold';
    
    -- Obter o preço do bilhete
    SELECT ticket_price INTO ticket_price_value
    FROM raffles 
    WHERE id = target_raffle_id;
    
    -- Calcular revenue (sempre um valor válido)
    calculated_revenue := COALESCE(sold_count * ticket_price_value, 0);
    
    -- Atualizar a rifa
    UPDATE raffles 
    SET 
        sold_tickets = sold_count,
        revenue = calculated_revenue,
        updated_at = NOW()
    WHERE id = target_raffle_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;