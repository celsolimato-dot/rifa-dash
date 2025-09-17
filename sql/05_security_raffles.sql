-- =====================================================
-- POLÍTICAS DE SEGURANÇA RLS - TABELA RAFFLES
-- =====================================================
-- Este script configura Row Level Security (RLS) para a tabela raffles
-- Apenas administradores podem criar, editar e deletar rifas
-- Usuários comuns podem apenas visualizar rifas ativas

-- Habilitar RLS na tabela raffles
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE LEITURA (SELECT)
-- =====================================================

-- Política: Todos podem ver rifas ativas
CREATE POLICY "Permitir leitura de rifas ativas para todos"
ON raffles
FOR SELECT
USING (
  status = 'active' OR 
  status = 'completed'
);

-- Política: Admins podem ver todas as rifas
CREATE POLICY "Permitir leitura completa para admins"
ON raffles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS DE INSERÇÃO (INSERT)
-- =====================================================

-- Política: Apenas admins podem criar rifas
CREATE POLICY "Apenas admins podem criar rifas"
ON raffles
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

-- Política: Apenas admins podem atualizar rifas
CREATE POLICY "Apenas admins podem atualizar rifas"
ON raffles
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

-- Política: Apenas admins podem deletar rifas
CREATE POLICY "Apenas admins podem deletar rifas"
ON raffles
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
WHERE tablename = 'raffles'
ORDER BY policyname;

-- =====================================================
-- TESTE DE SEGURANÇA
-- =====================================================

-- Para testar as políticas, execute estas queries como diferentes usuários:

-- 1. Como usuário não autenticado (deve ver apenas rifas ativas):
-- SELECT * FROM raffles;

-- 2. Como usuário comum (deve ver apenas rifas ativas):
-- SELECT * FROM raffles;

-- 3. Como admin (deve ver todas as rifas):
-- SELECT * FROM raffles;

-- 4. Tentar inserir como usuário comum (deve falhar):
-- INSERT INTO raffles (title, description, price, total_tickets) 
-- VALUES ('Teste', 'Descrição', 10.00, 100);

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
IMPORTANTE: 
1. Certifique-se de que a tabela 'users' existe e tem a coluna 'role'
2. O usuário admin deve ter role = 'admin' na tabela users
3. auth.uid() retorna o ID do usuário autenticado no Supabase
4. Estas políticas assumem que você está usando Supabase Auth

SEGURANÇA:
- Usuários não autenticados: Podem ver apenas rifas ativas/completas
- Usuários autenticados: Podem ver apenas rifas ativas/completas
- Administradores: Acesso total (CRUD) a todas as rifas

PRÓXIMOS PASSOS:
1. Execute este script no SQL Editor do Supabase
2. Verifique se as políticas foram criadas corretamente
3. Teste com diferentes tipos de usuários
4. Configure as políticas para as outras tabelas
*/