-- Criar função para processar comissões de afiliados quando um ticket é vendido
CREATE OR REPLACE FUNCTION public.process_affiliate_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_user_id uuid;
  commission_rate numeric;
  ticket_value numeric;
  commission_amount numeric;
  ticket_count integer;
  raffle_ticket_price numeric;
BEGIN
  -- Só processar se o status mudou para 'sold' e payment_status é 'paid'
  IF NEW.status = 'sold' AND NEW.payment_status = 'paid' AND 
     (OLD.status != 'sold' OR OLD.payment_status != 'paid') THEN
    
    -- Verificar se o comprador tem um referrer
    SELECT referrer_id INTO referrer_user_id
    FROM users 
    WHERE email = NEW.buyer_email;
    
    -- Se não tem referrer, não processar comissão
    IF referrer_user_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Contar quantos tickets este usuário comprou nesta rifa
    SELECT COUNT(*) INTO ticket_count
    FROM tickets 
    WHERE buyer_email = NEW.buyer_email 
    AND raffle_id = NEW.raffle_id 
    AND status = 'sold';
    
    -- Se comprou mais de 5 tickets, não ganha comissão
    IF ticket_count > 5 THEN
      RETURN NEW;
    END IF;
    
    -- Buscar preço do ticket da rifa
    SELECT ticket_price INTO raffle_ticket_price
    FROM raffles 
    WHERE id = NEW.raffle_id;
    
    -- Buscar taxa de comissão
    SELECT commission_percentage INTO commission_rate
    FROM affiliate_settings
    LIMIT 1;
    
    -- Se não há configuração, usar padrão de 10%
    IF commission_rate IS NULL THEN
      commission_rate := 10.0;
    END IF;
    
    -- Calcular comissão baseada no preço do ticket
    ticket_value := COALESCE(raffle_ticket_price, 0);
    commission_amount := (ticket_value * commission_rate) / 100;
    
    -- Criar ou atualizar registro de referência
    INSERT INTO referrals (
      referrer_id,
      referred_user_id,
      commission_earned,
      commission_percentage,
      status
    )
    SELECT 
      referrer_user_id,
      u.id,
      commission_amount,
      commission_rate,
      'confirmed'
    FROM users u
    WHERE u.email = NEW.buyer_email
    ON CONFLICT (referrer_id, referred_user_id) 
    DO UPDATE SET
      commission_earned = referrals.commission_earned + commission_amount,
      status = 'confirmed',
      updated_at = now();
    
    -- Atualizar estatísticas do afiliado
    UPDATE affiliates
    SET 
      total_referrals = (
        SELECT COUNT(DISTINCT referred_user_id) 
        FROM referrals 
        WHERE referrer_id = referrer_user_id
      ),
      total_commission = (
        SELECT COALESCE(SUM(commission_earned), 0) 
        FROM referrals 
        WHERE referrer_id = referrer_user_id AND status = 'confirmed'
      ),
      available_balance = (
        SELECT COALESCE(SUM(commission_earned), 0) 
        FROM referrals 
        WHERE referrer_id = referrer_user_id AND status = 'confirmed'
      ) - COALESCE(total_withdrawn, 0),
      updated_at = now()
    WHERE user_id = referrer_user_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para processar comissões quando tickets são vendidos
DROP TRIGGER IF EXISTS process_affiliate_commission_trigger ON tickets;
CREATE TRIGGER process_affiliate_commission_trigger
  AFTER UPDATE ON tickets
  FOR EACH ROW 
  EXECUTE FUNCTION process_affiliate_commission();

-- Criar trigger para processar comissões quando tickets são inseridos como vendidos
CREATE TRIGGER process_affiliate_commission_insert_trigger
  AFTER INSERT ON tickets
  FOR EACH ROW 
  EXECUTE FUNCTION process_affiliate_commission();