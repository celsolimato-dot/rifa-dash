-- Adicionar política RLS para permitir que admins insiram configurações de afiliados
CREATE POLICY "Admins podem inserir configurações de afiliados" 
ON affiliate_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Garantir que a função get_affiliate_settings funciona para todos os usuários autenticados
REVOKE ALL ON FUNCTION get_affiliate_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_affiliate_settings() TO authenticated;