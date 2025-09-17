-- =====================================================
-- CONFIGURAÇÃO DE SEGURANÇA PARA VIEWS PÚBLICAS
-- =====================================================
-- Este script configura RLS (Row Level Security) para as views públicas
-- que estavam aparecendo como "Unrestricted" no Supabase

-- =====================================================
-- HABILITAR RLS NAS VIEWS
-- =====================================================

-- Habilitar RLS na view de estatísticas de tickets
ALTER VIEW public_ticket_stats ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na view de informações públicas de usuários
ALTER VIEW public_user_info ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na view de depoimentos públicos
ALTER VIEW public_testimonials ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA VIEW public_ticket_stats
-- =====================================================

-- Política para permitir leitura pública das estatísticas de tickets
CREATE POLICY "Public access to ticket statistics" ON public_ticket_stats
FOR SELECT
TO anon, authenticated
USING (true);

-- =====================================================
-- POLÍTICAS PARA VIEW public_user_info
-- =====================================================

-- Política para permitir leitura pública das informações básicas de usuários
CREATE POLICY "Public access to user info" ON public_user_info
FOR SELECT
TO anon, authenticated
USING (true);

-- =====================================================
-- POLÍTICAS PARA VIEW public_testimonials
-- =====================================================

-- Política para permitir leitura pública dos depoimentos aprovados
CREATE POLICY "Public access to approved testimonials" ON public_testimonials
FOR SELECT
TO anon, authenticated
USING (true);

-- =====================================================
-- VERIFICAÇÃO DAS POLÍTICAS
-- =====================================================

-- Verificar se as políticas foram criadas corretamente
DO $$
BEGIN
    -- Verificar políticas da view public_ticket_stats
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'public_ticket_stats'
        AND policyname = 'Public access to ticket statistics'
    ) THEN
        RAISE NOTICE 'AVISO: Política para public_ticket_stats não foi criada';
    ELSE
        RAISE NOTICE 'OK: Política para public_ticket_stats criada com sucesso';
    END IF;

    -- Verificar políticas da view public_user_info
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'public_user_info'
        AND policyname = 'Public access to user info'
    ) THEN
        RAISE NOTICE 'AVISO: Política para public_user_info não foi criada';
    ELSE
        RAISE NOTICE 'OK: Política para public_user_info criada com sucesso';
    END IF;

    -- Verificar políticas da view public_testimonials
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'public_testimonials'
        AND policyname = 'Public access to approved testimonials'
    ) THEN
        RAISE NOTICE 'AVISO: Política para public_testimonials não foi criada';
    ELSE
        RAISE NOTICE 'OK: Política para public_testimonials criada com sucesso';
    END IF;
END $$;

-- =====================================================
-- COMANDOS DE TESTE
-- =====================================================

-- Testar acesso às views como usuário anônimo
-- SET ROLE anon;
-- SELECT COUNT(*) FROM public_ticket_stats;
-- SELECT COUNT(*) FROM public_user_info;
-- SELECT COUNT(*) FROM public_testimonials;
-- RESET ROLE;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
1. Este script resolve o problema de views "Unrestricted" no Supabase
2. As views agora têm RLS habilitado com políticas que permitem acesso público
3. Isso é seguro porque as views já filtram apenas dados apropriados para exposição pública
4. As políticas USING (true) permitem acesso total às views, mas as views em si já limitam os dados
5. Execute este script após os outros scripts de segurança

ORDEM DE EXECUÇÃO:
1. setup_database.sql
2. setup_security.sql
3. 09_security_views.sql (este arquivo)

VERIFICAÇÃO NO SUPABASE:
- Vá para Authentication > Policies
- Verifique se as views não aparecem mais como "Unrestricted"
- Teste o acesso às views tanto como usuário autenticado quanto anônimo
*/