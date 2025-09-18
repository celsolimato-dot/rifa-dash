-- Corrigir política RLS para tickets - permitir que usuários vejam seus próprios bilhetes
DROP POLICY IF EXISTS "Usuários podem ver seus próprios bilhetes" ON tickets;

CREATE POLICY "Usuários podem ver seus próprios bilhetes" 
ON tickets 
FOR SELECT 
USING (
  buyer_email = (auth.jwt() ->> 'email')::text
);

-- Corrigir política RLS para tickets - permitir que usuários comprem bilhetes
DROP POLICY IF EXISTS "Usuários podem comprar bilhetes" ON tickets;

CREATE POLICY "Usuários podem comprar bilhetes" 
ON tickets 
FOR INSERT 
WITH CHECK (
  buyer_email = (auth.jwt() ->> 'email')::text
  AND EXISTS (
    SELECT 1 FROM raffles 
    WHERE raffles.id = tickets.raffle_id 
    AND raffles.status = 'active'
  )
);

-- Corrigir política RLS para tickets - permitir que usuários atualizem seus próprios bilhetes
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios bilhetes" ON tickets;

CREATE POLICY "Usuários podem atualizar seus próprios bilhetes" 
ON tickets 
FOR UPDATE 
USING (buyer_email = (auth.jwt() ->> 'email')::text)
WITH CHECK (buyer_email = (auth.jwt() ->> 'email')::text);

-- Corrigir política RLS para tickets - permitir que usuários cancelem seus próprios bilhetes
DROP POLICY IF EXISTS "Usuários podem cancelar seus próprios bilhetes" ON tickets;

CREATE POLICY "Usuários podem cancelar seus próprios bilhetes" 
ON tickets 
FOR DELETE 
USING (
  buyer_email = (auth.jwt() ->> 'email')::text
  AND EXISTS (
    SELECT 1 FROM raffles 
    WHERE raffles.id = tickets.raffle_id 
    AND raffles.status = 'active'
  )
);