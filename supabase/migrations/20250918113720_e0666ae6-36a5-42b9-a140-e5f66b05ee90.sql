-- ================================================
-- CRIAR TRIGGER PARA NOVOS USUÁRIOS E CONFIGURAR ADMIN
-- ================================================

-- 1. Criar trigger para novos usuários
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Inserir usuários existentes do auth.users na tabela users (se existirem)
INSERT INTO public.users (id, email, name, role, status, created_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', email), 
  'user', 
  'active',
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- 3. Criar um usuário admin se não existir nenhum
INSERT INTO public.users (id, email, name, role, status, created_at)
SELECT 
  gen_random_uuid(),
  'admin@admin.com',
  'Administrador',
  'admin',
  'active',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE role = 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 4. Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';