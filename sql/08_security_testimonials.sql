-- =====================================================
-- POLÍTICAS DE SEGURANÇA RLS - TABELA TESTIMONIALS
-- =====================================================
-- Este script configura Row Level Security (RLS) para a tabela testimonials
-- Leitura pública para depoimentos aprovados
-- Usuários podem criar e editar seus próprios depoimentos
-- Admins podem moderar todos os depoimentos

-- Habilitar RLS na tabela testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE LEITURA (SELECT)
-- =====================================================

-- Política: Leitura pública de depoimentos aprovados
CREATE POLICY "Leitura pública de depoimentos aprovados"
ON testimonials
FOR SELECT
USING (
  status = 'approved'
);

-- Política: Usuários podem ver seus próprios depoimentos
CREATE POLICY "Usuários podem ver seus próprios depoimentos"
ON testimonials
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Política: Admins podem ver todos os depoimentos
CREATE POLICY "Admins podem ver todos os depoimentos"
ON testimonials
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

-- Política: Usuários autenticados podem criar depoimentos
CREATE POLICY "Usuários podem criar depoimentos"
ON testimonials
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  -- Depoimentos começam como pendentes
  (status IS NULL OR status = 'pending')
);

-- Política: Admins podem criar depoimentos com qualquer status
CREATE POLICY "Admins podem criar depoimentos com qualquer status"
ON testimonials
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

-- Política: Usuários podem editar seus próprios depoimentos pendentes
CREATE POLICY "Usuários podem editar depoimentos pendentes"
ON testimonials
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() AND
  status = 'pending'
)
WITH CHECK (
  user_id = auth.uid() AND
  -- Não permitir que usuários alterem o status
  status = 'pending'
);

-- Política: Admins podem atualizar qualquer depoimento
CREATE POLICY "Admins podem moderar depoimentos"
ON testimonials
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

-- Política: Usuários podem deletar seus próprios depoimentos pendentes
CREATE POLICY "Usuários podem deletar depoimentos pendentes"
ON testimonials
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() AND
  status = 'pending'
);

-- Política: Admins podem deletar qualquer depoimento
CREATE POLICY "Admins podem deletar qualquer depoimento"
ON testimonials
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
-- VIEW PARA DEPOIMENTOS PÚBLICOS
-- =====================================================

-- Criar uma view para depoimentos públicos com informações do usuário
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

-- Permitir acesso público à view de depoimentos
GRANT SELECT ON public_testimonials TO anon, authenticated;

-- =====================================================
-- FUNÇÃO PARA MODERAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para verificar conteúdo e aprovar automaticamente depoimentos simples
CREATE OR REPLACE FUNCTION auto_moderate_testimonial()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-aprovar depoimentos com rating alto e conteúdo curto
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
-- FUNÇÃO PARA ESTATÍSTICAS DE DEPOIMENTOS
-- =====================================================

-- Função para obter estatísticas de depoimentos por rifa
CREATE OR REPLACE FUNCTION get_testimonial_stats(raffle_id_param UUID)
RETURNS TABLE(
  total_testimonials BIGINT,
  average_rating NUMERIC,
  rating_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_testimonials,
    ROUND(AVG(rating), 2) as average_rating,
    JSONB_BUILD_OBJECT(
      '5_stars', COUNT(*) FILTER (WHERE rating = 5),
      '4_stars', COUNT(*) FILTER (WHERE rating = 4),
      '3_stars', COUNT(*) FILTER (WHERE rating = 3),
      '2_stars', COUNT(*) FILTER (WHERE rating = 2),
      '1_star', COUNT(*) FILTER (WHERE rating = 1)
    ) as rating_distribution
  FROM testimonials 
  WHERE raffle_id = raffle_id_param 
  AND status = 'approved';
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
WHERE tablename = 'testimonials'
ORDER BY policyname;

-- =====================================================
-- TESTE DE SEGURANÇA
-- =====================================================

-- Para testar as políticas, execute estas queries como diferentes usuários:

-- 1. Como usuário não autenticado (deve ver apenas depoimentos aprovados):
-- SELECT * FROM testimonials;
-- SELECT * FROM public_testimonials;

-- 2. Como usuário autenticado (deve ver depoimentos aprovados + próprios):
-- SELECT * FROM testimonials;

-- 3. Como admin (deve ver todos os depoimentos):
-- SELECT * FROM testimonials;

-- 4. Criar um depoimento (deve funcionar):
-- INSERT INTO testimonials (user_id, content, rating, raffle_id) 
-- VALUES (auth.uid(), 'Ótima rifa!', 5, 'uuid-da-rifa');

-- 5. Obter estatísticas de uma rifa:
-- SELECT * FROM get_testimonial_stats('uuid-da-rifa');

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
IMPORTANTE: 
1. Depoimentos aprovados são públicos
2. Usuários podem criar e editar apenas depoimentos pendentes
3. Admins podem moderar todos os depoimentos
4. Moderação automática para depoimentos simples
5. View pública com informações completas

SEGURANÇA:
- Público: Pode ver apenas depoimentos aprovados
- Usuários: Podem criar e editar próprios depoimentos pendentes
- Administradores: Acesso total para moderação

FUNCIONALIDADES:
- Moderação automática baseada em rating e tamanho
- View pública com informações do usuário e rifa
- Função para estatísticas detalhadas
- Controle de status (pending/approved/rejected)

MODERAÇÃO:
- Depoimentos com rating ≥ 4 e ≤ 200 caracteres: aprovação automática
- Outros depoimentos: ficam pendentes para moderação manual
- Admins podem aprovar/rejeitar manualmente

PRÓXIMOS PASSOS:
1. Execute este script no SQL Editor do Supabase
2. Teste a criação e moderação de depoimentos
3. Verifique se a view pública está funcionando
4. Configure notificações para novos depoimentos pendentes
*/