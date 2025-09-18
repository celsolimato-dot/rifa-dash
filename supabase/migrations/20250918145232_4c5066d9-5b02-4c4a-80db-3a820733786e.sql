-- Corrigir funções para adicionar search_path e resolver warnings de segurança
DROP FUNCTION IF EXISTS generate_ticket_number();
DROP FUNCTION IF EXISTS set_ticket_number();
DROP FUNCTION IF EXISTS auto_close_tickets();

-- Função para gerar número do ticket (com search_path)
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ticket_num text;
  counter int;
BEGIN
  -- Gerar número sequencial baseado na data atual
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 9) AS integer)), 0) + 1
  INTO counter
  FROM support_tickets
  WHERE ticket_number LIKE TO_CHAR(NOW(), 'YYYYMMDD') || '%';
  
  ticket_num := TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::text, 4, '0');
  
  RETURN ticket_num;
END;
$$;

-- Trigger para gerar número do ticket automaticamente (com search_path)
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$;

-- Função para fechar tickets automaticamente após 3 dias (com search_path)
CREATE OR REPLACE FUNCTION auto_close_tickets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE support_tickets 
  SET 
    status = 'closed',
    closed_at = NOW(),
    updated_at = NOW()
  WHERE 
    status IN ('open', 'in_progress') 
    AND auto_close_at <= NOW();
END;
$$;