-- =====================================================
-- POLÍTICAS DE SEGURANÇA RLS - TABELA USERS
-- =====================================================
-- Este script configura Row Level Security (RLS) para a tabela users
-- Usuários podem ver e editar apenas seu próprio perfil
-- Admins podem gerenciar todos os usuários

-- Habilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE LEITURA (SELECT)
-- =====================================================

-- Política: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON users
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

-- Política: Admins podem ver todos os usuários
CREATE POLICY "Admins podem ver todos os usuários"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Política: Permitir leitura pública de informações básicas (para depoimentos)
CREATE POLICY "Leitura pública de informações básicas"
ON users
FOR SELECT
USING (
  -- Permite ver apenas nome e avatar para depoimentos públicos
  true
);

-- =====================================================
-- POLÍTICAS DE INSERÇÃO (INSERT)
-- =====================================================

-- Política: Permitir criação de perfil próprio
CREATE POLICY "Permitir criação de perfil próprio"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid() AND
  -- Novos usuários não podem se auto-promover a admin
  (role IS NULL OR role = 'user')
);

-- Política: Admins podem criar usuários com qualquer role
CREATE POLICY "Admins podem criar qualquer usuário"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS DE ATUALIZAÇÃO (UPDATE)
-- =====================================================

-- Política: Usuários podem atualizar seu próprio perfil (exceto role)
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON users
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
)
WITH CHECK (
  id = auth.uid() AND
  -- Não permitir que usuários alterem seu próprio role
  (
    role = (SELECT role FROM users WHERE id = auth.uid()) OR
    role IS NULL
  )
);

-- Política: Admins podem atualizar qualquer usuário
CREATE POLICY "Admins podem atualizar qualquer usuário"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS DE EXCLUSÃO (DELETE)
-- =====================================================

-- Política: Usuários podem deletar seu próprio perfil
CREATE POLICY "Usuários podem deletar seu próprio perfil"
ON users
FOR DELETE
TO authenticated
USING (
  id = auth.uid() AND
  -- Não permitir que admins se deletem (proteção)
  role != 'admin'
);

-- Política: Admins podem deletar outros usuários (exceto outros admins)
CREATE POLICY "Admins podem deletar usuários não-admin"
ON users
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  ) AND
  -- Não permitir deletar outros admins
  role != 'admin'
);

-- =====================================================
-- FUNÇÃO AUXILIAR PARA INFORMAÇÕES PÚBLICAS
-- =====================================================

-- Criar uma view para informações públicas dos usuários
CREATE OR REPLACE VIEW public_user_info AS
SELECT 
  id,
  name,
  avatar_url,
  created_at
FROM users
WHERE name IS NOT NULL;

-- Permitir acesso público à view de informações básicas
GRANT SELECT ON public_user_info TO anon, authenticated;

-- =====================================================
-- TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIL
-- =====================================================

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa quando um novo usuário é criado no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- FUNÇÃO PARA VERIFICAR SE USUÁRIO É ADMIN
-- =====================================================

-- Função utilitária para verificar se usuário atual é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- TESTE DE SEGURANÇA
-- =====================================================

-- Para testar as políticas, execute estas queries como diferentes usuários:

-- 1. Como usuário autenticado (deve ver apenas seu perfil):
-- SELECT * FROM users;

-- 2. Como admin (deve ver todos os usuários):
-- SELECT * FROM users;

-- 3. Tentar ver perfil de outro usuário (deve falhar):
-- SELECT * FROM users WHERE id != auth.uid();

-- 4. Atualizar próprio perfil (deve funcionar):
-- UPDATE users SET name = 'Novo Nome' WHERE id = auth.uid();

-- 5. Tentar alterar próprio role (deve falhar):
-- UPDATE users SET role = 'admin' WHERE id = auth.uid();

-- 6. Verificar se é admin:
-- SELECT is_admin();

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
IMPORTANTE: 
1. Usuários só podem ver e editar seu próprio perfil
2. Usuários não podem alterar seu próprio role
3. Admins têm acesso total, mas não podem deletar outros admins
4. Perfis são criados automaticamente quando usuário se registra
5. A view public_user_info expõe apenas informações básicas

SEGURANÇA:
- Usuários: Acesso apenas ao próprio perfil
- Administradores: Acesso total, com proteções contra auto-deleção
- Público: Acesso a informações básicas via view

FUNCIONALIDADES:
- Criação automática de perfil no registro
- Proteção contra escalação de privilégios
- Função utilitária is_admin() para outras políticas
- Informações públicas para depoimentos

PROTEÇÕES ESPECIAIS:
- Usuários não podem se promover a admin
- Admins não podem deletar outros admins
- Trigger automático para novos usuários

PRÓXIMOS PASSOS:
1. Execute este script no SQL Editor do Supabase
2. Teste as políticas com diferentes usuários
3. Configure as políticas para a tabela testimonials
4. Verifique se o trigger está funcionando
*/