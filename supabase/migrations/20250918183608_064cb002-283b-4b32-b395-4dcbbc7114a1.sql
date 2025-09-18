-- Criar tabela de configurações de afiliados
CREATE TABLE public.affiliate_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commission_percentage numeric NOT NULL DEFAULT 10.0,
  min_payout numeric NOT NULL DEFAULT 50.0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO public.affiliate_settings (commission_percentage, min_payout) 
VALUES (10.0, 50.0);

-- Habilitar RLS
ALTER TABLE public.affiliate_settings ENABLE ROW LEVEL SECURITY;

-- Política para admins lerem e atualizarem
CREATE POLICY "Admins podem ver configurações de afiliados" 
ON public.affiliate_settings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins podem atualizar configurações de afiliados" 
ON public.affiliate_settings 
FOR UPDATE 
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

-- Criar tabela de afiliados
CREATE TABLE public.affiliates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  affiliate_code varchar NOT NULL UNIQUE,
  total_referrals integer NOT NULL DEFAULT 0,
  total_commission numeric NOT NULL DEFAULT 0,
  available_balance numeric NOT NULL DEFAULT 0,
  total_withdrawn numeric NOT NULL DEFAULT 0,
  status varchar NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários verem seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados de afiliado" 
ON public.affiliates 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Usuários podem criar dados de afiliado" 
ON public.affiliates 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus próprios dados de afiliado" 
ON public.affiliates 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Políticas para admins
CREATE POLICY "Admins podem ver todos os afiliados" 
ON public.affiliates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins podem atualizar qualquer afiliado" 
ON public.affiliates 
FOR UPDATE 
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

-- Criar tabela de referências
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  commission_earned numeric NOT NULL DEFAULT 0,
  commission_percentage numeric NOT NULL,
  status varchar NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Políticas para referrals
CREATE POLICY "Usuários podem ver suas próprias referências" 
ON public.referrals 
FOR SELECT 
USING (referrer_id = auth.uid());

CREATE POLICY "Sistema pode criar referências" 
ON public.referrals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins podem ver todas as referências" 
ON public.referrals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Adicionar campo referrer_id na tabela users
ALTER TABLE public.users ADD COLUMN referrer_id uuid;

-- Função para gerar código de afiliado único
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code text;
  exists_code boolean;
BEGIN
  LOOP
    -- Gerar código de 8 caracteres alfanuméricos
    code := upper(substring(md5(random()::text), 1, 8));
    
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM affiliates WHERE affiliate_code = code) INTO exists_code;
    
    -- Se não existe, usar este código
    IF NOT exists_code THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Função para criar afiliado automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION public.create_affiliate_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar afiliado para o novo usuário
  INSERT INTO public.affiliates (user_id, affiliate_code)
  VALUES (NEW.id, generate_affiliate_code());
  
  RETURN NEW;
END;
$$;

-- Criar trigger para criar afiliado automaticamente
CREATE TRIGGER create_affiliate_on_user_creation
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_affiliate_for_user();

-- Função para atualizar estatísticas do afiliado
CREATE OR REPLACE FUNCTION public.update_affiliate_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar estatísticas do afiliado
  UPDATE public.affiliates
  SET 
    total_referrals = (
      SELECT COUNT(*) FROM referrals 
      WHERE referrer_id = NEW.referrer_id
    ),
    total_commission = (
      SELECT COALESCE(SUM(commission_earned), 0) FROM referrals 
      WHERE referrer_id = NEW.referrer_id AND status = 'confirmed'
    ),
    available_balance = (
      SELECT COALESCE(SUM(commission_earned), 0) FROM referrals 
      WHERE referrer_id = NEW.referrer_id AND status = 'confirmed'
    ) - total_withdrawn,
    updated_at = now()
  WHERE user_id = NEW.referrer_id;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar estatísticas
CREATE TRIGGER update_affiliate_stats_on_referral
  AFTER INSERT OR UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_affiliate_stats();

-- Criar trigger para updated_at
CREATE TRIGGER update_affiliate_settings_updated_at
  BEFORE UPDATE ON public.affiliate_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();