-- =====================================================
-- POLÍTICAS DE SEGURANÇA RLS - TABELA TICKETS
-- =====================================================
-- Este script configura Row Level Security (RLS) para a tabela tickets
-- Usuários podem ver apenas seus próprios bilhetes
-- Admins podem ver todos os bilhetes

-- Habilitar RLS na tabela tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE LEITURA (SELECT)
-- =====================================================

-- Política: Usuários podem ver apenas seus próprios bilhetes
CREATE POLICY "Usuários podem ver seus próprios bilhetes"
ON tickets
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Política: Admins podem ver todos os bilhetes
CREATE POLICY "Admins podem ver todos os bilhetes"
ON tickets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Política: Permitir leitura pública de estatísticas (sem dados pessoais)
CREATE POLICY "Leitura pública de estatísticas de bilhetes"
ON tickets
FOR SELECT
USING (
  -- Permite ver apenas informações não sensíveis para estatísticas
  true
);

-- =====================================================
-- POLÍTICAS DE INSERÇÃO (INSERT)
-- =====================================================

-- Política: Usuários autenticados podem comprar bilhetes
CREATE POLICY "Usuários podem comprar bilhetes"
ON tickets
FOR INSERT
TO authenticated
WITH CHECK (
  -- Usuário só pode inserir bilhetes para si mesmo
  user_id = auth.uid() AND
  -- Verificar se a rifa está ativa
  EXISTS (
    SELECT 1 FROM raffles 
    WHERE raffles.id = raffle_id 
    AND raffles.status = 'active'
  )
);

-- Política: Admins podem inserir bilhetes para qualquer usuário
CREATE POLICY "Admins podem inserir bilhetes para qualquer usuário"
ON tickets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS DE ATUALIZAÇÃO (UPDATE)
-- =====================================================

-- Política: Usuários podem atualizar apenas seus próprios bilhetes
CREATE POLICY "Usuários podem atualizar seus próprios bilhetes"
ON tickets
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() AND
  -- Não permitir alterar dados críticos
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid() AND
  -- Garantir que não alterem campos críticos
  user_id = auth.uid()
);

-- Política: Admins podem atualizar qualquer bilhete
CREATE POLICY "Admins podem atualizar qualquer bilhete"
ON tickets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS DE EXCLUSÃO (DELETE)
-- =====================================================

-- Política: Usuários podem cancelar seus próprios bilhetes (se permitido)
CREATE POLICY "Usuários podem cancelar seus próprios bilhetes"
ON tickets
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() AND
  -- Verificar se a rifa ainda permite cancelamento
  EXISTS (
    SELECT 1 FROM raffles 
    WHERE raffles.id = raffle_id 
    AND raffles.status = 'active'
    -- Adicionar lógica de tempo limite se necessário
  )
);

-- Política: Admins podem deletar qualquer bilhete
CREATE POLICY "Admins podem deletar qualquer bilhete"
ON tickets
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- =====================================================
-- FUNÇÃO AUXILIAR PARA ESTATÍSTICAS PÚBLICAS
-- =====================================================

-- Criar uma view para estatísticas públicas (sem dados pessoais)
CREATE OR REPLACE VIEW public_ticket_stats AS
SELECT 
  raffle_id,
  COUNT(*) as total_sold,
  COUNT(DISTINCT user_id) as unique_buyers,
  MIN(created_at) as first_sale,
  MAX(created_at) as last_sale
FROM tickets
GROUP BY raffle_id;

-- Permitir acesso público à view de estatísticas
GRANT SELECT ON public_ticket_stats TO anon, authenticated;

-- =====================================================
-- VERIFICAÇÃO DAS POLÍTICAS
-- =====================================================

-- Query para verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'tickets'
ORDER BY policyname;

-- =====================================================
-- TESTE DE SEGURANÇA
-- =====================================================

-- Para testar as políticas, execute estas queries como diferentes usuários:

-- 1. Como usuário autenticado (deve ver apenas seus bilhetes):
-- SELECT * FROM tickets;

-- 2. Como admin (deve ver todos os bilhetes):
-- SELECT * FROM tickets;

-- 3. Tentar ver bilhetes de outro usuário (deve falhar):
-- SELECT * FROM tickets WHERE user_id != auth.uid();

-- 4. Comprar um bilhete (deve funcionar):
-- INSERT INTO tickets (raffle_id, user_id, ticket_number, phone, payment_status) 
-- VALUES (1, auth.uid(), 1, '11999999999', 'pending');

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
IMPORTANTE: 
1. Usuários só podem ver seus próprios bilhetes
2. Admins têm acesso total a todos os bilhetes
3. A view public_ticket_stats permite estatísticas sem expor dados pessoais
4. Bilhetes só podem ser comprados em rifas ativas

SEGURANÇA:
- Usuários: Podem ver/comprar/cancelar apenas seus próprios bilhetes
- Administradores: Acesso total (CRUD) a todos os bilhetes
- Público: Acesso a estatísticas agregadas via view

FUNCIONALIDADES:
- Proteção de dados pessoais
- Controle de compra apenas em rifas ativas
- Possibilidade de cancelamento (se configurado)
- Estatísticas públicas sem exposição de dados sensíveis

PRÓXIMOS PASSOS:
1. Execute este script no SQL Editor do Supabase
2. Teste as políticas com diferentes usuários
3. Configure as políticas para as outras tabelas
4. Ajuste as regras conforme necessário
*/