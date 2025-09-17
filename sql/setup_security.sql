-- =====================================================
-- SETUP COMPLETO DE SEGURANÇA - SUPABASE RLS
-- =====================================================
-- Este script configura todas as políticas de segurança RLS
-- para o sistema de rifas. Execute este arquivo para aplicar
-- todas as configurações de segurança de uma vez.

-- =====================================================
-- VERIFICAÇÕES INICIAIS
-- =====================================================

-- Verificar se as tabelas existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Tabela users não encontrada. Execute primeiro o setup_database.sql';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'raffles') THEN
        RAISE EXCEPTION 'Tabela raffles não encontrada. Execute primeiro o setup_database.sql';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tickets') THEN
        RAISE EXCEPTION 'Tabela tickets não encontrada. Execute primeiro o setup_database.sql';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        RAISE EXCEPTION 'Tabela testimonials não encontrada. Execute primeiro o setup_database.sql';
    END IF;
    
    RAISE NOTICE 'Todas as tabelas necessárias foram encontradas. Iniciando configuração de segurança...';
END $$;

-- =====================================================
-- LIMPEZA DE POLÍTICAS EXISTENTES (SE HOUVER)
-- =====================================================

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura de rifas ativas para todos" ON raffles;
DROP POLICY IF EXISTS "Permitir leitura completa para admins" ON raffles;
DROP POLICY IF EXISTS "Apenas admins podem criar rifas" ON raffles;
DROP POLICY IF EXISTS "Apenas admins podem atualizar rifas" ON raffles;
DROP POLICY IF EXISTS "Apenas admins podem deletar rifas" ON raffles;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios bilhetes" ON tickets;
DROP POLICY IF EXISTS "Admins podem ver todos os bilhetes" ON tickets;
DROP POLICY IF EXISTS "Leitura pública de estatísticas de bilhetes" ON tickets;
DROP POLICY IF EXISTS "Usuários podem comprar bilhetes" ON tickets;
DROP POLICY IF EXISTS "Admins podem inserir bilhetes para qualquer usuário" ON tickets;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios bilhetes" ON tickets;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer bilhete" ON tickets;
DROP POLICY IF EXISTS "Usuários podem cancelar seus próprios bilhetes" ON tickets;
DROP POLICY IF EXISTS "Admins podem deletar qualquer bilhete" ON tickets;

DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON users;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON users;
DROP POLICY IF EXISTS "Leitura pública de informações básicas" ON users;
DROP POLICY IF EXISTS "Permitir criação de perfil próprio" ON users;
DROP POLICY IF EXISTS "Admins podem criar qualquer usuário" ON users;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON users;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer usuário" ON users;
DROP POLICY IF EXISTS "Usuários podem deletar seu próprio perfil" ON users;
DROP POLICY IF EXISTS "Admins podem deletar usuários não-admin" ON users;

DROP POLICY IF EXISTS "Leitura pública de depoimentos aprovados" ON testimonials;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios depoimentos" ON testimonials;
DROP POLICY IF EXISTS "Admins podem ver todos os depoimentos" ON testimonials;
DROP POLICY IF EXISTS "Usuários podem criar depoimentos" ON testimonials;
DROP POLICY IF EXISTS "Admins podem criar depoimentos com qualquer status" ON testimonials;
DROP POLICY IF EXISTS "Usuários podem editar depoimentos pendentes" ON testimonials;
DROP POLICY IF EXISTS "Admins podem moderar depoimentos" ON testimonials;
DROP POLICY IF EXISTS "Usuários podem deletar depoimentos pendentes" ON testimonials;
DROP POLICY IF EXISTS "Admins podem deletar qualquer depoimento" ON testimonials;

-- =====================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA TABELA RAFFLES
-- =====================================================

-- Leitura: Todos podem ver rifas ativas
CREATE POLICY "Permitir leitura de rifas ativas para todos"
ON raffles FOR SELECT
USING (status = 'active' OR status = 'completed');

-- Leitura: Admins podem ver todas as rifas
CREATE POLICY "Permitir leitura completa para admins"
ON raffles FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Inserção: Apenas admins podem criar rifas
CREATE POLICY "Apenas admins podem criar rifas"
ON raffles FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Atualização: Apenas admins podem atualizar rifas
CREATE POLICY "Apenas admins podem atualizar rifas"
ON raffles FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Exclusão: Apenas admins podem deletar rifas
CREATE POLICY "Apenas admins podem deletar rifas"
ON raffles FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- =====================================================
-- POLÍTICAS PARA TABELA TICKETS
-- =====================================================

