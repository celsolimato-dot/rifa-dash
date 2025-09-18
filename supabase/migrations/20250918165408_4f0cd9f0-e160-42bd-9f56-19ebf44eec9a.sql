-- Corrigir a função do trigger que está causando o erro
CREATE OR REPLACE FUNCTION public.update_raffle_sold_tickets()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    -- Atualiza o contador de bilhetes vendidos na rifa
    UPDATE raffles 
    SET 
        sold_tickets = (
            SELECT COUNT(*) 
            FROM tickets 
            WHERE raffle_id = COALESCE(NEW.raffle_id, OLD.raffle_id) 
            AND status = 'sold'
        ),
        revenue = (
            SELECT COALESCE(COUNT(*) * MAX(r.ticket_price), 0)
            FROM tickets t
            JOIN raffles r ON r.id = t.raffle_id
            WHERE t.raffle_id = COALESCE(NEW.raffle_id, OLD.raffle_id) 
            AND t.status = 'sold'
            GROUP BY r.id, r.ticket_price
        )
    WHERE id = COALESCE(NEW.raffle_id, OLD.raffle_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;