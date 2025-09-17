-- ============================================================================
-- CONFIGURAÇÃO RÁPIDA DO USUÁRIO ADMINISTRADOR
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Execute primeiro o setup_database.sql se ainda não executou
-- 2. Escolha UMA das opções abaixo:
--    - Opção A: Criar novo usuário admin
--    - Opção B: Transformar usuário existente em admin
-- 3. Execute o script escolhido no Supabase SQL Editor
-- 4. Verifique o resultado com a query de verificação no final
--
-- ============================================================================

-- OPÇÃO A: CRIAR NOVO USUÁRIO ADMINISTRADOR
-- Substitua os dados pelos seus dados reais antes de executar
INSERT INTO users (
    name, 
    email, 
    role, 
    status, 
    email_verified,
    phone
) VALUES (
    'Seu Nome Completo',           -- ← Substitua pelo seu nome
    'seu.email@exemplo.com',       -- ← Substitua pelo seu email
    'admin',
    'active',
    true,
    '+55 11 99999-9999'           -- ← Substitua pelo seu telefone (opcional)
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    status = 'active',
    email_verified = true,
    updated_at = NOW();

-- ============================================================================

-- OPÇÃO B: TRANSFORMAR USUÁRIO EXISTENTE EM ADMIN
-- Descomente UMA das linhas abaixo e substitua pelos dados corretos

-- Por email (recomendado):
-- UPDATE users SET role = 'admin', status = 'active', email_verified = true, updated_at = NOW() WHERE email = 'seu.email@exemplo.com';

-- Por ID (se souber o UUID):
-- UPDATE users SET role = 'admin', status = 'active', email_verified = true, updated_at = NOW() WHERE id = 'seu-uuid-aqui';

-- ============================================================================

-- VERIFICAÇÃO: Execute esta query para confirmar que o admin foi criado
SELECT 
    id,
    name,
    email,
    role,
    status,
    email_verified,
    created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at;

-- ============================================================================

-- BONUS: Ver todos os usuários do sistema
SELECT 
    name,
    email,
    role,
    status,
    email_verified,
    created_at
FROM users 
ORDER BY role DESC, created_at;