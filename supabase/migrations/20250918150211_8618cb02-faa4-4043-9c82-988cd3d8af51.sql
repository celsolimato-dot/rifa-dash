-- Corrigir políticas RLS para resolver problemas de permissão

-- Remover política pública problemática da tabela users
DROP POLICY IF EXISTS "Public read for basic info" ON users;

-- Remover política pública problemática da tabela tickets  
DROP POLICY IF EXISTS "Leitura pública de estatísticas de bilhetes" ON tickets;

-- Criar vista pública para estatísticas de tickets sem dados sensíveis
CREATE OR REPLACE VIEW public_ticket_stats AS
SELECT 
    raffle_id,
    COUNT(*) as total_sold,
    COUNT(DISTINCT buyer_email) as unique_buyers,
    MIN(purchase_date) as first_sale,
    MAX(purchase_date) as last_sale
FROM tickets 
WHERE status = 'sold'
GROUP BY raffle_id;

-- Permitir leitura pública da vista de estatísticas
GRANT SELECT ON public_ticket_stats TO anon, authenticated;

-- Criar vista pública para informações básicas dos usuários (sem dados sensíveis)
CREATE OR REPLACE VIEW public_user_info AS
SELECT 
    id,
    name,
    avatar_url,
    created_at
FROM users;

-- Permitir leitura pública da vista de informações básicas
GRANT SELECT ON public_user_info TO anon, authenticated;

-- Corrigir política de suporte para usar apenas auth.uid() sem acessar tabela users
DROP POLICY IF EXISTS "Usuários podem criar tickets" ON support_tickets;
CREATE POLICY "Usuários podem criar tickets" 
ON support_tickets FOR INSERT 
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem ver seus próprios tickets" ON support_tickets;
CREATE POLICY "Usuários podem ver seus próprios tickets" 
ON support_tickets FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios tickets" ON support_tickets;
CREATE POLICY "Usuários podem atualizar seus próprios tickets" 
ON support_tickets FOR UPDATE 
USING (user_id = auth.uid());

-- Corrigir política de mensagens de suporte
DROP POLICY IF EXISTS "Usuários podem ver mensagens de seus tickets" ON support_messages;
CREATE POLICY "Usuários podem ver mensagens de seus tickets" 
ON support_messages FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM support_tickets 
    WHERE support_tickets.id = support_messages.ticket_id 
    AND support_tickets.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Usuários podem enviar mensagens em seus tickets" ON support_messages;  
CREATE POLICY "Usuários podem enviar mensagens em seus tickets" 
ON support_messages FOR INSERT 
WITH CHECK (sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM support_tickets 
    WHERE support_tickets.id = support_messages.ticket_id 
    AND support_tickets.user_id = auth.uid()
));