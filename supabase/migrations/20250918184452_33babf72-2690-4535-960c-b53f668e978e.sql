-- Criar registro de afiliado para o usuário atual se não existir
INSERT INTO public.affiliates (user_id, affiliate_code)
SELECT '93ef602d-1091-4fa8-b8e9-d0605e7d67fc', generate_affiliate_code()
WHERE NOT EXISTS (
  SELECT 1 FROM public.affiliates 
  WHERE user_id = '93ef602d-1091-4fa8-b8e9-d0605e7d67fc'
);