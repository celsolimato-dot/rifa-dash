-- Adicionar constraint única para evitar referências duplicadas
ALTER TABLE referrals 
ADD CONSTRAINT unique_referral_pair 
UNIQUE (referrer_id, referred_user_id);

-- Ajustar função de trigger para inserir o usuário na tabela users se necessário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public 
AS $$
BEGIN
  -- Inserir perfil
  INSERT INTO public.profiles (id, name, cpf, phone)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'cpf', 
    NEW.raw_user_meta_data ->> 'phone'
  );
  
  -- Inserir ou atualizar usuário na tabela users (sem referrer_id ainda)
  INSERT INTO public.users (
    id, 
    name, 
    email, 
    role, 
    status, 
    email_verified
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NEW.email,
    'user',
    'active',
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    updated_at = now();
    
  RETURN NEW;
END;
$$;