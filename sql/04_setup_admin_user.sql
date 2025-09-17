-- Script para configurar usuário administrador
-- Execute este arquivo no Supabase SQL Editor após criar as tabelas

-- ============================================================================
-- CONFIGURAÇÃO DO USUÁRIO ADMINISTRADOR
-- ============================================================================

-- Opção 1: Inserir novo usuário administrador
-- Descomente e ajuste os dados conforme necessário
INSERT INTO users (
    name, 
    email, 
    role, 
    status, 
    email_verified,
    phone
) VALUES (
    'Administrador do Sistema',
    'admin@rifadash.com',
    'admin',
    'active',
    true,
    '+55 11 99999-9999'
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    status = 'active',
    email_verified = true,
    updated_at = NOW();

-- ============================================================================
-- OPÇÕES ALTERNATIVAS
-- ============================================================================

-- Opção 2: Atualizar usuário existente para admin (por email)
-- Descomente e substitua o email pelo usuário que deseja tornar admin
/*
UPDATE users 
SET 
    role = 'admin',
    status = 'active',
    email_verified = true,
    updated_at = NOW()
WHERE email = 'seuemail@exemplo.com';
*/

-- Opção 3: Atualizar usuário existente para admin (por ID)
-- Descomente e substitua o ID pelo usuário que deseja tornar admin
/*
UPDATE users 
SET 
    role = 'admin',
    status = 'active',
    email_verified = true,
    updated_at = NOW()
WHERE id = 'seu-uuid-aqui';
*/

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar se o usuário admin foi criado/atualizado corretamente
SELECT 
    id,
    name,
    email,
    role,
    status,
    email_verified,
    created_at,
    updated_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at;

-- ============================================================================
-- INFORMAÇÕES ADICIONAIS
-- ============================================================================

-- Listar todos os usuários e seus papéis
SELECT 
    name,
    email,
    role,
    status,
    email_verified,
    created_at
FROM users 
ORDER BY role, created_at;

-- Contar usuários por papel
SELECT 
    role,
    COUNT(*) as total
FROM users 
GROUP BY role
ORDER BY role;