-- Criar tabela de configurações do sistema
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name character varying NOT NULL DEFAULT 'RIFOU.NET',
  site_description text DEFAULT 'Sistema completo de gerenciamento de rifas online',
  contact_email character varying NOT NULL DEFAULT 'contato@rifou.net',
  contact_phone character varying NOT NULL DEFAULT '(63) 99294-0044',
  contact_city character varying NOT NULL DEFAULT 'Palmas, TO',
  contact_cnpj character varying DEFAULT 'XX.XXX.XXX/0001-XX',
  timezone character varying NOT NULL DEFAULT 'America/Sao_Paulo',
  language character varying NOT NULL DEFAULT 'pt-BR',
  currency character varying NOT NULL DEFAULT 'BRL',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Leitura pública das configurações" 
ON public.settings 
FOR SELECT 
USING (true);

CREATE POLICY "Apenas admins podem atualizar configurações" 
ON public.settings 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Apenas admins podem criar configurações" 
ON public.settings 
FOR INSERT 
WITH CHECK (is_admin());

-- Inserir configuração inicial
INSERT INTO public.settings (
  site_name,
  site_description,
  contact_email,
  contact_phone,
  contact_city,
  contact_cnpj
) VALUES (
  'RIFOU.NET',
  'A plataforma de rifas mais confiável do Brasil. Sorteios transparentes, prêmios garantidos e a chance de realizar seus sonhos.',
  'contato@rifou.net',
  '(63) 99294-0044',
  'Palmas, TO',
  'XX.XXX.XXX/0001-XX'
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();