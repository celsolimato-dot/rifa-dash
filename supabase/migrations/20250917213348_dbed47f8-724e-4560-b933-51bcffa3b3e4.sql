-- Fix infinite recursion in users table RLS policies
-- The problem is that policies are referencing the same table they're protecting

-- First, drop all existing policies on users table
DROP POLICY IF EXISTS "Admins podem criar qualquer usuário" ON users;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON users;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON users;
DROP POLICY IF EXISTS "Leitura pública de informações básicas" ON users;
DROP POLICY IF EXISTS "Permitir criação de perfil próprio" ON users;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON users;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer usuário" ON users;
DROP POLICY IF EXISTS "Usuários podem deletar seu próprio perfil" ON users;
DROP POLICY IF EXISTS "Admins podem deletar usuários não-admin" ON users;

-- Create new policies without recursion
-- Use the is_admin() function which is SECURITY DEFINER to avoid recursion

-- SELECT policies
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all users"
ON users FOR SELECT  
TO authenticated
USING (public.is_admin());

CREATE POLICY "Public read for basic info"
ON users FOR SELECT
TO anon, authenticated
USING (true);

-- INSERT policies
CREATE POLICY "Users can create their own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid() AND (role IS NULL OR role = 'user'));

CREATE POLICY "Admins can create any user"
ON users FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- UPDATE policies
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND (role = (SELECT role FROM users WHERE id = auth.uid()) OR role IS NULL));

CREATE POLICY "Admins can update any user"
ON users FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- DELETE policies
CREATE POLICY "Users can delete their own profile"
ON users FOR DELETE
TO authenticated
USING (id = auth.uid() AND role != 'admin');

CREATE POLICY "Admins can delete non-admin users"
ON users FOR DELETE
TO authenticated
USING (public.is_admin() AND role != 'admin');