-- Fix SECURITY DEFINER functions to improve security

-- 1. Convert get_testimonial_stats to SECURITY INVOKER since it only reads public data
CREATE OR REPLACE FUNCTION public.get_testimonial_stats(raffle_id_param uuid)
 RETURNS TABLE(total_testimonials bigint, average_rating numeric, rating_distribution jsonb)
 LANGUAGE plpgsql
 SECURITY INVOKER  -- Changed from SECURITY DEFINER
AS $function$
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
  AND status = 'approved';  -- Only approved testimonials are public
END;
$function$;

-- 2. Keep is_admin as SECURITY DEFINER but add additional security checks
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER  -- Keep as SECURITY DEFINER but with improved security
 SET search_path = public  -- Prevent search_path attacks
AS $function$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'  -- Add status check for additional security
  );
END;
$function$;

-- 3. Keep handle_new_user as SECURITY DEFINER but improve security
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER  -- Keep as SECURITY DEFINER but with improved security
 SET search_path = public  -- Prevent search_path attacks
AS $function$
BEGIN
  -- Additional validation
  IF NEW.id IS NULL OR NEW.email IS NULL THEN
    RAISE EXCEPTION 'Invalid user data';
  END IF;
  
  INSERT INTO users (id, email, role, created_at, status)
  VALUES (NEW.id, NEW.email, 'user', NOW(), 'active');
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle case where user already exists
    RETURN NEW;
END;
$function$;