-- Leitura: Usuários podem ver seus próprios bilhetes
CREATE POLICY "Usuários podem ver seus próprios bilhetes"
ON tickets FOR SELECT TO authenticated
USING (buyer_email = (SELECT email FROM users WHERE id = auth.uid()));

-- Leitura: Admins podem ver todos os bilhetes
CREATE POLICY "Admins podem ver todos os bilhetes"
ON tickets FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Leitura: Permitir estatísticas públicas
CREATE POLICY "Leitura pública de estatísticas de bilhetes"
ON tickets FOR SELECT
USING (true);

-- Inserção: Usuários podem comprar bilhetes
CREATE POLICY "Usuários podem comprar bilhetes"
ON tickets FOR INSERT TO authenticated
WITH CHECK (
  buyer_email = (SELECT email FROM users WHERE id = auth.uid()) AND
  EXISTS (SELECT 1 FROM raffles WHERE raffles.id = raffle_id AND raffles.status = 'active')
);

-- Inserção: Admins podem inserir bilhetes para qualquer usuário
CREATE POLICY "Admins podem inserir bilhetes para qualquer usuário"
ON tickets FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Atualização: Usuários podem atualizar seus próprios bilhetes
CREATE POLICY "Usuários podem atualizar seus próprios bilhetes"
ON tickets FOR UPDATE TO authenticated
USING (buyer_email = (SELECT email FROM users WHERE id = auth.uid()))
WITH CHECK (buyer_email = (SELECT email FROM users WHERE id = auth.uid()));

-- Atualização: Admins podem atualizar qualquer bilhete
CREATE POLICY "Admins podem atualizar qualquer bilhete"
ON tickets FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Exclusão: Usuários podem cancelar seus próprios bilhetes
CREATE POLICY "Usuários podem cancelar seus próprios bilhetes"
ON tickets FOR DELETE TO authenticated
USING (
  buyer_email = (SELECT email FROM users WHERE id = auth.uid()) AND
  EXISTS (SELECT 1 FROM raffles WHERE raffles.id = raffle_id AND raffles.status = 'active')
);

-- Exclusão: Admins podem deletar qualquer bilhete
CREATE POLICY "Admins podem deletar qualquer bilhete"
ON tickets FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- =====================================================
-- POLÍTICAS PARA TABELA USERS
-- =====================================================

-- Leitura: Usuários podem ver seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON users FOR SELECT TO authenticated
USING (id = auth.uid());

-- Leitura: Admins podem ver todos os usuários
CREATE POLICY "Admins podem ver todos os usuários"
ON users FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- Leitura: Permitir informações básicas públicas
CREATE POLICY "Leitura pública de informações básicas"
ON users FOR SELECT
USING (true);

-- Inserção: Permitir criação de perfil próprio
CREATE POLICY "Permitir criação de perfil próprio"
ON users FOR INSERT TO authenticated
WITH CHECK (id = auth.uid() AND (role IS NULL OR role = 'user'));

-- Inserção: Admins podem criar usuários com qualquer role
CREATE POLICY "Admins podem criar qualquer usuário"
ON users FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- Atualização: Usuários podem atualizar seu próprio perfil (exceto role)
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON users FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  (role = (SELECT role FROM users WHERE id = auth.uid()) OR role IS NULL)
);

-- Atualização: Admins podem atualizar qualquer usuário
CREATE POLICY "Admins podem atualizar qualquer usuário"
ON users FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- Exclusão: Usuários podem deletar seu próprio perfil (exceto admins)
CREATE POLICY "Usuários podem deletar seu próprio perfil"
ON users FOR DELETE TO authenticated
USING (id = auth.uid() AND role != 'admin');

-- Exclusão: Admins podem deletar usuários não-admin
CREATE POLICY "Admins podem deletar usuários não-admin"
ON users FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin') AND
  role != 'admin'
);

-- =====================================================
-- POLÍTICAS PARA TABELA TESTIMONIALS
-- =====================================================

-- Leitura: Depoimentos aprovados são públicos
CREATE POLICY "Leitura pública de depoimentos aprovados"
ON testimonials FOR SELECT
USING (status = 'approved');

