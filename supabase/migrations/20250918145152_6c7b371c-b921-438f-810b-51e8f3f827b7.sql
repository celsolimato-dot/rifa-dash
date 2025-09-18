-- Criar tabela de tickets de suporte
CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number varchar NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  user_email varchar NOT NULL,
  user_name varchar NOT NULL,
  subject varchar NOT NULL,
  description text NOT NULL,
  priority varchar NOT NULL DEFAULT 'medium',
  status varchar NOT NULL DEFAULT 'open',
  assigned_to uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  closed_at timestamp with time zone,
  auto_close_at timestamp with time zone NOT NULL DEFAULT (now() + interval '3 days')
);

-- Criar tabela de mensagens dos tickets
CREATE TABLE public.support_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_name varchar NOT NULL,
  sender_type varchar NOT NULL, -- 'client' ou 'admin'
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para support_tickets
CREATE POLICY "Usuários podem ver seus próprios tickets" 
ON public.support_tickets 
FOR SELECT 
USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins podem ver todos os tickets" 
ON public.support_tickets 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Usuários podem criar tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins podem criar tickets para qualquer usuário" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Usuários podem atualizar seus próprios tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins podem atualizar qualquer ticket" 
ON public.support_tickets 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para support_messages
CREATE POLICY "Usuários podem ver mensagens de seus tickets" 
ON public.support_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM support_tickets 
  WHERE id = ticket_id 
  AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
));

CREATE POLICY "Admins podem ver todas as mensagens" 
ON public.support_messages 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Usuários podem enviar mensagens em seus tickets" 
ON public.support_messages 
FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM support_tickets 
    WHERE id = ticket_id 
    AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Admins podem enviar mensagens em qualquer ticket" 
ON public.support_messages 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Função para gerar número do ticket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
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

-- Trigger para gerar número do ticket automaticamente
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT OR UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION set_ticket_number();

-- Função para fechar tickets automaticamente após 3 dias
CREATE OR REPLACE FUNCTION auto_close_tickets()
RETURNS void
LANGUAGE plpgsql
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