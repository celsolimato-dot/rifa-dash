-- Corrigir função get_affiliate_settings para retornar o registro mais recente
CREATE OR REPLACE FUNCTION public.get_affiliate_settings()
RETURNS TABLE(commission_percentage numeric, min_payout numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(s.commission_percentage, 10.0) as commission_percentage,
    COALESCE(s.min_payout, 50.0) as min_payout
  FROM (
    SELECT 
      affiliate_settings.commission_percentage,
      affiliate_settings.min_payout
    FROM affiliate_settings 
    ORDER BY created_at DESC
    LIMIT 1
  ) s
  UNION ALL
  SELECT 10.0, 50.0
  LIMIT 1;
END;
$function$