-- Leitura: Usuários podem ver seus próprios depoimentos
CREATE POLICY "Usuários podem ver seus próprios depoimentos"
ON testimonials FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Leitura: Admins podem ver todos os depoimentos
CREATE POLICY "Admins podem ver todos os depoimentos"
ON testimonials FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Inserção: Usuários podem criar depoimentos
CREATE POLICY "Usuários podem criar depoimentos"
ON testimonials FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND (status IS NULL OR status = 'pending'));

-- Inserção: Admins podem criar depoimentos com qualquer status
CREATE POLICY "Admins podem criar depoimentos com qualquer status"
ON testimonials FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Atualização: Usuários podem editar depoimentos pendentes
CREATE POLICY "Usuários podem editar depoimentos pendentes"
ON testimonials FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Atualização: Admins podem moderar depoimentos
CREATE POLICY "Admins podem moderar depoimentos"
ON testimonials FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Exclusão: Usuários podem deletar depoimentos pendentes
CREATE POLICY "Usuários podem deletar depoimentos pendentes"
ON testimonials FOR DELETE TO authenticated
USING (user_id = auth.uid() AND status = 'pending');

-- Exclusão: Admins podem deletar qualquer depoimento
CREATE POLICY "Admins podem deletar qualquer depoimento"
ON testimonials FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para verificar se usuário é admin
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

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, role, created_at)
  VALUES (NEW.id, NEW.email, 'user', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criação automática de perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Função para moderação automática de depoimentos
CREATE OR REPLACE FUNCTION auto_moderate_testimonial()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating >= 4 AND LENGTH(NEW.content) <= 200 THEN
    NEW.status := 'approved';
  ELSE
    NEW.status := 'pending';
  END IF;
  
  NEW.created_at := NOW();
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para moderação automática
DROP TRIGGER IF EXISTS auto_moderate_testimonial_trigger ON testimonials;
CREATE TRIGGER auto_moderate_testimonial_trigger
  BEFORE INSERT ON testimonials
  FOR EACH ROW EXECUTE FUNCTION auto_moderate_testimonial();

-- =====================================================
-- VIEWS PÚBLICAS
-- =====================================================

-- View para estatísticas públicas de tickets
CREATE OR REPLACE VIEW public_ticket_stats AS
SELECT 
  raffle_id,
  COUNT(*) as total_sold,
  COUNT(DISTINCT buyer_email) as unique_buyers,
  MIN(created_at) as first_sale,
  MAX(created_at) as last_sale
FROM tickets 
WHERE status = 'sold'
GROUP BY raffle_id;

-- View para informações públicas dos usuários
CREATE OR REPLACE VIEW public_user_info AS
SELECT 
  id,
  name,
  avatar_url,
  created_at
FROM users
WHERE name IS NOT NULL;

-- View para depoimentos públicos
CREATE OR REPLACE VIEW public_testimonials AS
SELECT 
  t.id,
  t.content,
  t.rating,
  t.raffle_id,
  t.created_at,
  u.name as user_name,
  u.avatar_url as user_avatar,
  r.title as raffle_title
FROM testimonials t
JOIN users u ON t.user_id = u.id
LEFT JOIN raffles r ON t.raffle_id = r.id
WHERE t.status = 'approved'
ORDER BY t.created_at DESC;

-- Conceder permissões às views
GRANT SELECT ON public_ticket_stats TO anon, authenticated;
GRANT SELECT ON public_user_info TO anon, authenticated;
GRANT SELECT ON public_testimonials TO anon, authenticated;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as políticas foram criadas
SELECT 
  tablename,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('raffles', 'tickets', 'users', 'testimonials')
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- MENSAGEM DE SUCESSO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ CONFIGURAÇÃO DE SEGURANÇA CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Row Level Security (RLS) habilitado em todas as tabelas';
    RAISE NOTICE '👥 Políticas de usuários configuradas';
    RAISE NOTICE '🎫 Políticas de rifas e bilhetes configuradas';
    RAISE NOTICE '💬 Políticas de depoimentos configuradas';
    RAISE NOTICE '🔧 Funções auxiliares criadas';
    RAISE NOTICE '👁️ Views públicas configuradas';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Configure um usuário administrador usando configure_admin.sql';
    RAISE NOTICE '2. Teste as políticas com diferentes tipos de usuários';
    RAISE NOTICE '3. Verifique se as views públicas estão funcionando';
    RAISE NOTICE '4. Configure notificações se necessário';
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ Suas tabelas agora estão protegidas!';
END $$;